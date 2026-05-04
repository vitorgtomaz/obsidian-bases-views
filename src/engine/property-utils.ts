/**
 * Property-type detection, value coercion, and group-by inference.
 *
 * Pure functions — easy to unit test and reuse across views.
 */

import type {
	FilterClause,
	PropertyDescriptor,
	PropertyType,
	ViewEntry,
} from '../types';

/* ------------------------------------------------------------------ */
/*  Type detection                                                     */
/* ------------------------------------------------------------------ */

/** Best-effort runtime type detection for a single value. */
export function detectType(value: unknown): PropertyType {
	// Order matters; check most specific first.
	//   null/undefined → 'unknown'
	//   boolean → 'boolean'
	//   number → 'number'
	//   Array → 'list' (consider 'tags' if every element is a string starting with '#')
	//   Date instance → 'datetime'
	//   string:
	//     - matches ISO date YYYY-MM-DD                    → 'date'
	//     - matches ISO datetime                            → 'datetime'
	//     - matches markdown image  ![](…) or image url    → 'image'
	//     - matches wikilink [[…]] or markdown link [..](.) → 'link'
	//     - else                                            → 'string'
	//   object → 'unknown'
	throw new Error('not implemented');
}

/** Resolve a PropertyDescriptor against a sample of values across entries. */
export function inferDescriptor(
	key: string,
	entries: readonly ViewEntry[],
): PropertyDescriptor {
	// Walk up to N entries (e.g. 200), call detectType on entry.properties[key],
	// pick the most frequent non-'unknown' type. Distinct values < 30 with type
	// 'string' → consider it an enum (return enumValues sorted).
	throw new Error('not implemented');
}

/* ------------------------------------------------------------------ */
/*  Coercion                                                           */
/* ------------------------------------------------------------------ */

/**
 * Coerce raw value to a stable JS form for comparisons & rendering.
 *  - dates → ISO string
 *  - tags → array of strings without leading '#'
 *  - numbers → Number()
 *  - lists → array (wrap scalar)
 */
export function coerce(value: unknown, type: PropertyType): unknown {
	throw new Error('not implemented');
}

/** Stable, locale-aware comparator for sort/group-by ordering. */
export function compareValues(a: unknown, b: unknown, type: PropertyType): number {
	// Empty/null sorts last regardless of direction.
	// 'date'/'datetime' compare by Date.parse.
	// 'number' numeric.
	// 'string' Intl.Collator with { numeric: true, sensitivity: 'base' }.
	// 'list' compare by JSON.stringify (deterministic, rarely sorted anyway).
	throw new Error('not implemented');
}

/* ------------------------------------------------------------------ */
/*  Filter evaluation                                                  */
/* ------------------------------------------------------------------ */

/** Evaluate a single FilterClause against a ViewEntry. */
export function evaluateClause(entry: ViewEntry, clause: FilterClause): boolean {
	// Pseudocode dispatch table:
	//   eq/neq/contains/startsWith/endsWith → string ops on coerced value
	//   in/notIn → Array.includes on coerced value
	//   has/notHas → for list properties, check element membership
	//   between → numeric or date range, inclusive
	//   inFolder → entry.file.path.startsWith(value + '/')
	//   and/or → recurse on clauses
	throw new Error('not implemented');
}

export function evaluateAll(entry: ViewEntry, clauses: readonly FilterClause[]): boolean {
	// AND together. Empty list → true.
	throw new Error('not implemented');
}

/* ------------------------------------------------------------------ */
/*  Group-by inference (used by Kanban auto-pick — see PRD §4.5)       */
/* ------------------------------------------------------------------ */

export interface GroupByCandidate {
	key: string;
	type: PropertyType;
	frequency: number; // share of entries that have a non-empty value [0..1]
	distinctCount: number;
}

/**
 * Score every property in `descriptors` against `entries` and return the
 * candidates suitable for grouping a Kanban (or any column-style view).
 *
 * Filtering rules:
 *   - type ∈ { 'string', 'list', 'tags' } and 2 ≤ distinctCount ≤ 30
 *   - exclude internal frontmatter keys: 'position', 'aliases', 'tags-source'
 *   - exclude properties with frequency < 0.4 (too sparse)
 */
export function rankGroupByCandidates(
	descriptors: readonly PropertyDescriptor[],
	entries: readonly ViewEntry[],
): GroupByCandidate[] {
	throw new Error('not implemented');
}
