/**
 * AbstractView — base class for every Bases view type the plugin ships.
 *
 * Wraps the framework BasesView (Component) and gives subclasses a calm,
 * predictable lifecycle:
 *
 *   1. onload              — build static DOM (toolbar, body root, error banner)
 *   2. onDataUpdated       — Bases or our search/filter state changed; subclass re-renders
 *   3. onResize            — viewport changed; subclass may re-virtualize
 *   4. onunload            — Component children clean up; we just null-out caches
 *
 * Subclasses implement render(entries, config, container).  AbstractView
 * handles: snapshot-per-tick, debounced data-updated, error trapping.
 */

import { Component } from 'obsidian';

import type BasesViewsPlugin from '../main';
import type {
	CardLayout,
	FilterState,
	OptionConfig,
	PropertyDescriptor,
	QueryController,
	SearchState,
	ViewEntry,
} from '../types';
import { QueryAdapter } from './query-adapter';
import { debounce } from '../utils/debounce';

/** Base shape every view's persisted config must extend. */
export interface BaseViewConfig {
	name?: string;
	card?: CardLayout;
	/** Search is intentionally NOT in here — it's ephemeral. */
}

/**
 * Generic over the view's specific config type.  Kanban extends BaseViewConfig
 * with { groupBy, columnOrder, hiddenColumns, … }.
 */
export abstract class AbstractView<TConfig extends BaseViewConfig> extends Component {
	protected readonly adapter: QueryAdapter;

	/** Snapshot taken at the start of every render tick. */
	protected entries: readonly ViewEntry[] = [];
	protected properties: readonly PropertyDescriptor[] = [];

	/** Ephemeral, non-persisted UI state. */
	protected search: SearchState = {
		term: '',
		scopes: { name: true, path: true, properties: true, body: false },
	};

	/** Active local filter overlay on top of Bases-native filters. */
	protected filter: FilterState = { clauses: [] };

	/** Root for the toolbar (search + filter buttons + view-options). */
	protected toolbarEl!: HTMLElement;
	/** Root for the view's main content. Subclasses render here. */
	protected bodyEl!: HTMLElement;
	/** Inline error banner; hidden until catch fires. */
	protected errorEl!: HTMLElement;

	/** Debounced data-updated handler — see PRD §4.7 (50 ms). */
	private readonly onDataDebounced = debounce(() => this.tick(), 50);

	constructor(
		controller: QueryController,
		protected readonly containerEl: HTMLElement,
		protected readonly plugin: BasesViewsPlugin,
	) {
		// NOTE: Bases' BasesView extends Component and expects super(controller).
		// The Obsidian typings call this `super(controller)` in v1.10. We mirror
		// that here; if the typing diverges this is the single point to adapt.
		super();
		this.adapter = new QueryAdapter(controller);
	}

	/* ----------------------- lifecycle ------------------------- */

	override onload(): void {
		// 1. Build skeleton DOM: toolbar, body, error banner. Add CSS class
		//    `bv-view bv-view-<id>`. Append to this.containerEl.
		// 2. Wire toolbar buttons: search-box, filter-panel, view-options menu.
		// 3. Subscribe to adapter ticks via this.adapter.subscribe(this.onDataDebounced).
		//    Register the unsubscriber via this.register(...).
		// 4. Call this.tick() once to do the initial render.
		throw new Error('not implemented');
	}

	override onunload(): void {
		// Component cleanup is automatic. Drop heavy caches here if any.
	}

	/* ----------------------- subclass API ---------------------- */

	/** Unique id used in registerBasesView and CSS scoping. */
	abstract readonly viewId: string;

	/** Per-view default config used when .base has no `views[].card` etc. */
	abstract defaultConfig(): TConfig;

	/** Per-view options schema (declares the UI Bases shows in its editor). */
	abstract optionsSchema(): OptionConfig[];

	/**
	 * The hot path. Called whenever entries/config/search/filter change.
	 *  - `entries` is already filtered by Bases AND our local filter AND search.
	 *  - `container` is `this.bodyEl`; subclass owns its content.
	 * MUST be idempotent and side-effect free apart from DOM mutation.
	 */
	protected abstract render(
		entries: readonly ViewEntry[],
		config: TConfig,
		container: HTMLElement,
	): void;

	/* ----------------------- engine guts ----------------------- */

	/** One render iteration. Wraps render() in a try/catch (see PRD §4.8). */
	private tick(): void {
		// 1. this.entries = this.adapter.snapshot() ; this.properties = this.adapter.properties()
		// 2. Apply this.filter.clauses (use engine/property-utils evaluators)
		// 3. Apply this.search.term over the configured scopes
		// 4. Read config = { ...this.defaultConfig(), ...this.adapter.getViewConfig() }
		// 5. try { this.render(filteredEntries, config, this.bodyEl) }
		//    catch (err) { showError(err); console.error(err); }
		throw new Error('not implemented');
	}

	/** Persist a config patch via the controller (Bases writes to .base). */
	protected async saveConfig(patch: Partial<TConfig>): Promise<void> {
		// Just delegate. Bases handles file I/O.
		await this.adapter.saveViewConfig(patch);
	}

	/** Display an inline error inside the view's body without crashing the leaf. */
	protected showError(err: unknown): void {
		// Replace bodyEl content with a simple banner: title, message, "copy
		// details" button, "retry" button which calls this.tick() again. Keep
		// it dependency-free — this must work when the rest of the view is broken.
		throw new Error('not implemented');
	}
}
