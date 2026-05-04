import type { DragController, DropZoneHandle } from './drag-controller';

export function makeColumnDropZone(
	dnd: DragController,
	columnEl: HTMLElement,
	accepts: (payload: unknown) => boolean,
	onDrop: (payload: unknown) => void,
): () => void {
	const zone: DropZoneHandle = {
		el: columnEl,
		accepts,
		onEnter: () => columnEl.addClass('bv-drop-target'),
		onLeave: () => columnEl.removeClass('bv-drop-target'),
		onDrop: (payload) => onDrop(payload),
	};
	return dnd.registerDropZone(zone);
}

export function makeReorderDropZone(
	dnd: DragController,
	itemEl: HTMLElement,
	accepts: (payload: unknown) => boolean,
	onDrop: (payload: unknown, position: 'before' | 'after') => void,
): () => void {
	let placeholder: HTMLElement | null = null;

	const zone: DropZoneHandle = {
		el: itemEl,
		accepts,
		onEnter: () => {
			placeholder = document.createElement('div');
			placeholder.className = 'bv-drop-placeholder';
			itemEl.parentElement?.insertBefore(placeholder, itemEl);
		},
		onLeave: () => {
			placeholder?.detach();
			placeholder = null;
		},
		onDrop: (payload, ev) => {
			const rect = itemEl.getBoundingClientRect();
			const position = ev.clientY < rect.top + rect.height / 2 ? 'before' : 'after';
			placeholder?.detach();
			placeholder = null;
			onDrop(payload, position);
		},
	};
	return dnd.registerDropZone(zone);
}
