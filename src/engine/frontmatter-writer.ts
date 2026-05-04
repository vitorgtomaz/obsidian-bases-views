/**
 * FrontmatterWriter — single chokepoint for property mutations.
 *
 * Why centralised:
 *  - Atomicity: app.fileManager.processFrontMatter is the only safe API
 *    when other plugins might be writing to the same file.
 *  - Testability: a single mock point.
 *  - Type-aware coercion: lists stay lists, dates stay ISO strings.
 *  - Optional in-flight queue per file path so back-to-back drops don't race.
 */

import type { App, TFile } from 'obsidian';
import type { PropertyType } from '../types';

export class FrontmatterWriter {
	/** Per-file write queue: ensures sequential writes per file. */
	private readonly queues = new Map<string, Promise<void>>();

	constructor(private readonly app: App) {}

	/**
	 * Write `value` to `property` on `file`'s frontmatter.
	 *  - If value === null or undefined → delete the property.
	 *  - For 'list' / 'tags' types, ensure value is an array.
	 *  - For 'date' / 'datetime', store as ISO string.
	 *
	 * Resolves only after Obsidian has flushed the change to disk.
	 */
	async set(file: TFile, property: string, value: unknown, type?: PropertyType): Promise<void> {
		// Pseudocode:
		//   const prev = this.queues.get(file.path) ?? Promise.resolve()
		//   const next = prev.then(() => this.app.fileManager.processFrontMatter(file, fm => {
		//     if (value == null) delete fm[property]
		//     else fm[property] = this.coerceForWrite(value, type)
		//   }))
		//   this.queues.set(file.path, next.finally(() => {
		//     if (this.queues.get(file.path) === next) this.queues.delete(file.path)
		//   }))
		//   await next
		throw new Error('not implemented');
	}

	/** Atomic multi-property update on a single file. */
	async setMany(file: TFile, patch: Record<string, unknown>): Promise<void> {
		// Same queueing pattern; single processFrontMatter call applies the
		// whole patch object.
		throw new Error('not implemented');
	}

	/**
	 * Type-aware serialisation for write.
	 *   list/tags → ensure array
	 *   date/datetime → ISO string
	 *   number → Number(value)
	 *   boolean → Boolean(value)
	 *   string → String(value)
	 */
	private coerceForWrite(value: unknown, type?: PropertyType): unknown {
		throw new Error('not implemented');
	}
}
