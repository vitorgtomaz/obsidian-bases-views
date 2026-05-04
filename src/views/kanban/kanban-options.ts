import type { CardLayout } from '../../types';
import type { ViewOption } from 'obsidian';

export interface KanbanConfig {
	groupBy?: string;
	columnOrder?: string[];
	hiddenColumns?: string[];
	card?: CardLayout;
	showColumnCounts?: boolean;
}

export const kanbanOptionsSchema = (): ViewOption[] => [
	{
		type: 'group',
		displayName: 'Columns',
		items: [
			{
				type: 'property',
				key: 'groupBy',
				displayName: 'Group by',
				filter: (prop) => prop.startsWith('note.') || prop.startsWith('formula.'),
			} satisfies import('obsidian').PropertyOption,
			{
				type: 'toggle',
				key: 'showColumnCounts',
				displayName: 'Show column counts',
				default: true,
			} satisfies import('obsidian').ToggleOption,
		],
	} satisfies import('obsidian').GroupOption,
];

export const KANBAN_DEFAULTS: KanbanConfig = {
	showColumnCounts: true,
};
