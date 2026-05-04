import type { App, TFile } from 'obsidian';
import type { PropertyType, SlotConfig } from '../../types';

export interface RenderCtx {
	app: App;
	file: TFile;
	source: string;
}

export type PropertyRenderer = (
	value: unknown,
	slot: SlotConfig,
	ctx: RenderCtx,
) => HTMLElement;

export interface RendererSpec {
	id: string;
	accepts: (value: unknown, slot: SlotConfig, propType?: PropertyType) => boolean;
	render: PropertyRenderer;
	weight?: number;
}

export class RendererRegistry {
	private specs: RendererSpec[] = [];

	register(spec: RendererSpec): void {
		this.specs.push(spec);
		this.specs.sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0));
	}

	pick(value: unknown, slot: SlotConfig, propType?: PropertyType): RendererSpec {
		// If a specific style is requested, prefer a matching renderer first
		if (slot.style) {
			const byStyle = this.specs.find(
				(s) => s.id === slot.style && s.accepts(value, slot, propType),
			);
			if (byStyle) return byStyle;
		}
		// Fall through weight-ordered list
		for (const spec of this.specs) {
			if (spec.accepts(value, slot, propType)) return spec;
		}
		// Absolute fallback — the 'text' renderer (always last, weight 1, accepts everything)
		return this.specs[this.specs.length - 1]!;
	}
}
