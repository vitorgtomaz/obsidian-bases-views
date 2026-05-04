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
		const el = document.createElement('div');
		el.className = 'bv-checkbox';
		const input = el.createEl('input');
		input.type = 'checkbox';
		input.checked = !!value;
		input.disabled = true;
		return el;
	},
};
