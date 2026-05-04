/**
 * Tiny deterministic RNG + string hash. Used for stable group-by tiebreaks
 * (PRD §4.5) and for hashing pill colours (ui/card/renderers/pill.ts).
 *
 * No crypto: we want speed and stability, not unpredictability.
 */

/** Mulberry32 — one of the best small seeded PRNGs. Returns [0, 1). */
export function mulberry32(seed: number): () => number {
	let s = seed | 0;
	return () => {
		s = (s + 0x6D2B79F5) | 0;
		let t = s;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/** FNV-1a 32-bit hash for short strings. Stable across platforms. */
export function hashString(input: string): number {
	let h = 0x811c9dc5;
	for (let i = 0; i < input.length; i++) {
		h ^= input.charCodeAt(i);
		// 32-bit FNV prime multiplication via Math.imul for cross-platform parity.
		h = Math.imul(h, 0x01000193);
	}
	return h >>> 0;
}
