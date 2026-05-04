/**
 * Trigger Obsidian's native page-preview popover.
 *
 * Obsidian fires hover-link via app.workspace.trigger; we listen for the user's
 * Ctrl/Cmd modifier (configurable in settings) so cards behave like wikilinks.
 *
 * This module is one tiny function — kept separate so future views import the
 * same call and the modifier gating lives in one place.
 */

import type { App, TFile } from 'obsidian';

export interface HoverPreviewOptions {
	/** Source identifier — usually the view id, e.g. 'bases-views.kanban'. */
	source: string;
	/** Only trigger when modifier is held; if false, always trigger on hover. */
	requireModifier: boolean;
}

/**
 * Wire `el` so hovering with the configured modifier shows Obsidian's preview
 * for `file`.  Returns an unsubscriber.
 *
 * Implementation:
 *   - Listen to mouseover (registerDomEvent in caller, since we don't have
 *     Component reference here).
 *   - On hover, if (!requireModifier || ev.ctrlKey || ev.metaKey):
 *       app.workspace.trigger('hover-link', {
 *         event: ev, source: opts.source, hoverParent: el,
 *         targetEl: el, linktext: file.path,
 *       })
 *   - The popover lifetime is owned by Obsidian.
 *
 * Mobile note: there is no hover on touch. Long-press could trigger the same
 * preview, but Obsidian's own page-preview core plugin already handles
 * long-press for wikilinks; we leave card preview as desktop-only and rely on
 * the click → open-in-pane behaviour for mobile.
 */
export function attachHoverPreview(
	app: App,
	el: HTMLElement,
	file: TFile,
	opts: HoverPreviewOptions,
): () => void {
	throw new Error('not implemented');
}
