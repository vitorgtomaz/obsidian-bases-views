/**
 * Boolean checkbox renderer (read-only in v1).
 *
 * Editable checkboxes would write through FrontmatterWriter, but we want all
 * mutation paths to go through view-aware controllers — leaving editable
 * checkboxes to v1.1 alongside the customize-card UI.
 */

import type { RendererSpec } from '../renderer-registry';

export const checkboxRenderer: RendererSpec = {
	id: 'checkbox',
	weight: 40,
	accepts(value, slot, propType) {
		if (slot.style === 'checkbox') return true;
		if (propType === 'boolean') return true;
		return typeof value === 'boolean';
	},
	render(value, _slot, _ctx) {
		// Pseudocode:
		//   const el = createDiv('bv-checkbox')
		//   const input = el.createEl('input', { type: 'checkbox' })
		//   input.checked = !!value
		//   input.disabled = true
		//   return el
		throw new Error('not implemented');
	},
};
