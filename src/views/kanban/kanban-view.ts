/**
 * KanbanView — the registered Bases view type.
 *
 * Subclasses AbstractView and implements the column-board render loop.
 *
 * Hot path on every tick:
 *   1. Determine effective groupBy (config.groupBy ?? auto-pick).
 *   2. Determine effective card layout (config.card ?? autoCardLayout).
 *   3. Bucket entries by groupBy value, applying columnOrder + hiddenColumns.
 *   4. For each column: create-or-update a KanbanColumn instance, then call
 *      setEntries.
 *   5. Diff: destroy columns that disappeared, append new ones in order.
 */

import type { App, FrontMatterCache } from 'obsidian';

import type BasesViewsPlugin from '../../main';
import type {
	OptionConfig,
	PropertyDescriptor,
	QueryController,
	ViewEntry,
} from '../../types';
import { AbstractView, type BaseViewConfig } from '../../engine/abstract-view';
import { FrontmatterWriter } from '../../engine/frontmatter-writer';
import { CardComposer } from '../../ui/card/composer';
import { RendererRegistry } from '../../ui/card/renderer-registry';
import { registerBuiltins } from '../../ui/card/renderers';
import { autoCardLayout } from '../../ui/card/auto-layout';
import { DragController } from '../../ui/dnd/drag-controller';
import { attachHoverPreview } from '../../ui/hover-preview';
import { KanbanColumn } from './kanban-column';
import { pickGroupBy } from './auto-group-by';
import {
	KANBAN_DEFAULTS,
	kanbanOptionsSchema,
	type KanbanConfig,
} from './kanban-options';

/** Stable id for registerBasesView. Do NOT change after release (PRD §2). */
export const KANBAN_VIEW_ID = 'bases-views.kanban';

/** Lucide icon name for the view-type dropdown in Bases. */
export const kanbanIcon = 'layout-kanban';

interface KanbanFullConfig extends BaseViewConfig, KanbanConfig {}

export class KanbanView extends AbstractView<KanbanFullConfig> {
	readonly viewId = KANBAN_VIEW_ID;

	private readonly registry = new RendererRegistry();
	private composer!: CardComposer;
	private writer: FrontmatterWriter;
	private dnd!: DragController;

	/** Keyed by column value. */
	private columns = new Map<string, KanbanColumn>();
	/** Track effective groupBy for the current tick (for onDrop). */
	private currentGroupBy: string | null = null;

	constructor(controller: QueryController, containerEl: HTMLElement, plugin: BasesViewsPlugin) {
		super(controller, containerEl, plugin);
		this.writer = new FrontmatterWriter(plugin.app);
		registerBuiltins(this.registry);
	}

	defaultConfig(): KanbanFullConfig {
		return { ...KANBAN_DEFAULTS };
	}

	optionsSchema(): OptionConfig[] {
		return kanbanOptionsSchema();
	}

	override onload(): void {
		// 1. super.onload-equivalent: build toolbar + body. AbstractView does
		//    the shared toolbar; we extend body with horizontal column scroll.
		// 2. Mount the DragController on this.bodyEl with options pulled from
		//    plugin settings (touchHoldMs etc).
		// 3. Build the CardComposer with this.registry and a descriptors map
		//    derived from this.adapter.properties().
		// 4. Subscribe to data updates (already wired by AbstractView).
		throw new Error('not implemented');
	}

	protected render(
		entries: readonly ViewEntry[],
		config: KanbanFullConfig,
		container: HTMLElement,
	): void {
		// Step-by-step (see PRD §4.4):
		//
		//   const descriptors = this.properties
		//   const groupBy = config.groupBy ?? pickGroupBy({
		//     descriptors, entries, basePath: this.adapter.getBasePath?.() ?? '', viewId: this.viewId,
		//   })
		//   if (!groupBy) {
		//     this.showError(new Error('No suitable property to group by — set Group by in view options.'))
		//     return
		//   }
		//   this.currentGroupBy = groupBy
		//
		//   const layout = config.card ?? autoCardLayout({
		//     entries, descriptors, excludeProperties: [groupBy],
		//   })
		//
		//   // Bucket entries by group value
		//   const buckets = new Map<string, ViewEntry[]>()
		//   for (const e of entries) {
		//     const v = e.properties[groupBy]
		//     // Lists/tags: a card belongs to multiple columns. v1 chooses the FIRST
		//     // value to keep mental model simple; configurable later.
		//     const key = Array.isArray(v) ? (v[0] ?? '') : v ?? ''
		//     const k = String(key)
		//     ;(buckets.get(k) ?? buckets.set(k, []).get(k))!.push(e)
		//   }
		//
		//   const ordered = mergeOrder(config.columnOrder, [...buckets.keys()])
		//     .filter(k => !(config.hiddenColumns ?? []).includes(k))
		//
		//   // Diff existing column DOM against `ordered`:
		//   //   - destroy columns whose key is no longer present
		//   //   - create columns for new keys (mount under container)
		//   //   - reorder DOM children to match `ordered`
		//   //   - call column.setEntries(buckets.get(k) ?? [])
		//
		//   // Card render closure — passed into each KanbanColumn:
		//   const renderCard = (entry, recycled) => {
		//     const cardEl = this.composer.compose(
		//       entry, layout,
		//       { app: this.plugin.app, source: this.viewId },
		//       recycled,
		//     )
		//     this.wireCard(cardEl, entry)
		//     this.dnd.registerDraggable({ el: cardEl, payload: entry.file.path })
		//     return cardEl
		//   }
		throw new Error('not implemented');
	}

	/** Wire click + hover-preview handlers onto a card element. */
	private wireCard(cardEl: HTMLElement, entry: ViewEntry): void {
		// click → openLinkText with newLeaf=true
		// attachHoverPreview gated by plugin.settings.hoverPreviewOnModifier
		throw new Error('not implemented');
	}

	/** Called from KanbanColumn.onCardDropped — write new property value. */
	private async onCardDropped(filePath: string, columnValue: string): Promise<void> {
		// Pseudocode:
		//   if (!this.currentGroupBy) return
		//   const file = this.plugin.app.vault.getFileByPath(filePath)  // null-safe
		//   if (!file) return
		//   const desc = this.properties.find(p => p.key === this.currentGroupBy)
		//   await this.writer.set(file, this.currentGroupBy, columnValue, desc?.type)
		//   // Bases observes the metadata change and emits data-updated; loop closes.
		throw new Error('not implemented');
	}
}

/** Merge a saved column order with the actually-encountered keys.
 *  Keys not in `saved` are appended in encounter order. */
function mergeOrder(saved: readonly string[] | undefined, present: readonly string[]): string[] {
	// Pseudocode:
	//   const seen = new Set<string>()
	//   const out: string[] = []
	//   for (const k of (saved ?? [])) if (present.includes(k) && !seen.has(k)) { out.push(k); seen.add(k) }
	//   for (const k of present)        if (!seen.has(k))                        { out.push(k); seen.add(k) }
	//   return out
	throw new Error('not implemented');
}
