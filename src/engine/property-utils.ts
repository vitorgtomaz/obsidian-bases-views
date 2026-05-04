/**
 * Pure property utilities: type detection, value coercion, search, group-by ranking.
 */

import type { PropertyDescriptor, PropertyType, ViewEntry } from '../types';

/* ------------------------------------------------------------------ */
/*  Runtime type detection for plain JS values (post-normalisation)    */
/* ------------------------------------------------------------------ */

const IMG_EXT_RX = /\.(png|jpe?g|webp|gif|svg|avif)(\?|#|$)/i;
const ISO_DATE_RX = /^\d{4}-\d{2}-\d{2}(T|$)/;
const URL_RX = /^https?:\/\//i;
const WIKILINK_RX = /^\[\[/;
const MD_LINK_RX = /^\[.+\]\(.+\)/;

export function detectType(value: unknown): PropertyType {
	if (value === null || value === undefined) return 'unknown';
	if (typeof value === 'boolean') return 'boolean';
	if (typeof value === 'number') return 'number';
	if (Array.isArray(value)) {
		const allStrings = value.every((v) => typeof v === 'string');
		if (allStrings && value.every((v: string) => v.startsWith('#'))) return 'tags';
		return 'list';
	}
	if (typeof value === 'string') {
		if (ISO_DATE_RX.test(value)) return 'date';
		if (IMG_EXT_RX.test(value)) return 'image';
		if (WIKILINK_RX.test(value) || MD_LINK_RX.test(value) || URL_RX.test(value)) return 'link';
		return 'string';
	}
	return 'unknown';
}

/* ------------------------------------------------------------------ */
/*  Search filtering                                                   */
/* ------------------------------------------------------------------ */

/** Returns true if `entry` matches `term` across the requested scopes. */
export function matchesSearch(
	entry: ViewEntry,
	term: string,
	scopes: { name: boolean; path: boolean; properties: boolean; body: boolean },
): boolean {
	const t = term.toLowerCase();
	if (scopes.name && entry.displayName.toLowerCase().includes(t)) return true;
	if (scopes.path && entry.file.path.toLowerCase().includes(t)) return true;
	if (scopes.properties) {
		for (const v of Object.values(entry.properties)) {
			if (v === null || v === undefined) continue;
			const s = Array.isArray(v) ? v.join(' ') : String(v);
			if (s.toLowerCase().includes(t)) return true;
		}
	}
	return false;
}

/* ------------------------------------------------------------------ */
/*  Group-by candidate ranking (PRD §4.5)                              */
/* ------------------------------------------------------------------ */

const INTERNAL_KEYS = new Set([
	'position', 'aliases', 'tags-source', 'cssclasses', 'cssclass',
]);

export interface GroupByCandidate {
	key: string;
	propId: string;
	type: PropertyType;
	frequency: number;   // share of entries with a non-empty value [0..1]
	distinctCount: number;
}

export function rankGroupByCandidates(
	descriptors: readonly PropertyDescriptor[],
	entries: readonly ViewEntry[],
): GroupByCandidate[] {
	if (entries.length === 0) return [];

	const candidates: GroupByCandidate[] = [];

	for (const desc of descriptors) {
		if (INTERNAL_KEYS.has(desc.key)) continue;
		// Only string/list/tags types make sense as column headers
		if (!['string', 'list', 'tags'].includes(desc.type)) continue;

		const values = entries.map((e) => e.properties[desc.key]);
		const nonEmpty = values.filter(
			(v) => v !== null && v !== undefined && v !== '' &&
				!(Array.isArray(v) && v.length === 0),
		);

		const frequency = nonEmpty.length / entries.length;
		if (frequency < 0.4) continue; // too sparse

		// Flatten lists to collect distinct scalar values
		const scalars = nonEmpty.flatMap((v) => (Array.isArray(v) ? v : [v]));
		const distinct = new Set(scalars.map(String));
		const distinctCount = distinct.size;

		if (distinctCount < 2 || distinctCount > 30) continue;

		candidates.push({ key: desc.key, propId: desc.id, type: desc.type, frequency, distinctCount });
	}

	return candidates.sort((a, b) => b.frequency - a.frequency);
}
