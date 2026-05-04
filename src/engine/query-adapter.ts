/**
 * QueryAdapter — wraps the QueryController Bases hands to a custom view.
 *
 * Why this exists:
 *  - Insulates views from Bases internals so a future engine swap (Dataview,
 *    raw MetadataCache) needs to change only this file.
 *  - Normalises raw BasesEntry records into ViewEntry once per data tick
 *    (so views don't re-coerce in the hot path).
 *  - Exposes a single subscribe() rather than two events.
 */

import type {
	BasesEntry,
	PropertyDescriptor,
	QueryController,
	ViewEntry,
} from '../types';

export class QueryAdapter {
	private cachedEntries: readonly ViewEntry[] | null = null;

	constructor(private readonly controller: QueryController) {}

	/** Cached, normalised snapshot. Recomputed when invalidate() is called. */
	snapshot(): readonly ViewEntry[] {
		// If cachedEntries is non-null, return it.
		// Otherwise:
		//   - Read raw = this.controller.getEntries()
		//   - Map each BasesEntry → ViewEntry:
		//       file, displayName=file.basename (or properties.title if string),
		//       frontmatter=app.metadataCache.getFileCache(file)?.frontmatter ?? null,
		//       properties=raw.properties (passthrough — Bases already merged
		//       frontmatter + computed formulas).
		//   - Cache and return.
		throw new Error('not implemented');
	}

	properties(): readonly PropertyDescriptor[] {
		return this.controller.getProperties();
	}

	getViewConfig<T = unknown>(): T {
		return this.controller.getViewConfig<T>();
	}

	saveViewConfig<T = unknown>(patch: Partial<T>): Promise<void> {
		return this.controller.saveViewConfig<T>(patch);
	}

	/**
	 * Subscribe to either kind of update. The callback is invoked with no args
	 * — pull a fresh snapshot if you need data.
	 *
	 * Returns an unsubscriber.  AbstractView wraps this with this.register(...)
	 * so cleanup is automatic.
	 */
	subscribe(cb: () => void): () => void {
		const offData = this.controller.on('data-updated', () => {
			this.cachedEntries = null;
			cb();
		});
		const offConfig = this.controller.on('config-updated', () => {
			// Config changes don't invalidate entries themselves, but the view
			// needs to re-render with the new config blob.
			cb();
		});
		return () => {
			offData();
			offConfig();
		};
	}
}
