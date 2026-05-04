import { hashString } from '../../../utils/rng';
import type { RendererSpec } from '../renderer-registry';

export const pillRenderer: RendererSpec = {
	id: 'pill',
	weight: 60,
	accepts(value, slot, propType) {
		if (slot.style === 'pill') return true;
		return propType === 'list' || propType === 'tags';
	},
	render(value, _slot, _ctx) {
		const arr = Array.isArray(value) ? value : value == null ? [] : [value];
		const wrap = document.createElement('div');
		wrap.className = 'bv-card-badges';
		for (const v of arr) {
			const chip = wrap.createSpan({ cls: 'bv-badge' });
			const label = String(v).replace(/^#/, '');
			const { bg, fg } = colorFor(label);
			chip.style.backgroundColor = bg;
			chip.style.color = fg;
			chip.setText(label);
		}
		return wrap;
	},
};

const COLOR_CACHE = new Map<string, { bg: string; fg: string }>();

export function colorFor(label: string): { bg: string; fg: string } {
	const cached = COLOR_CACHE.get(label);
	if (cached) return cached;

	const hash = hashString(label);
	const hue = hash % 360;
	const result = {
		bg: `hsl(${hue}, 35%, 18%)`,
		fg: `hsl(${hue}, 55%, 80%)`,
	};
	COLOR_CACHE.set(label, result);
	return result;
}
