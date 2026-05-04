import type { ViewEntry } from '../../types';
import { VirtualList } from '../../ui/virtual-list';
import type { DragController } from '../../ui/dnd/drag-controller';
import { makeColumnDropZone } from '../../ui/dnd/drop-zone';

const CARD_HEIGHT_PX = 120;

export interface KanbanColumnOptions {
	value: string;
	label: string;
	dnd: DragController;
	renderCard: (entry: ViewEntry, recycled: HTMLElement | null) => HTMLElement;
	onCardDropped: (filePath: string) => void;
	showCount: boolean;
}

export class KanbanColumn {
	rootEl!: HTMLElement;
	private countEl!: HTMLElement;
	private list!: VirtualList<ViewEntry>;
	private cleanupZone: (() => void) | null = null;

	constructor(private readonly opts: KanbanColumnOptions) {}

	mount(parentEl: HTMLElement): HTMLElement {
		this.rootEl = parentEl.createDiv('bv-column');

		const header = this.rootEl.createDiv('bv-column-header');
		header.createDiv({ cls: 'bv-column-label', text: this.opts.label });
		this.countEl = header.createDiv({ cls: 'bv-column-count', text: '' });
		if (!this.opts.showCount) this.countEl.hide();

		const body = this.rootEl.createDiv('bv-column-body');

		this.list = new VirtualList<ViewEntry>({
			itemHeight: CARD_HEIGHT_PX,
			overscan: 1,
			renderItem: ({ data }, recycled) => this.opts.renderCard(data, recycled),
		});
		this.list.mount(body);

		this.cleanupZone = makeColumnDropZone(
			this.opts.dnd,
			this.rootEl,
			(payload) => typeof payload === 'string',
			(payload) => this.opts.onCardDropped(payload as string),
		);

		return this.rootEl;
	}

	setEntries(entries: ViewEntry[]): void {
		this.list.setItems(entries.map((e) => ({ id: e.file.path, data: e })));
		this.countEl.setText(String(entries.length));
	}

	unmount(): void {
		this.cleanupZone?.();
		this.list?.unmount();
		this.rootEl?.detach();
	}
}
