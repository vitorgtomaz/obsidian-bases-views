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
		const el = document.createElement('div');
		el.className = 'bv-number';
		const n = typeof value === 'number' ? value : Number(value);
		if (!Number.isFinite(n)) {
			el.setText(String(value ?? ''));
			return el;
		}
		const opts: Intl.NumberFormatOptions = {};
		if (typeof slot.decimals === 'number') {
			opts.minimumFractionDigits = slot.decimals;
			opts.maximumFractionDigits = slot.decimals;
		}
		let text = n.toLocaleString(undefined, opts);
		if (typeof slot.unit === 'string') text += ' ' + slot.unit;
		el.setText(text);
		return el;
	},
};
