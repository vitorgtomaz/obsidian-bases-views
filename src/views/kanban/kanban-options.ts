/**
 * Bases options schema for the Kanban view. Bases shows these in its built-in
 * view-config UI and persists user choices into the `views[]` block of the
 * .base file — we never write the file ourselves.
 *
 * Keep keys identical to KanbanConfig field names so saveViewConfig patches
 * are 1:1.
 */

import type { OptionConfig } from '../../types';

export interface KanbanConfig {
	/** Property to group columns by. null/undefined → auto-pick on render. */
	groupBy?: string;
	/** Explicit column order. Missing values are appended in encounter order. */
	columnOrder?: string[];
	/** Columns hidden from view (still counted in totals). */
	hiddenColumns?: string[];
	/** Card layout (slots → properties). Absent → auto-layout. */
	card?: import('../../types').CardLayout;
	/** Maximum cards to render per column before scroll virtualisation kicks in. */
	columnMaxRendered?: number;
	/** Show counts next to column names. */
	showColumnCounts?: boolean;
}

/**
 * Function form because Bases lets the schema depend on the live property set.
 * We're given the controller in the factory but the schema callback receives
 * the same context Bases uses for the table view's column picker.
 */
export const kanbanOptionsSchema = (): OptionConfig[] => [
	{
		type: 'group',
		label: 'Columns',
		children: [
			{
				type: 'property',
				key: 'groupBy',
				label: 'Group by',
				allowedTypes: ['string', 'list', 'tags'],
			},
			{ type: 'list', key: 'columnOrder', label: 'Column order', itemSchema: [
				{ type: 'text', key: 'value', label: 'Value' },
			] },
			{ type: 'list', key: 'hiddenColumns', label: 'Hidden columns', itemSchema: [
				{ type: 'text', key: 'value', label: 'Value' },
			] },
			{ type: 'toggle', key: 'showColumnCounts', label: 'Show column counts' },
		],
	},
	{
		type: 'group',
		label: 'Card',
		// In v1, we expose a few simple toggles. The full slot editor lands
		// in v1.1; for now users can edit the `card:` YAML directly in the
		// .base file and our composer will honor it.
		children: [
			{ type: 'number', key: 'columnMaxRendered', label: 'Max cards rendered', min: 50, max: 5000 },
		],
	},
];

export const KANBAN_DEFAULTS: KanbanConfig = {
	showColumnCounts: true,
	columnMaxRendered: 500,
};
