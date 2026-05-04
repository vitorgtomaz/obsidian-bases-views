import type { RendererSpec } from '../renderer-registry';

const IMG_EXT_RX = /\.(png|jpe?g|webp|gif|svg|avif)(\?|#|$)/i;
const MD_IMG_RX = /^!\[[^\]]*\]\(([^)]+)\)/;
const WIKI_IMG_RX = /^!\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/;

function looksLikeImage(s: string): boolean {
	return IMG_EXT_RX.test(s) || MD_IMG_RX.test(s) || WIKI_IMG_RX.test(s);
}

function resolveHref(value: string, ctx: import('../renderer-registry').RenderCtx): string {
	const wikiMatch = WIKI_IMG_RX.exec(value);
	if (wikiMatch?.[1]) {
		const file = ctx.app.metadataCache.getFirstLinkpathDest(wikiMatch[1], ctx.file.path);
		return file ? ctx.app.vault.getResourcePath(file) : value;
	}
	const mdMatch = MD_IMG_RX.exec(value);
	if (mdMatch?.[1]) return mdMatch[1];
	// Bare URL or vault path
	if (/^https?:\/\//i.test(value)) return value;
	const vaultFile = ctx.app.vault.getFileByPath(value);
	return vaultFile ? ctx.app.vault.getResourcePath(vaultFile) : value;
}

export const imageRenderer: RendererSpec = {
	id: 'image',
	weight: 50,
	accepts(value, slot, propType) {
		if (slot.style === 'image' || propType === 'image') return true;
		return typeof value === 'string' && looksLikeImage(value);
	},
	render(value, slot, ctx) {
		const wrap = document.createElement('div');
		wrap.className = 'bv-card-cover';
		const img = wrap.createEl('img', { cls: 'bv-card-img' });
		img.loading = 'lazy';
		img.decoding = 'async';
		img.style.objectFit = (slot.fit as string) ?? 'cover';
		img.alt = '';
		img.src = resolveHref(String(value ?? ''), ctx);
		return wrap;
	},
};
