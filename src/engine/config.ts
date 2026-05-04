/**
 * Thin wrapper around BasesViewConfig.get/set with coalesced writes.
 *
 * Views call `store.current()` to get the merged config (defaults + saved)
 * and `store.patch(partial)` to persist changes. Multiple rapid patches
 * are coalesced into one set call per key within THROTTLE_MS.
 */

import type { BasesViewConfig } from 'obsidian';

const THROTTLE_MS = 200;

export class ViewConfigStore<TConfig extends object> {
	private pendingPatch: Partial<TConfig> | null = null;
	private flushTimer: number | null = null;
	private flushResolvers: Array<() => void> = [];

	constructor(
		private readonly config: BasesViewConfig,
		private readonly defaults: TConfig,
	) {}

	current(): TConfig {
		const saved: Partial<TConfig> = {};
		for (const key of Object.keys(this.defaults) as (keyof TConfig)[]) {
			const v = this.config.get(key as string);
			if (v !== undefined && v !== null) (saved as Record<string, unknown>)[key as string] = v;
		}
		return { ...this.defaults, ...saved };
	}

	patch(partial: Partial<TConfig>): Promise<void> {
		this.pendingPatch = { ...this.pendingPatch, ...partial };

		if (this.flushTimer !== null) window.clearTimeout(this.flushTimer);

		return new Promise<void>((resolve) => {
			this.flushResolvers.push(resolve);
			this.flushTimer = window.setTimeout(() => this.doFlush(), THROTTLE_MS);
		});
	}

	flush(): void {
		if (this.flushTimer !== null) {
			window.clearTimeout(this.flushTimer);
			this.doFlush();
		}
	}

	private doFlush(): void {
		if (!this.pendingPatch) return;
		const patch = this.pendingPatch;
		this.pendingPatch = null;
		this.flushTimer = null;

		for (const [k, v] of Object.entries(patch)) {
			this.config.set(k, v);
		}

		const resolvers = this.flushResolvers;
		this.flushResolvers = [];
		for (const r of resolvers) r();
	}
}
