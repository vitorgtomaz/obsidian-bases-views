/**
 * Image renderer.
 *
 * Accepts:
 *   - slot.style === 'image'
 *   - value is a string matching an image URL/extension OR a markdown image
 *   - propType === 'image'
 *
 * Produces an <img> with loading="lazy", decoding="async", object-fit from
 * slot.fit (default 'cover'). Resolves wikilinks via the vault.
 */

import type { RendererSpec } from '../renderer-registry';

const IMG_EXT_RX = /\.(png|jpe?g|webp|gif|svg|avif)(\?|$)/i;
const MD_IMG_RX = /^!\[[^\]]*\]\(([^)]+)\)/;
const WIKI_IMG_RX = /^!\[\[([^\]]+)\]\]/;

export const imageRenderer: RendererSpec = {
	id: 'image',
	weight: 50,
	accepts(value, slot, propType) {
		if (slot.style === 'image' || propType === 'image') return true;
		if (typeof value !== 'string') return false;
		return IMG_EXT_RX.test(value) || MD_IMG_RX.test(value) || WIKI_IMG_RX.test(value);
	},
	render(value, slot, ctx) {
		// Pseudocode:
		//   const url = resolveImageHref(value, ctx)  // see helper below
		//   const img = createEl('img', { cls: 'bv-card-img' })
		//   img.loading = 'lazy'; img.decoding = 'async'
		//   img.style.objectFit = (slot.fit as string) ?? 'cover'
		//   img.src = url
		//   img.alt = ''  // decorative
		//   return img
		//
		// resolveImageHref:
		//   - markdown image  ![](X)  → X
		//   - wikilink        ![[X]]  → ctx.app.vault.adapter.getResourcePath(X) via metadataCache lookup
		//   - bare URL                → return as-is
		//   - bare vault path         → app.vault.adapter.getResourcePath(path)
		throw new Error('not implemented');
	},
};
