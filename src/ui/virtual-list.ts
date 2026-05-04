/**
 * VirtualList — tiny windowed renderer for vertical lists of variable-height items.
 *
 * Why hand-rolled: Obsidian works on iOS Safari and modest Android devices.
 * Pulling in react-virtual et al. isn't worth ~30 KB.  We only need:
 *   - render only items intersecting (viewport ± 1 viewport) of buffer
 *   - reuse DOM nodes when possible (keyed by id)
 *   - support fast scroll without thrashing
 *
 * Fixed-height variant is enough for v1 (cards within a column have a
 * configurable max height + ellipsis). Variable-height comes when timeline lands.
 */

export interface VirtualListItem<T> {
	id: string;
	data: T;
}

export interface VirtualListOptions<T> {
	/** Single fixed item height in px. */
	itemHeight: number;
	/** Buffer in viewport-multiples to render outside the visible area. */
	overscan?: number;
	/**
	 * Build the DOM for one item. Receives a recycled element on subsequent
	 * calls — mutate in place rather than re-creating.
	 */
	renderItem: (item: VirtualListItem<T>, recycled: HTMLElement | null) => HTMLElement;
}

export class VirtualList<T> {
	private items: VirtualListItem<T>[] = [];
	private rootEl!: HTMLElement;
	private spacerTop!: HTMLElement;
	private spacerBottom!: HTMLElement;
	private rendered = new Map<string, HTMLElement>();

	constructor(private readonly opts: VirtualListOptions<T>) {}

	/** Mount inside `containerEl`. Container must be scrollable. */
	mount(containerEl: HTMLElement): void {
		// Build: [spacerTop][rendered nodes][spacerBottom] inside containerEl.
		// Add scroll listener on containerEl → schedule a rAF to call this.refresh().
		// Add ResizeObserver to also refresh on container size changes.
		throw new Error('not implemented');
	}

	/** Replace the dataset; preserves DOM nodes for ids that survive. */
	setItems(next: VirtualListItem<T>[]): void {
		// 1. Update this.items
		// 2. spacerBottom.style.height = items.length * itemHeight (minus visible)
		// 3. Call this.refresh()
		throw new Error('not implemented');
	}

	private refresh(): void {
		// 1. const scrollTop = container.scrollTop; const h = container.clientHeight
		// 2. firstVisible = floor(scrollTop / itemHeight)
		//    lastVisible  = ceil((scrollTop + h) / itemHeight)
		// 3. Apply overscan: first = max(0, firstVisible - overscan*viewport)
		//                    last  = min(items.length, lastVisible + overscan*viewport)
		// 4. spacerTop.style.height    = first * itemHeight
		//    spacerBottom.style.height = (items.length - last) * itemHeight
		// 5. Reconcile rendered map:
		//    - For every id no longer in [first..last): detach node, push into pool.
		//    - For every i in [first..last):
		//        const id = items[i].id
		//        let el = this.rendered.get(id) ?? pool.pop() ?? null
		//        el = this.opts.renderItem(items[i], el)
		//        if (el.parentEl !== body) body.appendChild(el)
		//        this.rendered.set(id, el)
		throw new Error('not implemented');
	}

	unmount(): void {
		// Detach root + observers; clear rendered map.
		throw new Error('not implemented');
	}
}
