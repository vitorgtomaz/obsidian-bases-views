/**
 * DragController — pointer-event based drag and drop.
 *
 * Why custom (vs HTML5 DnD or react-dnd):
 *  - HTML5 DnD doesn't fire on touch on iOS Safari. Pointer Events work
 *    everywhere Obsidian runs (Electron desktop, iOS, Android).
 *  - We need auto-scroll during drag near container edges.
 *  - We want a long-press start on touch but immediate start on mouse.
 *
 * One controller per view. Register draggables and dropzones; controller owns
 * the active drag state.  Designed to be reused by Kanban now and
 * Calendar/Timeline later.
 */

export interface DraggableHandle {
	/** The element that receives pointerdown — usually a drag handle or whole card. */
	el: HTMLElement;
	/** Opaque payload returned in onDrop; usually the entry's file path. */
	payload: unknown;
	/** Optional preview override; default is to clone `el`. */
	makeGhost?: () => HTMLElement;
}

export interface DropZoneHandle {
	el: HTMLElement;
	/** Returns true if this payload may be dropped on this zone. */
	accepts: (payload: unknown) => boolean;
	/** Called when the user releases over this zone. */
	onDrop: (payload: unknown, ev: PointerEvent) => void;
	/** Optional hover hooks (used to draw the insertion line). */
	onEnter?: (payload: unknown) => void;
	onLeave?: () => void;
}

export interface DragControllerOptions {
	/** ms a touch must stay still before drag starts. Mouse drags start instantly. */
	touchHoldMs: number;
	/** Auto-scroll edge zone in px. */
	scrollEdge: number;
	/** Auto-scroll max velocity in px/frame. */
	scrollMaxPerFrame: number;
}

export class DragController {
	private draggables = new WeakMap<HTMLElement, DraggableHandle>();
	private zones: DropZoneHandle[] = [];

	private active: {
		handle: DraggableHandle;
		ghost: HTMLElement;
		offsetX: number;
		offsetY: number;
		hoveredZone: DropZoneHandle | null;
	} | null = null;

	constructor(
		private readonly root: HTMLElement,
		private readonly opts: DragControllerOptions,
	) {}

	/* -------------------- registration -------------------- */

	/** Mark `handle.el` as draggable. Returns an unsubscribe. */
	registerDraggable(handle: DraggableHandle): () => void {
		// Pseudocode:
		//   this.draggables.set(handle.el, handle)
		//   handle.el.addClass('bv-draggable')
		//   handle.el.style.touchAction = 'none' // only on the handle, not the card
		//   addEventListener pointerdown -> this.onPointerDown
		//   return cleanup
		throw new Error('not implemented');
	}

	registerDropZone(zone: DropZoneHandle): () => void {
		// Push zone, return cleanup that splices it out.
		throw new Error('not implemented');
	}

	/* -------------------- drag pipeline -------------------- */

	private onPointerDown(ev: PointerEvent): void {
		// Pseudocode:
		//   if ev.button !== 0 && ev.pointerType === 'mouse' return
		//   const handle = this.draggables.get(ev.currentTarget)
		//   if (!handle) return
		//   if pointerType === 'touch':
		//     start a hold-timer for opts.touchHoldMs
		//     if pointer moves > 8px before timer fires → cancel (let scroll happen)
		//     when timer fires → beginDrag(handle, ev) and call ev.preventDefault to
		//       stop further scroll
		//   else:
		//     beginDrag immediately
		throw new Error('not implemented');
	}

	private beginDrag(handle: DraggableHandle, ev: PointerEvent): void {
		// 1. Build ghost: handle.makeGhost?.() ?? handle.el.cloneNode(true) as HTMLElement
		//    Position fixed; z-index high; pointer-events none; opacity .9
		// 2. Compute offsetX/Y from element rect & ev.clientX/Y
		// 3. Set this.active; capture pointer on this.root
		// 4. Add listeners to this.root: pointermove, pointerup, pointercancel
		// 5. Source element: add class 'bv-dragging'
		throw new Error('not implemented');
	}

	private onPointerMove(ev: PointerEvent): void {
		// 1. Move ghost via transform: translate(...) (no layout thrash).
		// 2. Hit-test drop zones via document.elementFromPoint, walk up to find
		//    the registered zone element. If it differs from this.active.hoveredZone:
		//      old zone.onLeave(); new zone.onEnter(payload).
		// 3. Auto-scroll: if pointer is within opts.scrollEdge of the root's
		//    top/bottom, schedule a rAF that scrolls by velocity proportional
		//    to closeness, capped at opts.scrollMaxPerFrame.
		throw new Error('not implemented');
	}

	private onPointerUp(ev: PointerEvent): void {
		// 1. If this.active.hoveredZone && zone.accepts(payload):
		//      zone.onDrop(payload, ev)
		// 2. Always: this.active.hoveredZone?.onLeave()
		// 3. Tear down ghost, remove dragging class, release pointer capture,
		//    detach the temp listeners, this.active = null.
		throw new Error('not implemented');
	}

	private onPointerCancel(): void {
		// Same teardown as onPointerUp without invoking onDrop.
		throw new Error('not implemented');
	}
}
