import { Menu } from 'obsidian';
import type { PropertyDescriptor } from '../types';

export interface GroupByButtonOptions {
	onChange: (propId: string | null) => void;
	/** Restrict which properties are listed. */
	filter?: (desc: PropertyDescriptor) => boolean;
}

export class GroupByButton {
	private rootEl: HTMLButtonElement | null = null;
	private labelEl!: HTMLElement;
	private properties: readonly PropertyDescriptor[] = [];
	private selectedPropId: string | null = null;

	constructor(private readonly opts: GroupByButtonOptions) {}

	mount(parentEl: HTMLElement): HTMLElement {
		this.rootEl = parentEl.createEl('button', {
			cls: 'bv-group-by-btn clickable-icon',
			attr: { 'aria-label': 'Group by' },
		});
		this.labelEl = this.rootEl.createSpan({ cls: 'bv-group-by-label' });
		this.rootEl.createSpan({ cls: 'bv-group-by-caret', text: ' ▾' });
		this.rootEl.onclick = (ev) => this.openMenu(ev);
		this.updateLabel();
		return this.rootEl;
	}

	setProperties(properties: readonly PropertyDescriptor[]): void {
		this.properties = properties;
		this.updateLabel();
	}

	setSelection(propId: string | null): void {
		this.selectedPropId = propId;
		this.updateLabel();
	}

	unmount(): void {
		this.rootEl?.detach();
		this.rootEl = null;
	}

	private updateLabel(): void {
		if (!this.labelEl) return;
		const desc = this.properties.find((p) => p.id === this.selectedPropId);
		this.labelEl.setText(desc ? `Group by: ${desc.key}` : 'Group by');
	}

	private openMenu(ev: MouseEvent): void {
		const menu = new Menu();
		const candidates = this.opts.filter
			? this.properties.filter(this.opts.filter)
			: [...this.properties];
		candidates.sort((a, b) => a.key.localeCompare(b.key));

		menu.addItem((item) =>
			item.setTitle('None')
				.setChecked(this.selectedPropId === null)
				.onClick(() => this.opts.onChange(null)),
		);
		if (candidates.length > 0) menu.addSeparator();
		for (const p of candidates) {
			menu.addItem((item) =>
				item.setTitle(p.key)
					.setChecked(p.id === this.selectedPropId)
					.onClick(() => this.opts.onChange(p.id)),
			);
		}
		menu.showAtMouseEvent(ev);
	}
}
