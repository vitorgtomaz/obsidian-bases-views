import type { SearchState } from '../types';
import { debounce } from '../utils/debounce';

export interface SearchBoxOptions {
	state: SearchState;
	onChange: (next: SearchState) => void;
	debounceMs?: number;
}

export class SearchBox {
	private rootEl: HTMLElement | null = null;
	private inputEl!: HTMLInputElement;
	private countEl!: HTMLElement;
	private state: SearchState;
	private readonly onChangedDebounced: (next: SearchState) => void;

	constructor(private readonly opts: SearchBoxOptions) {
		this.state = { ...opts.state };
		this.onChangedDebounced = debounce(opts.onChange, opts.debounceMs ?? 80);
	}

	mount(parentEl: HTMLElement): HTMLElement {
		this.rootEl = parentEl.createDiv('bv-search-box');

		// Search icon button (toggles expanded)
		const iconBtn = this.rootEl.createEl('button', { cls: 'bv-search-icon clickable-icon', attr: { 'aria-label': 'Search' } });
		iconBtn.innerHTML = '&#128269;';

		// Input (hidden by default)
		const inputWrap = this.rootEl.createDiv('bv-search-input-wrap');
		inputWrap.style.display = 'none';

		this.inputEl = inputWrap.createEl('input', { type: 'text', cls: 'bv-search-input', attr: { placeholder: 'Search…' } });
		this.countEl = inputWrap.createSpan({ cls: 'bv-search-count', text: '' });

		const clearBtn = inputWrap.createEl('button', { cls: 'bv-search-clear clickable-icon', text: '✕' });

		// Toggle
		iconBtn.onclick = () => {
			const hidden = inputWrap.style.display === 'none';
			inputWrap.style.display = hidden ? 'flex' : 'none';
			if (hidden) this.inputEl.focus();
		};

		// Live search
		this.inputEl.oninput = () => {
			this.state = { ...this.state, term: this.inputEl.value };
			this.onChangedDebounced(this.state);
		};

		// Esc clears and collapses
		this.inputEl.onkeydown = (ev) => {
			if (ev.key === 'Escape') {
				this.clear();
				inputWrap.style.display = 'none';
			}
		};

		clearBtn.onclick = () => this.clear();

		return this.rootEl;
	}

	setCount(visible: number, total: number): void {
		if (!this.countEl) return;
		this.countEl.setText(visible < total ? `${visible} / ${total}` : '');
	}

	clear(): void {
		if (this.inputEl) this.inputEl.value = '';
		this.state = { ...this.state, term: '' };
		this.opts.onChange(this.state);
	}

	unmount(): void {
		this.rootEl?.detach();
		this.rootEl = null;
	}
}
