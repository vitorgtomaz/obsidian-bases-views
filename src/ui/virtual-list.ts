export interface VirtualListItem<T> {
	id: string;
	data: T;
}

export interface VirtualListOptions<T> {
	itemHeight: number;
	overscan?: number;
	renderItem: (item: VirtualListItem<T>, recycled: HTMLElement | null) => HTMLElement;
}

export class VirtualList<T> {
	private items: VirtualListItem<T>[] = [];
	private container!: HTMLElement;
	private spacerTop!: HTMLElement;
	private spacerBottom!: HTMLElement;
	private body!: HTMLElement;
	private rendered = new Map<string, HTMLElement>();
	private pool: HTMLElement[] = [];
	private rafId: number | null = null;
	private ro!: ResizeObserver;

	constructor(private readonly opts: VirtualListOptions<T>) {}

	mount(containerEl: HTMLElement): void {
		this.container = containerEl;
		this.spacerTop = containerEl.createDiv();
		this.body = containerEl.createDiv();
		this.spacerBottom = containerEl.createDiv();

		const onScroll = () => {
			if (this.rafId !== null) return;
			this.rafId = window.requestAnimationFrame(() => {
				this.rafId = null;
				this.refresh();
			});
		};
		containerEl.addEventListener('scroll', onScroll, { passive: true });

		this.ro = new ResizeObserver(() => this.refresh());
		this.ro.observe(containerEl);
	}

	setItems(next: VirtualListItem<T>[]): void {
		this.items = next;
		this.refresh();
	}

	private refresh(): void {
		if (!this.container) return;
		const { itemHeight, overscan = 1 } = this.opts;
		const scrollTop = this.container.scrollTop;
		const h = this.container.clientHeight;

		const firstVisible = Math.floor(scrollTop / itemHeight);
		const lastVisible = Math.ceil((scrollTop + h) / itemHeight);
		const overPx = overscan * h;
		const first = Math.max(0, Math.floor((scrollTop - overPx) / itemHeight));
		const last = Math.min(this.items.length, Math.ceil((scrollTop + h + overPx) / itemHeight));

		this.spacerTop.style.height = `${first * itemHeight}px`;
		this.spacerBottom.style.height = `${(this.items.length - last) * itemHeight}px`;

		// Remove stale rendered items → pool
		for (const [id, el] of this.rendered) {
			const idx = this.items.findIndex((i) => i.id === id);
			if (idx < first || idx >= last) {
				el.detach();
				this.pool.push(el);
				this.rendered.delete(id);
			}
		}

		// Render visible items
		for (let i = first; i < last; i++) {
			const item = this.items[i];
			if (!item) continue;
			if (this.rendered.has(item.id)) continue;
			const recycled = this.pool.pop() ?? null;
			const el = this.opts.renderItem(item, recycled);
			this.body.appendChild(el);
			this.rendered.set(item.id, el);
		}
	}

	unmount(): void {
		if (this.rafId !== null) window.cancelAnimationFrame(this.rafId);
		this.ro?.disconnect();
		this.rendered.clear();
		this.pool.length = 0;
	}
}
