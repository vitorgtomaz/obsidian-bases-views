/**
 * Shared types for the engine.
 *
 * Some Obsidian Bases types (BasesView, QueryController, OptionConfig) are
 * available on the official `obsidian` typings since v1.10. We re-declare a
 * minimal local view of them here so the engine compiles in environments
 * where the typing has shifted, and so our code talks to a small, stable
 * surface we control. When the official typings are stable, prefer importing
 * directly from `obsidian`.
 */

import type { Component, FrontMatterCache, TFile } from 'obsidian';

/* ------------------------------------------------------------------ */
/*  Bases API surface (minimal stub)                                  */
/* ------------------------------------------------------------------ */

/**
 * The controller Bases passes to a custom view's factory. Exposes the current
 * filtered/sorted record set plus subscription hooks. We narrow this in
 * QueryAdapter so views never touch it directly.
 */
export interface QueryController {
	/** Raw records currently matching the .base filters/sorts. */
	getEntries(): BasesEntry[];
	/** Property descriptors known to the active query. */
	getProperties(): PropertyDescriptor[];
	/** The persisted view config blob (typed by the view's options schema). */
	getViewConfig<T = unknown>(): T;
	/** Persist a partial config patch into the .base file. */
	saveViewConfig<T = unknown>(patch: Partial<T>): Promise<void>;
	/** Subscribe to data ticks. Returns an unsubscriber. */
	on(event: 'data-updated' | 'config-updated', cb: () => void): () => void;
}

/** Bases passes us records as `{ file, properties }` blobs. */
export interface BasesEntry {
	file: TFile;
	properties: Record<string, unknown>;
}

/** Bases option-schema item shape. Driven by the same schema language used by
 *  the table/cards views. Keep loose; Bases is the source of truth. */
export type OptionConfig =
	| { type: 'property'; key: string; label: string; allowedTypes?: PropertyType[] }
	| { type: 'select'; key: string; label: string; options: Array<{ value: string; label: string }> }
	| { type: 'toggle'; key: string; label: string }
	| { type: 'number'; key: string; label: string; min?: number; max?: number }
	| { type: 'text'; key: string; label: string }
	| { type: 'group'; label: string; children: OptionConfig[] }
	| { type: 'list'; key: string; label: string; itemSchema: OptionConfig[] };

/** Subset of property types we recognise for renderer/group-by inference. */
export type PropertyType =
	| 'string'
	| 'number'
	| 'boolean'
	| 'date'
	| 'datetime'
	| 'list'
	| 'tags'
	| 'link'
	| 'image'
	| 'unknown';

export interface PropertyDescriptor {
	key: string;
	type: PropertyType;
	/** For enum-like properties Bases knows about (e.g. status, multi-select). */
	enumValues?: string[];
}

/* ------------------------------------------------------------------ */
/*  Engine-wide normalised types                                       */
/* ------------------------------------------------------------------ */

/** The uniform record shape every view consumes. Built once per data tick. */
export interface ViewEntry {
	file: TFile;
	displayName: string;
	frontmatter: FrontMatterCache | null;
	/** Coerced + flattened property map (frontmatter ∪ Bases-computed). */
	properties: Record<string, unknown>;
}

/* ------------------------------------------------------------------ */
/*  Card layout (see PRD §4.9)                                         */
/* ------------------------------------------------------------------ */

export interface SlotConfig {
	/** Frontmatter key, OR a special token: 'filename' | 'path'. */
	property: string;
	/** Renderer hint id; if absent the registry picks by value type. */
	style?: string;
	/** Fallback value or another property to use when value is missing/empty. */
	fallback?: string | { property: string };
	/** Renderer-specific options (lines, fit, dateFormat, color, …). */
	[opt: string]: unknown;
}

export interface CardLayout {
	cover?: SlotConfig;
	title?: SlotConfig;
	badges?: SlotConfig[];
	body?: SlotConfig[];
}

/* ------------------------------------------------------------------ */
/*  Filter / search state                                              */
/* ------------------------------------------------------------------ */

/** Persisted filter — round-trips into Bases' native `filters` block. */
export type FilterClause =
	| { op: 'eq' | 'neq' | 'contains' | 'startsWith' | 'endsWith'; property: string; value: unknown }
	| { op: 'in' | 'notIn'; property: string; value: unknown[] }
	| { op: 'has' | 'notHas'; property: string; value: unknown }
	| { op: 'between'; property: string; from: unknown; to: unknown }
	| { op: 'inFolder'; value: string }
	| { op: 'and' | 'or'; clauses: FilterClause[] };

export interface FilterState {
	clauses: FilterClause[];
}

/** Ephemeral search — never persisted. */
export interface SearchState {
	term: string;
	scopes: { name: boolean; path: boolean; properties: boolean; body: boolean };
}

/* ------------------------------------------------------------------ */
/*  View base contract (implemented in engine/abstract-view.ts)        */
/* ------------------------------------------------------------------ */

export interface ViewContext extends Component {
	readonly entries: readonly ViewEntry[];
	readonly properties: readonly PropertyDescriptor[];
	readonly search: SearchState;
}
