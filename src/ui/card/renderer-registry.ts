/**
 * Type-aware renderer registry. See PRD §4.9.
 *
 * A renderer turns one (value, slot, ctx) triple into one HTMLElement. The
 * registry picks the highest-weight matching renderer for a given value/slot.
 * Plugins (or future views) can register additional renderers.
 *
 * The registry is a singleton on the plugin instance — passed into CardComposer
 * and ultimately into each renderer call.
 */

import type { App, TFile } from 'obsidian';
import type { PropertyType, SlotConfig } from '../../types';

/** Context handed to every renderer. Keep small — renderers are pure-ish. */
export interface RenderCtx {
	app: App;
	/** The file the card represents — used for resolving wikilinks/images. */
	file: TFile;
	/** Source view id, e.g. 'bases-views.kanban'. Used by hover-link/source. */
	source: string;
}

export type PropertyRenderer = (
	value: unknown,
	slot: SlotConfig,
	ctx: RenderCtx,
) => HTMLElement;

export interface RendererSpec {
	id: string;
	/**
	 * Decide whether this renderer should handle the value. `propType` may be
	 * undefined when the property descriptor isn't known; renderers should
	 * fall back to value-shape sniffing.
	 */
	accepts: (value: unknown, slot: SlotConfig, propType?: PropertyType) => boolean;
	render: PropertyRenderer;
	/** Higher wins. Built-ins use 0..100; custom renderers can outrank with > 100. */
	weight?: number;
}

export class RendererRegistry {
	private specs: RendererSpec[] = [];

	register(spec: RendererSpec): void {
		// Push, then re-sort by weight desc. Tiny list — sort cost negligible.
		throw new Error('not implemented');
	}

	/**
	 * Return the renderer that best matches the value/slot.  If `slot.style`
	 * is set, prefer the renderer whose id matches it (regardless of weight).
	 */
	pick(value: unknown, slot: SlotConfig, propType?: PropertyType): RendererSpec {
		// Pseudocode:
		//   if slot.style: return this.specs.find(s => s.id === slot.style && s.accepts(value, slot, propType)) ?? fallback
		//   for spec of this.specs (already sorted by weight desc):
		//     if spec.accepts(value, slot, propType) return spec
		//   return the 'text' fallback
		throw new Error('not implemented');
	}
}
