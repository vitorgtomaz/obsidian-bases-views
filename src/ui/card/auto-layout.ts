/**
 * Pick a sensible CardLayout when the user hasn't customised one.
 *
 * Heuristic (PRD §4.9):
 *   1. cover  — first property whose value sniffs as image (URL/extension or
 *               markdown image), or whose name matches /cover|image|thumbnail|banner/i.
 *   2. title  — `title` property if present and non-empty across most entries,
 *               else the file's basename via { property: 'filename' }.
 *   3. badges — first list/tags/multi-select property, single chip slot.
 *   4. body   — up to 3 remaining properties, frequency-ranked, excluding the
 *               group-by property and anything already used above.
 *
 * Stable across renders given the same inputs (no RNG here — that's only for
 * group-by tiebreak in views/kanban/auto-group-by.ts).
 */

import type {
	CardLayout,
	PropertyDescriptor,
	ViewEntry,
} from '../../types';

export interface AutoLayoutInput {
	entries: readonly ViewEntry[];
	descriptors: readonly PropertyDescriptor[];
	/** Property already used as group-by — exclude from body slots. */
	excludeProperties?: readonly string[];
}

export function autoCardLayout(input: AutoLayoutInput): CardLayout {
	// Pseudocode:
	//   used = new Set(input.excludeProperties ?? [])
	//   layout = {}
	//
	//   // 1. Cover
	//   const coverDesc = pickCover(input.descriptors, input.entries)
	//   if coverDesc: layout.cover = { property: coverDesc.key, style: 'image' }; used.add(coverDesc.key)
	//
	//   // 2. Title
	//   if input.descriptors.find(d => d.key === 'title'):
	//     layout.title = { property: 'title', fallback: { property: 'filename' } }
	//     used.add('title')
	//   else:
	//     layout.title = { property: 'filename' }
	//
	//   // 3. Badges
	//   const badgeDesc = input.descriptors.find(d =>
	//     !used.has(d.key) && (d.type === 'list' || d.type === 'tags' || (d.type === 'string' && d.enumValues))
	//   )
	//   if badgeDesc: layout.badges = [{ property: badgeDesc.key, style: 'pill' }]; used.add(badgeDesc.key)
	//
	//   // 4. Body — frequency-ranked remaining properties
	//   const ranked = input.descriptors
	//     .filter(d => !used.has(d.key))
	//     .map(d => ({ d, freq: frequency(d.key, input.entries) }))
	//     .sort((a, b) => b.freq - a.freq)
	//     .slice(0, 3)
	//     .map(({ d }) => ({ property: d.key }))
	//   if ranked.length: layout.body = ranked
	//
	//   return layout
	throw new Error('not implemented');
}

/** Return a descriptor whose values look image-like, or null. */
function pickCover(
	descriptors: readonly PropertyDescriptor[],
	entries: readonly ViewEntry[],
): PropertyDescriptor | null {
	// 1. Prefer descriptors with type === 'image'.
	// 2. Else look for keys matching /^(cover|image|thumbnail|banner|hero)$/i.
	// 3. Else sniff: scan up to 50 entries; if ≥ 60% of non-empty values for
	//    a property match an image URL/extension regex, use it.
	throw new Error('not implemented');
}

function frequency(key: string, entries: readonly ViewEntry[]): number {
	// Share of entries with a non-empty value for `key`. Used to rank body slots.
	throw new Error('not implemented');
}
