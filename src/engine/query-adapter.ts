/**
 * QueryAdapter — normalises BasesEntry[] → ViewEntry[] once per data tick.
 *
 * Sits between the raw Bases API (BasesView.data, BasesView.allProperties)
 * and the views. Views never touch BasesEntry or BasesPropertyId directly.
 */

import {
	BooleanValue,
	DateValue,
	ImageValue,
	LinkValue,
	ListValue,
	NullValue,
	NumberValue,
	parsePropertyId,
	type BasesEntry,
	type BasesPropertyId,
	type Value,
} from 'obsidian';

import type { PropertyDescriptor, PropertyType, ViewEntry } from '../types';

/** Convert a Bases Value to a plain JS primitive for rendering/filtering. */
export function valueToJs(v: Value | null): unknown {
	if (v === null || v instanceof NullValue) return null;
	if (v instanceof BooleanValue) return v.isTruthy();
	if (v instanceof NumberValue) return parseFloat(v.toString());
	if (v instanceof DateValue) return v.toString(); // ISO-8601
	if (v instanceof ListValue) {
		const arr: unknown[] = [];
		for (let i = 0; i < v.length(); i++) arr.push(valueToJs(v.get(i)));
		return arr;
	}
	// StringValue, ImageValue, LinkValue, TagValue, UrlValue → string
	return v.toString();
}

/** Infer our PropertyType from Value class + known Bases property id prefix. */
export function inferType(propId: BasesPropertyId, sample: Value | null): PropertyType {
	if (sample === null || sample instanceof NullValue) return 'unknown';
	if (sample instanceof BooleanValue) return 'boolean';
	if (sample instanceof NumberValue) return 'number';
	if (sample instanceof DateValue) return 'date';
	if (sample instanceof ImageValue) return 'image';
	if (sample instanceof LinkValue) return 'link';
	if (sample instanceof ListValue) {
		// Peek first element for tags heuristic
		if (sample.length() > 0) {
			const first = sample.get(0).toString();
			if (first.startsWith('#')) return 'tags';
		}
		return 'list';
	}
	const { name } = parsePropertyId(propId);
	if (name === 'tags') return 'tags';
	return 'string';
}

/** Normalise one BasesEntry into the engine's ViewEntry shape. */
export function normaliseEntry(
	entry: BasesEntry,
	propIds: readonly BasesPropertyId[],
): ViewEntry {
	const properties: Record<string, unknown> = {};
	for (const propId of propIds) {
		const { name } = parsePropertyId(propId);
		properties[name] = valueToJs(entry.getValue(propId));
	}

	const displayName =
		(typeof properties['title'] === 'string' && properties['title']) ||
		entry.file.basename;

	return {
		file: entry.file,
		displayName,
		frontmatter: null, // filled lazily by views that need raw frontmatter
		properties,
	};
}

/** Build PropertyDescriptor[] from a set of entries + property ids. */
export function deriveDescriptors(
	propIds: readonly BasesPropertyId[],
	entries: readonly BasesEntry[],
	sampleLimit = 200,
): PropertyDescriptor[] {
	return propIds.map((propId) => {
		const { name } = parsePropertyId(propId);
		const sample = entries.slice(0, sampleLimit).map((e) => e.getValue(propId));
		const nonNull = sample.filter((v) => v !== null && !(v instanceof NullValue));

		const type = nonNull.length > 0 ? inferType(propId, nonNull[0] ?? null) : 'unknown';

		let enumValues: string[] | undefined;
		if (type === 'string' && nonNull.length > 0) {
			const distinct = new Set(nonNull.map((v) => v!.toString()));
			if (distinct.size <= 30) enumValues = [...distinct].sort();
		}

		return { id: propId, key: name, type, enumValues };
	});
}
