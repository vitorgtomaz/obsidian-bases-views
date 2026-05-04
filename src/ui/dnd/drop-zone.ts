/**
 * Small helpers around DragController.registerDropZone for common zone shapes.
 *
 * Why split: views shouldn't repeat the same insertion-line / placeholder
 * boilerplate.  Keeps DragController itself dumb and reusable.
 */

import type { DragController, DropZoneHandle } from './drag-controller';

/**
 * Make `columnEl` a vertical-list drop zone.
 *  - During hover, draws a faint highlight on the column.
 *  - On drop, invokes onDrop with the original payload (e.g. an entry path).
 *
 * Returns an unsubscriber.
 */
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

/**
 * Make a list-item drop zone that supports re-ordering: hover above the
 * top half → insert before; hover below → insert after.
 *
 * The caller is responsible for actually applying the order change.
 */
export function makeReorderDropZone(
	dnd: DragController,
	itemEl: HTMLElement,
	accepts: (payload: unknown) => boolean,
	onDrop: (payload: unknown, position: 'before' | 'after') => void,
): () => void {
	// Pseudocode:
	//   On enter, append a thin placeholder div.
	//   On move (we'd need pointer position — extend DragController if needed),
	//     toggle placeholder above vs below based on rect midpoint.
	//   On drop, compute final position and call onDrop.
	//
	// Implementation note: DragController.onPointerMove already hit-tests the
	// element under the pointer; for fine-grained "before/after" we need it to
	// also pass the ev to onEnter/onLeave. This is a small upcoming extension —
	// land it when the first non-Kanban view needs it.
	throw new Error('not implemented');
}
