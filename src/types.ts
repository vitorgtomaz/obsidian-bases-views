/**
 * Shared types for the engine.
 *
 * Real Obsidian Bases types (BasesView, QueryController, BasesEntry, Value,
 * BasesPropertyId, ViewOption…) are imported directly from `obsidian`.
 * This file defines only our own abstractions on top.
 */

import type { FrontMatterCache, TFile } from 'obsidian';

/* ------------------------------------------------------------------ */
/*  Engine-wide normalised types                                       */
/* ------------------------------------------------------------------ */

/** The uniform record shape every view consumes. Built once per data tick. */
export interface ViewEntry {
	file: TFile;
	displayName: string;
	frontmatter: FrontMatterCache | null;
	/**
	 * Property values keyed by the bare property name (without the
	 * `note.` / `file.` / `formula.` prefix). Coerced to JS primitives.
	 *
	 * List values → string[]
	 * Dates       → ISO string
	 * Booleans    → boolean
	 * Numbers     → number
	 * Nulls       → null
	 */
	properties: Record<string, unknown>;
}

/** Lightweight descriptor derived from BasesPropertyId + value inspection. */
export interface PropertyDescriptor {
	/** Full BasesPropertyId, e.g. 'note.status'. */
	id: string;
	/** Bare name without prefix, e.g. 'status'. */
	key: string;
	/** Inferred value type based on actual data. */
	type: PropertyType;
	/** For string properties with few distinct values, lists them. */
	enumValues?: string[];
}

export type PropertyType =
	| 'string'
	| 'number'
	| 'boolean'
	| 'date'
	| 'datetime'
	| 'list'
	| 'tags'
	| 'image'
	| 'link'
	| 'unknown';

/* ------------------------------------------------------------------ */
/*  Card layout (see PRD §4.9)                                         */
/* ------------------------------------------------------------------ */

export interface SlotConfig {
	/** Frontmatter key (bare name), OR special tokens: 'filename' | 'path'. */
	property: string;
	/** Renderer hint id; if absent the registry picks by value type. */
	style?: string;
	/** Fallback value or another property to use when value is missing/empty. */
	fallback?: string | { property: string };
	/** Renderer-specific options (lines, fit, dateFormat, unit, …). */
	[opt: string]: unknown;
}

export interface CardLayout {
	cover?: SlotConfig;
	title?: SlotConfig;
	badges?: SlotConfig[];
	body?: SlotConfig[];
}

/* ------------------------------------------------------------------ */
/*  Search state (ephemeral — not persisted)                           */
/* ------------------------------------------------------------------ */

export interface SearchState {
	term: string;
	scopes: { name: boolean; path: boolean; properties: boolean; body: boolean };
}
