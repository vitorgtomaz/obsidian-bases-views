/**
 * AbstractView — base class for every Bases view type the plugin ships.
 *
 * Extends BasesView (Component). The only lifecycle hook Bases calls is
 * onDataUpdated(). Everything else flows from that.
 *
 * Subclasses implement:
 *   - abstract type: string
 *   - abstract render(entries, config, container): void
 *   - abstract defaultConfig(): TConfig
 *   - optionally override onload() to wire extra DOM (call super.onload() first)
 */

import { BasesView, type QueryController } from 'obsidian';

import type BasesViewsPlugin from '../main';
import type { PropertyDescriptor, SearchState, ViewEntry } from '../types';
import { deriveDescriptors, normaliseEntry } from './query-adapter';
import { matchesSearch } from './property-utils';
import { debounce } from '../utils/debounce';
import { SearchBox } from '../ui/search-box';

const TICK_DEBOUNCE_MS = 50;

export abstract class AbstractView<TConfig extends object> extends BasesView {
	protected readonly plugin: BasesViewsPlugin;

	/** Snapshot from last tick. */
	protected entries: readonly ViewEntry[] = [];
	protected properties: readonly PropertyDescriptor[] = [];

	/** Ephemeral search state — not persisted. */
	protected search: SearchState = {
		term: '',
		scopes: { name: true, path: true, properties: true, body: false },
	};

	protected toolbarEl!: HTMLElement;
	protected bodyEl!: HTMLElement;
	protected errorEl!: HTMLElement;

	private searchBox!: SearchBox;
	private readonly onDataDebounced = debounce(() => this.tick(), TICK_DEBOUNCE_MS);

	constructor(
		controller: QueryController,
		protected readonly containerEl: HTMLElement,
		plugin: BasesViewsPlugin,
	) {
		super(controller);
		this.plugin = plugin;
	}

	/* ---- Bases lifecycle ---- */

	/** Called by Bases whenever the query result changes. */
	onDataUpdated(): void {
		this.onDataDebounced();
	}

	override onload(): void {
		super.onload();

		// Root structure
		this.containerEl.addClass('bv-view', `bv-view-${this.type.replace(/\./g, '-')}`);
		this.toolbarEl = this.containerEl.createDiv('bv-toolbar');
		this.bodyEl = this.containerEl.createDiv('bv-body');
		this.errorEl = this.containerEl.createDiv('bv-error-banner');
		this.errorEl.hide();

		// Search box in toolbar
		this.searchBox = new SearchBox({
			state: this.search,
			onChange: (next) => {
				this.search = next;
				this.tick();
			},
		});
		this.searchBox.mount(this.toolbarEl);

		// Defer first render so subclass onload() can finish initializing
		// fields (e.g. DragController) before render() runs.
		queueMicrotask(() => this.tick());
	}

	override onunload(): void {
		this.onDataDebounced.cancel();
		this.searchBox?.unmount();
		super.onunload();
	}

	/* ---- Subclass API ---- */

	abstract defaultConfig(): TConfig;

	protected abstract render(
		entries: readonly ViewEntry[],
		config: TConfig,
		container: HTMLElement,
	): void;

	/* ---- Engine ---- */

	private tick(): void {
		// Snapshot
		const rawEntries = this.data?.data ?? [];
		const rawPropIds = this.data?.properties ?? this.allProperties ?? [];

		this.properties = deriveDescriptors(rawPropIds, rawEntries);
		this.entries = rawEntries.map((e) => normaliseEntry(e, rawPropIds));

		// Apply search filter
		const visible = this.search.term.length >= 1
			? this.entries.filter((e) => matchesSearch(e, this.search.term, this.search.scopes))
			: this.entries;

		// Build config
		const config = this.buildConfig();

		// Render (trapped)
		this.errorEl.hide();
		try {
			this.render(visible, config, this.bodyEl);
		} catch (err) {
			this.showError(err);
			console.error(`[Bases Views] ${this.type} render error:`, err);
		}

		// Update search count chip
		this.searchBox?.setCount(visible.length, this.entries.length);
	}

	protected buildConfig(): TConfig {
		const saved: Partial<TConfig> = {};
		const defaults = this.defaultConfig();
		for (const key of Object.keys(defaults) as (keyof TConfig)[]) {
			const v = this.config.get(key as string);
			if (v !== null && v !== undefined) {
				(saved as Record<string, unknown>)[key as string] = v;
			}
		}
		return { ...defaults, ...saved };
	}

	protected saveConfig(patch: Partial<TConfig>): void {
		for (const [k, v] of Object.entries(patch)) {
			this.config.set(k, v);
		}
	}

	/** Re-run the render pipeline against the last data snapshot. */
	protected requestRender(): void {
		this.tick();
	}

	protected showError(err: unknown): void {
		this.errorEl.empty();
		this.errorEl.show();
		const msg = err instanceof Error ? err.message : String(err);
		this.errorEl.createEl('strong', { text: 'Render error' });
		this.errorEl.createEl('p', { text: msg });
		const btn = this.errorEl.createEl('button', { text: 'Retry' });
		btn.onclick = () => this.tick();
	}
}
