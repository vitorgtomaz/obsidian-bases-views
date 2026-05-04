/**
 * Plugin entry point. Keep this file minimal: lifecycle + view registration only.
 *
 * Responsibilities:
 *  - Load settings.
 *  - Register every view type via Plugin.registerBasesView. Each call returns
 *    `false` if the core Bases plugin isn't enabled — in that case, surface a
 *    single Notice and bail (do NOT throw; the user may enable Bases later and
 *    re-enable our plugin).
 *  - Mount the settings tab.
 *  - Cleanly tear down on unload (most listeners are auto-cleaned via the
 *    Plugin/Component base class; just trust the framework).
 */

import { Notice, Plugin } from 'obsidian';

import { DEFAULT_SETTINGS, BasesViewsSettings, BasesViewsSettingTab } from './settings';
import { KanbanView, KANBAN_VIEW_ID } from './views/kanban/kanban-view';
import { kanbanOptionsSchema } from './views/kanban/kanban-options';
import { kanbanIcon } from './views/kanban/kanban-view';

export default class BasesViewsPlugin extends Plugin {
	settings!: BasesViewsSettings;

	async onload(): Promise<void> {
		await this.loadSettings();

		// Register the Kanban view. Add future view types in the same shape.
		const kanbanRegistered = this.registerBasesView(KANBAN_VIEW_ID, {
			name: 'Kanban',
			icon: kanbanIcon,
			factory: (controller, containerEl) => new KanbanView(controller, containerEl, this),
			options: kanbanOptionsSchema,
		});

		if (!kanbanRegistered) {
			// Bases core plugin is disabled; show a friendly notice and stop.
			// Settings tab still mounts so the user has a place to learn why.
			new Notice('Bases Views: enable the core Bases plugin to use these views.', 8_000);
		}

		this.addSettingTab(new BasesViewsSettingTab(this.app, this));
	}

	onunload(): void {
		// Nothing to do: Bases unregisters our views automatically; Component
		// children clean up via this.register* hooks.
	}

	async loadSettings(): Promise<void> {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			(await this.loadData()) as Partial<BasesViewsSettings>,
		);
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}
}
