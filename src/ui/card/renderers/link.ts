/**
 * Link renderer — wikilinks, markdown links, and bare URLs.
 *
 * Click behaviour:
 *   - Wiki/internal link → app.workspace.openLinkText(target, sourcePath)
 *   - External URL       → window.open(url, '_blank')  (Obsidian handles ext links)
 *
 * Stops propagation so clicking a link inside a card doesn't also open the card.
 */

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
		// Pseudocode:
		//   const a = createEl('a', { cls: 'bv-link' })
		//   const s = String(value ?? '')
		//   if WIKI_RX matches: target = m[1], label = m[2] ?? m[1]
		//     a.textContent = label
		//     a.onclick = (ev) => {
		//       ev.stopPropagation(); ev.preventDefault()
		//       ctx.app.workspace.openLinkText(target, ctx.file.path, false)
		//     }
		//   else if MD_RX matches: ditto with target=m[2], label=m[1]
		//   else if URL_RX matches:
		//     a.textContent = s
		//     a.href = s; a.target = '_blank'; a.rel = 'noopener'
		//     a.onclick = (ev) => ev.stopPropagation()
		//   else:
		//     a.textContent = s
		//   return a
		throw new Error('not implemented');
	},
};
