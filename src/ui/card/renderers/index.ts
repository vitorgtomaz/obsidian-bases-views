/**
 * Built-in renderers, in registration order. Order ≠ priority — priority is
 * driven by RendererSpec.weight. We re-export them so plugin code can
 * register any subset on a custom registry (e.g. for tests).
 */

import type { RendererRegistry } from '../renderer-registry';

import { imageRenderer } from './image';
import { pillRenderer } from './pill';
import { textRenderer, textMutedRenderer } from './text';
import { dateRenderer } from './date';
import { linkRenderer } from './link';
import { checkboxRenderer } from './checkbox';
import { numberRenderer } from './number';

export function registerBuiltins(registry: RendererRegistry): void {
	registry.register(imageRenderer);
	registry.register(pillRenderer);
	registry.register(linkRenderer);
	registry.register(dateRenderer);
	registry.register(checkboxRenderer);
	registry.register(numberRenderer);
	registry.register(textMutedRenderer);
	// `text` MUST be registered last so it acts as the universal fallback.
	registry.register(textRenderer);
}

export {
	imageRenderer,
	pillRenderer,
	textRenderer,
	textMutedRenderer,
	dateRenderer,
	linkRenderer,
	checkboxRenderer,
	numberRenderer,
};
