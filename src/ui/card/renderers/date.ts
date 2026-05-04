/**
 * Date renderer — localised date / relative-time.
 *
 * Accepts:
 *   - slot.style === 'date'
 *   - propType ∈ {'date', 'datetime'}
 *   - value parses as a valid Date (ISO string or Date)
 *
 * slot.dateFormat:
 *   'short' (default)  → e.g. "May 2, 2026"
 *   'iso'              → "2026-05-02"
 *   'relative'         → "2 days ago" (via Intl.RelativeTimeFormat)
 *   'time'             → "13:28"
 *   'datetime'         → "May 2, 2026, 13:28"
 */

import type { RendererSpec } from '../renderer-registry';

export const dateRenderer: RendererSpec = {
	id: 'date',
	weight: 40,
	accepts(value, slot, propType) {
		if (slot.style === 'date') return true;
		if (propType === 'date' || propType === 'datetime') return true;
		if (typeof value === 'string') {
			const t = Date.parse(value);
			return !Number.isNaN(t) && /^\d{4}-\d{2}-\d{2}/.test(value);
		}
		return value instanceof Date;
	},
	render(value, slot, _ctx) {
		// Pseudocode:
		//   const d = value instanceof Date ? value : new Date(String(value))
		//   if (isNaN(d.getTime())) return createDiv('bv-text', { text: String(value ?? '') })
		//   const fmt = (slot.dateFormat as string) ?? 'short'
		//   const el = createDiv('bv-date')
		//   switch fmt:
		//     'iso'      → el.setText(d.toISOString().slice(0, 10))
		//     'relative' → el.setText(formatRelative(d))
		//     'time'     → el.setText(d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }))
		//     'datetime' → el.setText(d.toLocaleString())
		//     'short'    → el.setText(d.toLocaleDateString(undefined, { dateStyle: 'medium' }))
		//   el.title = d.toISOString()  // accessible full date on hover
		//   return el
		throw new Error('not implemented');
	},
};

/** Human-friendly relative time using Intl.RelativeTimeFormat. */
function formatRelative(d: Date): string {
	// Pseudocode:
	//   const diffMs = d.getTime() - Date.now()
	//   const abs = Math.abs(diffMs)
	//   pick the largest unit that fits (year, month, week, day, hour, minute)
	//   const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })
	//   return rtf.format(Math.round(diffMs / unitMs), unit)
	throw new Error('not implemented');
}
