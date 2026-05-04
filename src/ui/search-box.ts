/**
 * SearchBox — live-typed search bar shown in the toolbar.
 *
 * Behaviour:
 *  - Toggled by the search button: collapsed (icon) → expanded (input).
 *  - Live filters via onChange (debounced 80 ms).
 *  - Body-content scope is opt-in (cog menu inside the box).
 *  - Esc clears and collapses.
 *  - Result count chip on the right ("12 / 134 visible") — updated by caller.
 */

import type { SearchState } from '../types';

export interface SearchBoxOptions {
	state: SearchState;
	onChange: (next: SearchState) => void;
	debounceMs?: number;
}

export class SearchBox {
	private inputEl!: HTMLInputElement;
	private countEl!: HTMLElement;
	private rootEl: HTMLElement | null = null;

	constructor(private readonly opts: SearchBoxOptions) {}

	/** Append the search bar root to `parentEl`. Returns the root for layout. */
	mount(parentEl: HTMLElement): HTMLElement {
		// 1. Create wrapper, input, scope-cog button, count chip.
		// 2. Wire input.oninput → debounced this.opts.onChange({ ...state, term })
		// 3. Wire Esc to clear + emit + collapse.
		// 4. Cog opens an Obsidian Menu with toggles for name/path/properties/body.
		// 5. Return rootEl.
		throw new Error('not implemented');
	}

	/** Update the "12 / 134" count without re-rendering anything else. */
	setCount(visible: number, total: number): void {
		throw new Error('not implemented');
	}

	/** Programmatic clear (used by the toolbar when user clicks X icon). */
	clear(): void {
		throw new Error('not implemented');
	}

	unmount(): void {
		// Detach root, drop refs.
		throw new Error('not implemented');
	}
}
