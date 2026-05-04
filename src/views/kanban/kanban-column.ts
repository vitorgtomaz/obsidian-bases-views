/**
 * KanbanColumn — one column in a Kanban board.
 *
 * Owns:
 *   - A header (label + count + optional collapse toggle).
 *   - A scrollable body that hosts a VirtualList<ViewEntry>.
 *   - A drop zone (registered with the parent KanbanView's DragController).
 *
 * Pure DOM; no Bases coupling. The board is responsible for wiring DnD and
 * passing the renderCard callback used by VirtualList.
 */

import type { ViewEntry } from '../../types';
import { VirtualList } from '../../ui/virtual-list';
import type { DragController } from '../../ui/dnd/drag-controller';
import { makeColumnDropZone } from '../../ui/dnd/drop-zone';

export interface KanbanColumnOptions {
	/** Stable column key (the property value, e.g. 'todo'). */
	value: string;
	/** Human label shown in the header. Often === value, lowercased title-cased. */
	label: string;
	/** ms long-press → see DragController. */
	dnd: DragController;
	renderCard: (entry: ViewEntry, recycled: HTMLElement | null) => HTMLElement;
	cardHeightPx: number;
	/** Called when a card is dropped into this column. Receives the file path. */
	onCardDropped: (filePath: string) => void;
	showCount: boolean;
}

export class KanbanColumn {
	rootEl!: HTMLElement;
	private headerEl!: HTMLElement;
	private countEl!: HTMLElement;
	private bodyEl!: HTMLElement;
	private list!: VirtualList<ViewEntry>;
	private cleanupDropZone: (() => void) | null = null;

	constructor(private readonly opts: KanbanColumnOptions) {}

	/** Build DOM under `parentEl` and return the root element. */
	mount(parentEl: HTMLElement): HTMLElement {
		// Pseudocode:
		//   this.rootEl   = parentEl.createDiv('bv-column')
		//   this.headerEl = this.rootEl.createDiv('bv-column-header')
		//   const labelEl = this.headerEl.createDiv({ cls: 'bv-column-label', text: this.opts.label })
		//   this.countEl  = this.headerEl.createDiv({ cls: 'bv-column-count', text: '' })
		//   if (!this.opts.showCount) this.countEl.hide()
		//   this.bodyEl   = this.rootEl.createDiv('bv-column-body')
		//   this.list = new VirtualList<ViewEntry>({
		//     itemHeight: this.opts.cardHeightPx,
		//     overscan: 1,
		//     renderItem: ({ data }, recycled) => this.opts.renderCard(data, recycled),
		//   })
		//   this.list.mount(this.bodyEl)
		//   this.cleanupDropZone = makeColumnDropZone(
		//     this.opts.dnd,
		//     this.rootEl,
		//     (payload) => typeof payload === 'string',
		//     (payload) => this.opts.onCardDropped(payload as string),
		//   )
		//   return this.rootEl
		throw new Error('not implemented');
	}

	/** Replace the entries shown in this column. */
	setEntries(entries: ViewEntry[]): void {
		// this.list.setItems(entries.map(e => ({ id: e.file.path, data: e })))
		// this.countEl.setText(String(entries.length))
		throw new Error('not implemented');
	}

	unmount(): void {
		this.cleanupDropZone?.();
		this.list?.unmount();
		this.rootEl?.detach();
	}
}
