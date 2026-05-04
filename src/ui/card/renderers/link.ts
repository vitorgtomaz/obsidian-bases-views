import type { RendererSpec } from '../renderer-registry';

const WIKI_RX = /^\[\[([^\]|]+)(?:\|([^\]]+))?\]\]$/;
const MD_RX = /^\[([^\]]+)\]\(([^)]+)\)$/;
const URL_RX = /^https?:\/\/\S+$/i;

export const linkRenderer: RendererSpec = {
	id: 'link',
	weight: 30,
	accepts(value, slot, propType) {
		if (slot.style === 'link') return true;
		if (propType === 'link') return true;
		if (typeof value !== 'string') return false;
		return WIKI_RX.test(value) || MD_RX.test(value) || URL_RX.test(value);
	},
	render(value, _slot, ctx) {
		const a = document.createElement('a');
		a.className = 'bv-link';
		const s = String(value ?? '');

		const wikiM = WIKI_RX.exec(s);
		if (wikiM?.[1]) {
			a.textContent = wikiM[2] ?? wikiM[1];
			a.onclick = (ev) => {
				ev.stopPropagation();
				ev.preventDefault();
				ctx.app.workspace.openLinkText(wikiM[1]!, ctx.file.path, false);
			};
			return a;
		}

		const mdM = MD_RX.exec(s);
		if (mdM?.[1] && mdM?.[2]) {
			a.textContent = mdM[1];
			a.onclick = (ev) => {
				ev.stopPropagation();
				ev.preventDefault();
				ctx.app.workspace.openLinkText(mdM[2]!, ctx.file.path, false);
			};
			return a;
		}

		if (URL_RX.test(s)) {
			a.textContent = s;
			a.href = s;
			a.target = '_blank';
			a.rel = 'noopener';
			a.onclick = (ev) => ev.stopPropagation();
			return a;
		}

		a.textContent = s;
		return a;
	},
};
