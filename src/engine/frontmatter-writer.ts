/**
 * Single chokepoint for all frontmatter property mutations.
 * Uses app.fileManager.processFrontMatter for atomic, race-safe writes.
 */

import type { App, TFile } from 'obsidian';
import type { PropertyType } from '../types';

export class FrontmatterWriter {
	/** Per-file promise chain to prevent interleaved writes. */
	private readonly queues = new Map<string, Promise<void>>();

	constructor(private readonly app: App) {}

	async set(file: TFile, property: string, value: unknown, type?: PropertyType): Promise<void> {
		const prev = this.queues.get(file.path) ?? Promise.resolve();
		const next = prev.then(() =>
			this.app.fileManager.processFrontMatter(file, (fm) => {
				if (value === null || value === undefined) {
					delete fm[property];
				} else {
					fm[property] = this.coerceForWrite(value, type);
				}
			}),
		).finally(() => {
			if (this.queues.get(file.path) === next) this.queues.delete(file.path);
		});
		this.queues.set(file.path, next);
		await next;
	}

	async setMany(file: TFile, patch: Record<string, unknown>): Promise<void> {
		const prev = this.queues.get(file.path) ?? Promise.resolve();
		const next = prev.then(() =>
			this.app.fileManager.processFrontMatter(file, (fm) => {
				for (const [k, v] of Object.entries(patch)) {
					if (v === null || v === undefined) delete fm[k];
					else fm[k] = this.coerceForWrite(v);
				}
			}),
		).finally(() => {
			if (this.queues.get(file.path) === next) this.queues.delete(file.path);
		});
		this.queues.set(file.path, next);
		await next;
	}

	private coerceForWrite(value: unknown, type?: PropertyType): unknown {
		if (type === 'list' || type === 'tags') {
			return Array.isArray(value) ? value : [value];
		}
		if (type === 'number') return Number(value);
		if (type === 'boolean') return Boolean(value);
		if (Array.isArray(value)) return value;
		return value;
	}
}
