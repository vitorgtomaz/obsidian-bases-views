import type { RendererSpec } from '../renderer-registry';

const ISO_RX = /^\d{4}-\d{2}-\d{2}/;

export const dateRenderer: RendererSpec = {
	id: 'date',
	weight: 40,
	accepts(value, slot, propType) {
		if (slot.style === 'date') return true;
		if (propType === 'date' || propType === 'datetime') return true;
		return typeof value === 'string' && ISO_RX.test(value);
	},
	render(value, slot, _ctx) {
		const el = document.createElement('div');
		el.className = 'bv-date';
		const d = value instanceof Date ? value : new Date(String(value ?? ''));
		if (Number.isNaN(d.getTime())) {
			el.setText(String(value ?? ''));
			return el;
		}
		const fmt = (slot.dateFormat as string) ?? 'short';
		switch (fmt) {
			case 'iso':
				el.setText(d.toISOString().slice(0, 10));
				break;
			case 'relative':
				el.setText(formatRelative(d));
				break;
			case 'time':
				el.setText(d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }));
				break;
			case 'datetime':
				el.setText(d.toLocaleString());
				break;
			default:
				el.setText(d.toLocaleDateString(undefined, { dateStyle: 'medium' }));
		}
		el.title = d.toISOString();
		return el;
	},
};

function formatRelative(d: Date): string {
	const diffMs = d.getTime() - Date.now();
	const abs = Math.abs(diffMs);
	const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
	if (abs < 60_000) return rtf.format(Math.round(diffMs / 1_000), 'second');
	if (abs < 3_600_000) return rtf.format(Math.round(diffMs / 60_000), 'minute');
	if (abs < 86_400_000) return rtf.format(Math.round(diffMs / 3_600_000), 'hour');
	if (abs < 7 * 86_400_000) return rtf.format(Math.round(diffMs / 86_400_000), 'day');
	if (abs < 30 * 86_400_000) return rtf.format(Math.round(diffMs / 7 * 86_400_000), 'week');
	return rtf.format(Math.round(diffMs / (30 * 86_400_000)), 'month');
}
