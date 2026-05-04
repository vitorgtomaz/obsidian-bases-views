import type { RendererSpec } from '../renderer-registry';
import type { SlotConfig } from '../../../types';

function buildTextEl(value: unknown, slot: SlotConfig, muted: boolean): HTMLElement {
	const el = document.createElement('div');
	el.className = muted ? 'bv-text bv-text-muted' : 'bv-text';

	const text = value == null
		? ''
		: Array.isArray(value)
			? value.join(', ')
			: String(value);
	el.setText(text);

	if (typeof slot.lines === 'number') {
		el.style.display = '-webkit-box';
		el.style.webkitLineClamp = String(slot.lines);
		(el.style as CSSStyleDeclaration & { webkitBoxOrient: string }).webkitBoxOrient = 'vertical';
		el.style.overflow = 'hidden';
	}
	return el;
}

export const textRenderer: RendererSpec = {
	id: 'text',
	weight: 1,
	accepts: () => true,
	render: (value, slot) => buildTextEl(value, slot, false),
};

export const textMutedRenderer: RendererSpec = {
	id: 'text-muted',
	weight: 5,
	accepts: (_v, slot) => slot.style === 'text-muted',
	render: (value, slot) => buildTextEl(value, slot, true),
};
