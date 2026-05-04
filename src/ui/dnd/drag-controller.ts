export interface DraggableHandle {
	el: HTMLElement;
	payload: unknown;
	makeGhost?: () => HTMLElement;
}

export interface DropZoneHandle {
	el: HTMLElement;
	accepts: (payload: unknown) => boolean;
	onDrop: (payload: unknown, ev: PointerEvent) => void;
	onEnter?: (payload: unknown) => void;
	onLeave?: () => void;
}

export interface DragControllerOptions {
	touchHoldMs: number;
	scrollEdge: number;
	scrollMaxPerFrame: number;
}

interface ActiveDrag {
	handle: DraggableHandle;
	ghost: HTMLElement;
	offsetX: number;
	offsetY: number;
	hoveredZone: DropZoneHandle | null;
	scrollRaf: number | null;
}

export class DragController {
	private handles = new Map<HTMLElement, DraggableHandle>();
	private zones: DropZoneHandle[] = [];
	private active: ActiveDrag | null = null;
	private touchTimer: number | null = null;
	private touchStartX = 0;
	private touchStartY = 0;

	private boundMove!: (ev: PointerEvent) => void;
	private boundUp!: (ev: PointerEvent) => void;
	private boundCancel!: () => void;

	constructor(
		private readonly root: HTMLElement,
		private readonly opts: DragControllerOptions,
	) {
		this.boundMove = (ev) => this.onPointerMove(ev);
		this.boundUp = (ev) => this.onPointerUp(ev);
		this.boundCancel = () => this.onPointerCancel();
	}

	registerDraggable(handle: DraggableHandle): () => void {
		this.handles.set(handle.el, handle);
		handle.el.addClass('bv-draggable');
		handle.el.style.touchAction = 'none';

		const onDown = (ev: PointerEvent) => this.onPointerDown(ev, handle);
		handle.el.addEventListener('pointerdown', onDown);
		return () => {
			this.handles.delete(handle.el);
			handle.el.removeEventListener('pointerdown', onDown);
		};
	}

	registerDropZone(zone: DropZoneHandle): () => void {
		this.zones.push(zone);
		return () => {
			const idx = this.zones.indexOf(zone);
			if (idx >= 0) this.zones.splice(idx, 1);
		};
	}

	private onPointerDown(ev: PointerEvent, handle: DraggableHandle): void {
		if (ev.button !== 0 && ev.pointerType === 'mouse') return;

		if (ev.pointerType === 'touch') {
			this.touchStartX = ev.clientX;
			this.touchStartY = ev.clientY;
			this.touchTimer = window.setTimeout(() => {
				this.touchTimer = null;
				this.beginDrag(handle, ev);
			}, this.opts.touchHoldMs);

			const cancelTouch = (mev: PointerEvent) => {
				if (Math.abs(mev.clientX - this.touchStartX) > 8 ||
					Math.abs(mev.clientY - this.touchStartY) > 8) {
					if (this.touchTimer !== null) {
						window.clearTimeout(this.touchTimer);
						this.touchTimer = null;
					}
					handle.el.removeEventListener('pointermove', cancelTouch as EventListener);
				}
			};
			handle.el.addEventListener('pointermove', cancelTouch as EventListener, { once: false });
		} else {
			this.beginDrag(handle, ev);
		}
	}

	private beginDrag(handle: DraggableHandle, ev: PointerEvent): void {
		const ghost = handle.makeGhost?.() ?? (handle.el.cloneNode(true) as HTMLElement);
		ghost.style.position = 'fixed';
		ghost.style.zIndex = '9999';
		ghost.style.pointerEvents = 'none';
		ghost.style.opacity = '0.85';
		ghost.style.margin = '0';
		document.body.appendChild(ghost);

		const rect = handle.el.getBoundingClientRect();
		const offsetX = ev.clientX - rect.left;
		const offsetY = ev.clientY - rect.top;
		ghost.style.width = `${rect.width}px`;
		ghost.style.left = `${ev.clientX - offsetX}px`;
		ghost.style.top = `${ev.clientY - offsetY}px`;

		handle.el.addClass('bv-dragging');

		this.active = { handle, ghost, offsetX, offsetY, hoveredZone: null, scrollRaf: null };

		this.root.setPointerCapture(ev.pointerId);
		this.root.addEventListener('pointermove', this.boundMove);
		this.root.addEventListener('pointerup', this.boundUp);
		this.root.addEventListener('pointercancel', this.boundCancel);
	}

	private onPointerMove(ev: PointerEvent): void {
		if (!this.active) return;
		const { ghost, offsetX, offsetY, handle } = this.active;
		ghost.style.left = `${ev.clientX - offsetX}px`;
		ghost.style.top = `${ev.clientY - offsetY}px`;

		// Hit-test zones
		ghost.style.display = 'none';
		const elUnder = document.elementFromPoint(ev.clientX, ev.clientY);
		ghost.style.display = '';

		let newZone: DropZoneHandle | null = null;
		if (elUnder) {
			for (const zone of this.zones) {
				if (zone.el === elUnder || zone.el.contains(elUnder)) {
					if (zone.accepts(handle.payload)) { newZone = zone; break; }
				}
			}
		}

		if (newZone !== this.active.hoveredZone) {
			this.active.hoveredZone?.onLeave?.();
			newZone?.onEnter?.(handle.payload);
			this.active.hoveredZone = newZone;
		}

		// Auto-scroll
		const rootRect = this.root.getBoundingClientRect();
		const { scrollEdge, scrollMaxPerFrame } = this.opts;
		let scrollDelta = 0;
		if (ev.clientY - rootRect.top < scrollEdge) {
			scrollDelta = -scrollMaxPerFrame * (1 - (ev.clientY - rootRect.top) / scrollEdge);
		} else if (rootRect.bottom - ev.clientY < scrollEdge) {
			scrollDelta = scrollMaxPerFrame * (1 - (rootRect.bottom - ev.clientY) / scrollEdge);
		}
		if (scrollDelta !== 0 && this.active.scrollRaf === null) {
			const scroll = () => {
				if (!this.active || scrollDelta === 0) { this.active && (this.active.scrollRaf = null); return; }
				this.root.scrollTop += scrollDelta;
				this.active.scrollRaf = window.requestAnimationFrame(scroll);
			};
			this.active.scrollRaf = window.requestAnimationFrame(scroll);
		} else if (scrollDelta === 0 && this.active.scrollRaf !== null) {
			window.cancelAnimationFrame(this.active.scrollRaf);
			this.active.scrollRaf = null;
		}
	}

	private onPointerUp(ev: PointerEvent): void {
		if (!this.active) return;
		const { hoveredZone, handle } = this.active;
		if (hoveredZone?.accepts(handle.payload)) {
			hoveredZone.onDrop(handle.payload, ev);
		}
		hoveredZone?.onLeave?.();
		this.tearDown();
	}

	private onPointerCancel(): void {
		this.active?.hoveredZone?.onLeave?.();
		this.tearDown();
	}

	private tearDown(): void {
		if (!this.active) return;
		if (this.active.scrollRaf !== null) window.cancelAnimationFrame(this.active.scrollRaf);
		this.active.ghost.detach();
		this.active.handle.el.removeClass('bv-dragging');
		this.root.removeEventListener('pointermove', this.boundMove);
		this.root.removeEventListener('pointerup', this.boundUp);
		this.root.removeEventListener('pointercancel', this.boundCancel);
		this.active = null;
	}
}
