import { App, PluginSettingTab, Setting } from 'obsidian';
import type BasesViewsPlugin from './main';

export interface BasesViewsSettings {
	touchDragHoldMs: number;
	hoverPreviewOnModifier: boolean;
	bodySearchCacheSize: number;
}

export const DEFAULT_SETTINGS: BasesViewsSettings = {
	touchDragHoldMs: 250,
	hoverPreviewOnModifier: true,
	bodySearchCacheSize: 50,
};

export class BasesViewsSettingTab extends PluginSettingTab {
	constructor(app: App, private readonly plugin: BasesViewsPlugin) {
		super(app, plugin);
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		containerEl.createEl('h2', { text: 'Bases Views' });

		new Setting(containerEl)
			.setName('Touch drag hold (ms)')
			.setDesc('How long a touch must stay still before a card drag starts on mobile.')
			.addSlider((s) =>
				s.setLimits(100, 800, 50)
					.setValue(this.plugin.settings.touchDragHoldMs)
					.setDynamicTooltip()
					.onChange(async (v) => {
						this.plugin.settings.touchDragHoldMs = v;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName('Hover preview on modifier')
			.setDesc('Show Obsidian\'s native page preview when hovering a card while holding Ctrl / ⌘.')
			.addToggle((t) =>
				t.setValue(this.plugin.settings.hoverPreviewOnModifier).onChange(async (v) => {
					this.plugin.settings.hoverPreviewOnModifier = v;
					await this.plugin.saveSettings();
				}),
			);

		new Setting(containerEl)
			.setName('Body search cache size')
			.setDesc('Maximum number of note bodies cached for full-text search (higher = more memory).')
			.addSlider((s) =>
				s.setLimits(10, 200, 10)
					.setValue(this.plugin.settings.bodySearchCacheSize)
					.setDynamicTooltip()
					.onChange(async (v) => {
						this.plugin.settings.bodySearchCacheSize = v;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName('Restore defaults')
			.addButton((b) =>
				b.setButtonText('Restore').onClick(async () => {
					Object.assign(this.plugin.settings, DEFAULT_SETTINGS);
					await this.plugin.saveSettings();
					this.display();
				}),
			);
	}
}
