/**
 * Text renderers — plain and muted.
 *
 * `text` is the universal fallback: any value can be String()-ified.
 * `text-muted` is the same with the `bv-text-muted` class for use in body slots
 * where you want a de-emphasised secondary line (the "future-fit-seal" slug in
 * the screenshot example).
 *
 * Both honor slot.lines for clamping (CSS line-clamp).
 */

import type { RendererSpec } from '../renderer-registry';

function buildTextEl(value: unknown, slot: import('../../../types').SlotConfig, muted: boolean): HTMLElement {
	// Pseudocode:
	//   const el = createDiv(muted ? 'bv-text bv-text-muted' : 'bv-text')
	//   const text = value == null ? '' : Array.isArray(value) ? value.join(', ') : String(value)
	//   el.setText(text)
	//   if typeof slot.lines === 'number':
	//     el.style.webkitLineClamp = String(slot.lines)
	//     el.style.display = '-webkit-box'
	//     el.style.webkitBoxOrient = 'vertical'
	//     el.style.overflow = 'hidden'
	//   return el
	throw new Error('not implemented');
}

export const textRenderer: RendererSpec = {
	id: 'text',
	weight: 1, // ultimate fallback
	accepts: () => true,
	render: (value, slot) => buildTextEl(value, slot, false),
};

export const textMutedRenderer: RendererSpec = {
	id: 'text-muted',
	weight: 5,
	accepts: (_v, slot) => slot.style === 'text-muted',
	render: (value, slot) => buildTextEl(value, slot, true),
};
