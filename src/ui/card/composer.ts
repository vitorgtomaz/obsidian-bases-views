/**
 * CardComposer — turns (ViewEntry, CardLayout) into a card DOM element.
 *
 * The DOM shape is stable so styles.css can target it reliably:
 *   .bv-card
 *     .bv-card-cover    (optional)
 *     .bv-card-title
 *     .bv-card-badges   (optional, contains .bv-badge children)
 *     .bv-card-body     (optional, contains .bv-card-row children)
 *
 * The composer is hot-path code: same view re-runs it for every card on every
 * data tick. Optimisations:
 *   - reuse the passed `recycledEl` when present (mutate in place).
 *   - skip slots whose value didn't change since last render (cheap shallow
 *     compare cached on the element via a WeakMap).
 */

import type {
	CardLayout,
	PropertyDescriptor,
	SlotConfig,
	ViewEntry,
} from '../../types';
import type { RendererRegistry, RenderCtx } from './renderer-registry';

export interface CardComposerOptions {
	registry: RendererRegistry;
	/** Property descriptors keyed by property name; used for type hints. */
	descriptors: Map<string, PropertyDescriptor>;
	/** Source id for hover-link wiring inside renderers. */
	source: string;
}

export class CardComposer {
	/** Per-element cache of last rendered slot signatures, for diff-skip. */
	private readonly memo = new WeakMap<HTMLElement, Map<string, unknown>>();

	constructor(private readonly opts: CardComposerOptions) {}

	/**
	 * Build (or update) a card element for `entry` using `layout`.
	 *
	 * If `recycledEl` is provided, the same DOM is mutated in place. This is
	 * important inside VirtualList, which recycles nodes for scroll perf.
	 */
	compose(
		entry: ViewEntry,
		layout: CardLayout,
		ctx: Omit<RenderCtx, 'file'>,
		recycledEl: HTMLElement | null,
	): HTMLElement {
		// Pseudocode:
		//   const root = recycledEl ?? createDiv('bv-card')
		//   ctx2 = { ...ctx, file: entry.file }
		//   memo = this.memo.get(root) ?? new Map()
		//
		//   renderSlot('cover',  layout.cover,    'bv-card-cover')
		//   renderSlot('title',  layout.title,    'bv-card-title', { titleFallback: entry.displayName })
		//   renderSlots('badges', layout.badges, 'bv-card-badges', 'bv-badge')
		//   renderSlots('body',   layout.body,   'bv-card-body',   'bv-card-row')
		//
		//   this.memo.set(root, memo)
		//   return root
		//
		// renderSlot logic:
		//   const value = resolveValue(entry, slot)
		//   const sig = signature(value, slot)
		//   if memo.get(slotKey) === sig: skip (DOM stays as-is)
		//   else:
		//     const renderer = this.opts.registry.pick(value, slot, this.opts.descriptors.get(slot.property)?.type)
		//     const el = renderer.render(value, slot, ctx2)
		//     attach el under the appropriate parent (replace previous if needed)
		//     memo.set(slotKey, sig)
		throw new Error('not implemented');
	}

	/* -------------------- helpers -------------------- */

	/**
	 * Resolve `slot.property` against `entry`. Special tokens:
	 *   'filename' → entry.file.basename
	 *   'path'     → entry.file.path
	 * Else: entry.properties[key]
	 *
	 * If the result is null/undefined/empty AND slot.fallback is set, recurse
	 * on the fallback (string literal or { property }).
	 */
	private resolveValue(entry: ViewEntry, slot: SlotConfig): unknown {
		throw new Error('not implemented');
	}

	/** Cheap shallow signature for diff-skip. Stable across ticks for same value. */
	private signature(value: unknown, slot: SlotConfig): unknown {
		// Pseudocode:
		//   for primitives: return value
		//   for arrays:    return JSON.stringify(value)  (cards rarely have huge arrays)
		//   for objects:   return JSON.stringify(value)
		//   plus include slot.style so style switches re-render
		throw new Error('not implemented');
	}
}
