/**
 * Plugin-level preferences (NOT per-view config — that lives in the .base file).
 *
 * Keep this surface tiny: the more knobs we expose here, the more state to
 * support across versions. Per-view options belong in the Bases options schema
 * for that view, not here.
 */

import { App, PluginSettingTab, Setting } from 'obsidian';
import type BasesViewsPlugin from './main';

export interface BasesViewsSettings {
	/** ms a touch must dwell before a card drag starts on mobile. */
	touchDragHoldMs: number;
	/** Trigger Obsidian's native hover preview on Ctrl/Cmd-hover over a card. */
	hoverPreviewOnModifier: boolean;
	/** Cap for in-memory body-content search index (LRU). */
	bodySearchCacheSize: number;
}

export const DEFAULT_SETTINGS: BasesViewsSettings = {
	touchDragHoldMs: 250,
	hoverPreviewOnModifier: true,
	bodySearchCacheSize: 50,
};

export class BasesViewsSettingTab extends PluginSettingTab {
	constructor(
		app: App,
		private readonly plugin: BasesViewsPlugin,
	) {
		super(app, plugin);
	}

	display(): void {
		// Render one Setting per field above. Keep copy short, sentence-case.
		// Reset values to DEFAULT_SETTINGS via a small "Restore defaults" button.
		// On every change call this.plugin.saveSettings(); no debounce needed —
		// settings UI is not a hot path.
		throw new Error('not implemented');
	}
}
