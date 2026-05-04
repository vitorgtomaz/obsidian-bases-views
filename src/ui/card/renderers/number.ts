/**
 * Number renderer — right-aligned, optional unit suffix, locale-aware grouping.
 */

import type { RendererSpec } from '../renderer-registry';

export const numberRenderer: RendererSpec = {
	id: 'number',
	weight: 20,
	accepts(value, slot, propType) {
		if (slot.style === 'number') return true;
		if (propType === 'number') return true;
		return typeof value === 'number' && Number.isFinite(value);
	},
	render(value, slot, _ctx) {
		// Pseudocode:
		//   const n = typeof value === 'number' ? value : Number(value)
		//   if (!Number.isFinite(n)) return createDiv('bv-text', { text: String(value ?? '') })
		//   const el = createDiv('bv-number')
		//   const opts: Intl.NumberFormatOptions = {}
		//   if typeof slot.decimals === 'number': opts.minimumFractionDigits = opts.maximumFractionDigits = slot.decimals
		//   el.setText(n.toLocaleString(undefined, opts))
		//   if typeof slot.unit === 'string': el.appendText(' ' + slot.unit)
		//   return el
		throw new Error('not implemented');
	},
};
