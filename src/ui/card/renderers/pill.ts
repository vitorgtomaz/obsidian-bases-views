/**
 * Pill renderer — colored chip(s) for tags / multi-select / enum strings.
 *
 * Accepts:
 *   - slot.style === 'pill'
 *   - value is an array (renders one chip per element)
 *   - propType ∈ {'list', 'tags'}
 *
 * Each chip's color is hashed from the value (so 'todo' is always the same
 * color across cards). Cache is held inside the registry call site; here we
 * just compute deterministically.
 */

import type { RendererSpec } from '../renderer-registry';

export const pillRenderer: RendererSpec = {
	id: 'pill',
	weight: 60,
	accepts(value, slot, propType) {
		if (slot.style === 'pill') return true;
		if (propType === 'list' || propType === 'tags') return true;
		return false;
	},
	render(value, _slot, _ctx) {
		// Pseudocode:
		//   const arr = Array.isArray(value) ? value : value == null ? [] : [value]
		//   const wrap = createDiv('bv-pill-row')
		//   for (const v of arr):
		//     const chip = wrap.createSpan('bv-badge')
		//     const { bg, fg } = colorFor(String(v))
		//     chip.style.backgroundColor = bg
		//     chip.style.color = fg
		//     chip.setText(String(v).replace(/^#/, ''))   // strip leading # on tags
		//   return wrap
		throw new Error('not implemented');
	},
};

/**
 * Stable, accessible color pair for a label.
 *
 * Strategy:
 *   - hash the string to a 0..360 hue (FNV-1a, 32-bit, mod 360)
 *   - bg = hsl(hue, 35%, 18%)  (dark, low chroma — works on dark theme)
 *   - fg = hsl(hue, 55%, 80%)
 *   - swap to a light-theme palette by reading body class (left to caller via
 *     CSS custom properties; we just emit the chip and let CSS theme it).
 *
 * Exported so other renderers can reuse the palette if they want chip-styled output.
 */
export function colorFor(label: string): { bg: string; fg: string } {
	throw new Error('not implemented');
}
