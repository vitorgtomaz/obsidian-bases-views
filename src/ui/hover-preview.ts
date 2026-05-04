import type { App, TFile } from 'obsidian';

export interface HoverPreviewOptions {
	source: string;
	requireModifier: boolean;
}

export function attachHoverPreview(
	app: App,
	el: HTMLElement,
	file: TFile,
	opts: HoverPreviewOptions,
): () => void {
	const handler = (ev: MouseEvent) => {
		if (opts.requireModifier && !ev.ctrlKey && !ev.metaKey) return;
		app.workspace.trigger('hover-link', {
			event: ev,
			source: opts.source,
			hoverParent: el,
			targetEl: el,
			linktext: file.path,
		});
	};
	el.addEventListener('mouseover', handler);
	return () => el.removeEventListener('mouseover', handler);
}
