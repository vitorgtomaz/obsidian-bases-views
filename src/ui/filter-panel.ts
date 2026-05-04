/**
 * FilterPanel — chip-based filter UI shown in the toolbar's filter button popover.
 *
 * Reusable across all views.  Round-trips into Bases' native filters block so
 * filters are also visible/editable in the table view.
 */

import type { App } from 'obsidian';
import type { FilterClause, FilterState, PropertyDescriptor } from '../types';

export interface FilterPanelOptions {
	app: App;
	properties: readonly PropertyDescriptor[];
	state: FilterState;
	onChange: (next: FilterState) => void;
	/** Called when user clicks "save into .base"; FilterPanel doesn't write itself. */
	onPersist?: (next: FilterState) => Promise<void>;
}

export class FilterPanel {
	private rootEl: HTMLElement | null = null;

	constructor(private readonly opts: FilterPanelOptions) {}

	/**
	 * Mount the popover anchored under `anchorEl`.
	 *
	 * UX:
	 *   - Header: "Filters" + a "+ Add filter" button.
	 *   - Each clause renders as a chip: [property ▾] [op ▾] [value ▾] [✕]
	 *   - Property dropdown lists this.opts.properties, grouped by type.
	 *   - Op dropdown shows only ops valid for the property's type
	 *     (string→eq/contains, list→has/notHas, number→eq/between, …)
	 *   - Value editor depends on type:
	 *       string: text input
	 *       enum/list: multi-select using property's enumValues
	 *       date: date picker
	 *       number: numeric input or two-input range for between
	 *   - Footer: "Apply locally" (calls onChange only) and
	 *             "Save to .base" (calls onPersist).
	 *
	 * Use Obsidian's Menu for dropdowns when possible; otherwise raw <select>.
	 */
	mount(anchorEl: HTMLElement): void {
		throw new Error('not implemented');
	}

	close(): void {
		// Detach rootEl from DOM, null it out.
		throw new Error('not implemented');
	}

	/* ---- internal helpers ---- */

	/** Validate ops available for a given property type. */
	private opsForType(t: PropertyDescriptor['type']): FilterClause['op'][] {
		throw new Error('not implemented');
	}
}
