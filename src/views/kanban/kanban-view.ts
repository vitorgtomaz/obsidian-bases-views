import type { QueryController } from 'obsidian';

import type BasesViewsPlugin from '../../main';
import type { CardLayout, PropertyDescriptor, ViewEntry } from '../../types';
import { AbstractView } from '../../engine/abstract-view';
import { FrontmatterWriter } from '../../engine/frontmatter-writer';
import { CardComposer } from '../../ui/card/composer';
import { RendererRegistry } from '../../ui/card/renderer-registry';
import { registerBuiltins } from '../../ui/card/renderers';
import { autoCardLayout } from '../../ui/card/auto-layout';
import { DragController } from '../../ui/dnd/drag-controller';
import { attachHoverPreview } from '../../ui/hover-preview';
import { GroupByButton } from '../../ui/group-by-button';
import { KanbanColumn } from './kanban-column';
import { KANBAN_DEFAULTS, kanbanOptionsSchema, type KanbanConfig } from './kanban-options';

export const KANBAN_VIEW_ID = 'bases-views.kanban';
export const kanbanIcon = 'layout-kanban';

export class KanbanView extends AbstractView<KanbanConfig> {
	readonly type = KANBAN_VIEW_ID;

	private readonly registry = new RendererRegistry();
	private composer!: CardComposer;
	private writer: FrontmatterWriter;
	private dnd!: DragController;
	private columns = new Map<string, KanbanColumn>();
	private currentGroupBy: string | null = null;
	private groupByBtn!: GroupByButton;
	private hoverCleanups: Array<() => void> = [];
	private dndCleanups: Array<() => void> = [];

	constructor(controller: QueryController, containerEl: HTMLElement, plugin: BasesViewsPlugin) {
		super(controller, containerEl, plugin);
		this.writer = new FrontmatterWriter(plugin.app);
		registerBuiltins(this.registry);
	}

	defaultConfig(): KanbanConfig {
		return { ...KANBAN_DEFAULTS };
	}

	override onload(): void {
		super.onload();

		this.dnd = new DragController(this.bodyEl, {
			touchHoldMs: this.plugin.settings.touchDragHoldMs,
			scrollEdge: 60,
			scrollMaxPerFrame: 12,
		});

		this.groupByBtn = new GroupByButton({
			filter: (d) => d.id.startsWith('note.') || d.id.startsWith('formula.'),
			onChange: (propId) => {
				this.saveConfig({ groupBy: propId ?? '' } as Partial<KanbanConfig>);
				this.requestRender();
			},
		});
		this.groupByBtn.mount(this.toolbarEl);

		// Board container scrolls horizontally
		this.bodyEl.style.overflowX = 'auto';
		this.bodyEl.style.display = 'flex';
		this.bodyEl.style.flexDirection = 'row';
		this.bodyEl.style.gap = '12px';
		this.bodyEl.style.padding = '12px';
	}

	override onunload(): void {
		this.groupByBtn?.unmount();
		super.onunload();
	}

	protected render(
		entries: readonly ViewEntry[],
		config: KanbanConfig,
		container: HTMLElement,
	): void {
		const descriptors = this.properties;
		const descriptorMap = new Map<string, PropertyDescriptor>(
			descriptors.map((d) => [d.key, d]),
		);

		// Rebuild composer when descriptors change (cheap map rebuild)
		this.composer = new CardComposer({
			registry: this.registry,
			descriptors: descriptorMap,
			source: this.type,
		});

		// Resolve group-by from saved config only — no auto-detection. The
		// user picks a property via the toolbar's "Group by" button.
		const savedPropId = config.groupBy
			? this.config.getAsPropertyId(config.groupBy) ?? config.groupBy
			: null;
		const groupBy = savedPropId
			? savedPropId.split('.').slice(1).join('.') || null
			: null;

		this.currentGroupBy = groupBy;
		this.groupByBtn?.setProperties(descriptors);
		this.groupByBtn?.setSelection(savedPropId);

		// Build card layout
		const cardLayout: CardLayout = config.card ?? autoCardLayout({
			entries,
			descriptors,
			excludeProperties: groupBy ? [groupBy] : [],
		});

		// Bucket entries by group-by value, or into a single "All" column when
		// no group-by is configured — the user picks one from the toolbar.
		const buckets = new Map<string, ViewEntry[]>();
		if (!groupBy) {
			buckets.set('All', [...entries]);
		} else {
			for (const e of entries) {
				const raw = e.properties[groupBy];
				const keys = Array.isArray(raw)
					? raw.length > 0 ? [String(raw[0])] : ['']
					: [raw != null ? String(raw) : ''];
				for (const k of keys) {
					if (!buckets.has(k)) buckets.set(k, []);
					buckets.get(k)!.push(e);
				}
			}
		}

		const ordered = mergeOrder(config.columnOrder, [...buckets.keys()])
			.filter((k) => !(config.hiddenColumns ?? []).includes(k));

		// Clean up old hover/dnd registrations
		for (const c of this.hoverCleanups) c();
		this.hoverCleanups = [];
		for (const c of this.dndCleanups) c();
		this.dndCleanups = [];

		// Destroy removed columns
		for (const [key, col] of this.columns) {
			if (!ordered.includes(key)) {
				col.unmount();
				this.columns.delete(key);
			}
		}

		// Create / update columns
		for (const key of ordered) {
			let col = this.columns.get(key);
			if (!col) {
				col = new KanbanColumn({
					value: key,
					label: key || '(empty)',
					dnd: this.dnd,
					renderCard: (entry, recycled) => this.renderCard(entry, cardLayout, recycled),
					onCardDropped: (path) => this.onCardDropped(path, key),
					showCount: config.showColumnCounts ?? true,
				});
				col.mount(container);
				this.columns.set(key, col);
			}
			col.setEntries(buckets.get(key) ?? []);
		}

		// Ensure DOM order matches `ordered`
		for (const key of ordered) {
			const col = this.columns.get(key);
			if (col) container.appendChild(col.rootEl);
		}
	}

	private renderCard(
		entry: ViewEntry,
		layout: CardLayout,
		recycled: HTMLElement | null,
	): HTMLElement {
		const cardEl = this.composer.compose(
			entry,
			layout,
			{ app: this.app, source: this.type },
			recycled,
		);

		// Click → open file in new pane
		cardEl.onclick = (ev) => {
			ev.stopPropagation();
			this.app.workspace.openLinkText(entry.file.path, '', true);
		};

		// Hover preview
		if (this.plugin.settings.hoverPreviewOnModifier) {
			const cleanup = attachHoverPreview(this.app, cardEl, entry.file, {
				source: this.type,
				requireModifier: true,
			});
			this.hoverCleanups.push(cleanup);
		}

		// Drag registration
		const cleanupDnd = this.dnd.registerDraggable({
			el: cardEl,
			payload: entry.file.path,
		});
		this.dndCleanups.push(cleanupDnd);

		return cardEl;
	}

	private async onCardDropped(filePath: string, columnValue: string): Promise<void> {
		if (!this.currentGroupBy) return;
		const file = this.app.vault.getFileByPath(filePath);
		if (!file) return;
		const desc = this.properties.find((p) => p.key === this.currentGroupBy);
		await this.writer.set(file, this.currentGroupBy, columnValue, desc?.type);
	}
}

function mergeOrder(saved: readonly string[] | undefined, present: readonly string[]): string[] {
	const seen = new Set<string>();
	const out: string[] = [];
	for (const k of saved ?? []) {
		if (present.includes(k) && !seen.has(k)) { out.push(k); seen.add(k); }
	}
	for (const k of present) {
		if (!seen.has(k)) { out.push(k); seen.add(k); }
	}
	return out;
}
