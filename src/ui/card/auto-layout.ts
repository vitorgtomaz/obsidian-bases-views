import type { CardLayout, PropertyDescriptor, PropertyType, ViewEntry } from '../../types';

const COVER_KEY_RX = /^(cover|image|thumbnail|banner|hero|photo)$/i;
const IMG_EXT_RX = /\.(png|jpe?g|webp|gif|svg|avif)(\?|#|$)/i;

export interface AutoLayoutInput {
	entries: readonly ViewEntry[];
	descriptors: readonly PropertyDescriptor[];
	excludeProperties?: readonly string[];
}

export function autoCardLayout(input: AutoLayoutInput): CardLayout {
	const used = new Set<string>(input.excludeProperties ?? []);
	const layout: CardLayout = {};

	// 1. Cover
	const coverDesc = pickCover(input.descriptors, input.entries);
	if (coverDesc) {
		layout.cover = { property: coverDesc.key, style: 'image' };
		used.add(coverDesc.key);
	}

	// 2. Title
	const hasTitleProp = input.descriptors.some((d) => d.key === 'title');
	if (hasTitleProp && !used.has('title')) {
		layout.title = { property: 'title', fallback: { property: 'filename' } };
		used.add('title');
	} else {
		layout.title = { property: 'filename' };
	}

	// 3. Badges (first list/tags property)
	const badgeDesc = input.descriptors.find(
		(d) => !used.has(d.key) && isListLike(d.type),
	);
	if (badgeDesc) {
		layout.badges = [{ property: badgeDesc.key, style: 'pill' }];
		used.add(badgeDesc.key);
	}

	// 4. Body — up to 3 remaining, frequency-ranked
	const body = input.descriptors
		.filter((d) => !used.has(d.key))
		.map((d) => ({ d, freq: frequency(d.key, input.entries) }))
		.filter(({ freq }) => freq > 0)
		.sort((a, b) => b.freq - a.freq)
		.slice(0, 3)
		.map(({ d }) => ({ property: d.key }));

	if (body.length > 0) layout.body = body;

	return layout;
}

function isListLike(type: PropertyType): boolean {
	return type === 'list' || type === 'tags';
}

function pickCover(
	descriptors: readonly PropertyDescriptor[],
	entries: readonly ViewEntry[],
): PropertyDescriptor | null {
	// 1. type === 'image'
	const byType = descriptors.find((d) => d.type === 'image');
	if (byType) return byType;

	// 2. Name heuristic
	const byName = descriptors.find((d) => COVER_KEY_RX.test(d.key));
	if (byName) return byName;

	// 3. Value sniff — ≥ 60 % of non-empty values look like image URLs
	for (const d of descriptors) {
		if (d.type !== 'string') continue;
		const vals = entries
			.map((e) => e.properties[d.key])
			.filter((v) => typeof v === 'string' && v.length > 0) as string[];
		if (vals.length === 0) continue;
		const imgCount = vals.filter((v) => IMG_EXT_RX.test(v)).length;
		if (imgCount / vals.length >= 0.6) return d;
	}
	return null;
}

function frequency(key: string, entries: readonly ViewEntry[]): number {
	if (entries.length === 0) return 0;
	const nonEmpty = entries.filter((e) => {
		const v = e.properties[key];
		return v !== null && v !== undefined && v !== '' &&
			!(Array.isArray(v) && v.length === 0);
	}).length;
	return nonEmpty / entries.length;
}
