/**
 * FilterPanel — simple chip-based filter popover.
 *
 * v1 scope: property-equals and folder-filter chips. The Bases-native filter
 * round-trip is a v1.1 concern; for now filters are applied in-memory and
 * visible only inside this view.
 */

import type { PropertyDescriptor } from '../types';

export interface FilterChip {
	property: string;
	value: string;
}

export interface FilterPanelOptions {
	properties: readonly PropertyDescriptor[];
	chips: FilterChip[];
	onChange: (chips: FilterChip[]) => void;
}

export class FilterPanel {
	private rootEl: HTMLElement | null = null;

	constructor(private opts: FilterPanelOptions) {}

	mount(anchorEl: HTMLElement): void {
		this.close();
		const panel = document.createElement('div');
		panel.className = 'bv-filter-panel';

		const header = panel.createDiv('bv-filter-header');
		header.createEl('strong', { text: 'Filters' });

		const chipList = panel.createDiv('bv-filter-chips');
		this.renderChips(chipList);

		// Add filter row
		const addRow = panel.createDiv('bv-filter-add-row');
		const propSel = addRow.createEl('select', { cls: 'bv-filter-prop-select' });
		propSel.createEl('option', { value: '', text: 'Property…' });
		for (const d of this.opts.properties) {
			propSel.createEl('option', { value: d.key, text: d.key });
		}
		const valInput = addRow.createEl('input', { type: 'text', cls: 'bv-filter-val-input', attr: { placeholder: 'Value…' } });
		const addBtn = addRow.createEl('button', { cls: 'bv-filter-add-btn', text: 'Add' });
		addBtn.onclick = () => {
			if (!propSel.value || !valInput.value.trim()) return;
			const next = [...this.opts.chips, { property: propSel.value, value: valInput.value.trim() }];
			this.opts.chips = next;
			this.opts.onChange(next);
			propSel.value = '';
			valInput.value = '';
			this.renderChips(chipList);
		};

		// Position below anchor
		const rect = anchorEl.getBoundingClientRect();
		panel.style.position = 'fixed';
		panel.style.top = `${rect.bottom + 4}px`;
		panel.style.left = `${rect.left}px`;
		panel.style.zIndex = '1000';

		document.body.appendChild(panel);
		this.rootEl = panel;

		// Dismiss on click outside
		const dismiss = (ev: MouseEvent) => {
			if (!panel.contains(ev.target as Node)) {
				this.close();
				document.removeEventListener('mousedown', dismiss);
			}
		};
		setTimeout(() => document.addEventListener('mousedown', dismiss), 0);
	}

	private renderChips(chipList: HTMLElement): void {
		chipList.empty();
		for (let i = 0; i < this.opts.chips.length; i++) {
			const chip = this.opts.chips[i];
			if (!chip) continue;
			const chipEl = chipList.createDiv('bv-filter-chip');
			chipEl.createSpan({ text: `${chip.property} = ${chip.value}` });
			const remove = chipEl.createEl('button', { text: '✕', cls: 'bv-filter-chip-remove' });
			const idx = i;
			remove.onclick = () => {
				const next = this.opts.chips.filter((_, j) => j !== idx);
				this.opts.chips = next;
				this.opts.onChange(next);
				this.renderChips(chipList);
			};
		}
	}

	close(): void {
		this.rootEl?.detach();
		this.rootEl = null;
	}
}
