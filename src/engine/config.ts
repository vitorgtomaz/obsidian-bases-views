/**
 * Helpers for reading/writing per-view config in the .base file.
 *
 * Bases owns the I/O — these are sugar over QueryAdapter that:
 *   - merges defaults + persisted overlay
 *   - throttles saves so dragging a setting slider doesn't write per pixel
 */

import type { QueryAdapter } from './query-adapter';

const SAVE_THROTTLE_MS = 200;

export class ViewConfigStore<TConfig extends object> {
	private pendingPatch: Partial<TConfig> | null = null;
	private flushTimer: number | null = null;

	constructor(
		private readonly adapter: QueryAdapter,
		private readonly defaults: TConfig,
	) {}

	/** Merged view of defaults + persisted config. Cheap; called on every render. */
	current(): TConfig {
		// Pseudocode: return { ...this.defaults, ...this.adapter.getViewConfig<TConfig>() }
		throw new Error('not implemented');
	}

	/**
	 * Queue a patch. Multiple calls within SAVE_THROTTLE_MS are coalesced into
	 * one Bases write.  Resolved promise is shared across the batch.
	 */
	patch(partial: Partial<TConfig>): Promise<void> {
		// Pseudocode:
		//   merge into this.pendingPatch
		//   if no flushTimer scheduled, schedule it via window.setTimeout
		//     (NOT setInterval — we're one-shot)
		//   on flush: const p = this.adapter.saveViewConfig(this.pendingPatch)
		//             this.pendingPatch = null; this.flushTimer = null
		//   return the in-flight promise so callers can await persistence
		throw new Error('not implemented');
	}

	/** Force any pending patch to flush immediately (used in onunload). */
	async flush(): Promise<void> {
		throw new Error('not implemented');
	}
}
