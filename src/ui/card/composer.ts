import type { App, TFile } from 'obsidian';
import type { CardLayout, PropertyDescriptor, SlotConfig, ViewEntry } from '../../types';
import type { RendererRegistry, RenderCtx } from './renderer-registry';

export interface CardComposerOptions {
	registry: RendererRegistry;
	descriptors: Map<string, PropertyDescriptor>;
	source: string;
}

export class CardComposer {
	private readonly memo = new WeakMap<HTMLElement, Map<string, unknown>>();

	constructor(private readonly opts: CardComposerOptions) {}

	compose(
		entry: ViewEntry,
		layout: CardLayout,
		ctx: { app: App; source: string },
		recycledEl: HTMLElement | null,
	): HTMLElement {
		const root = recycledEl ?? document.createElement('div');
		root.className = 'bv-card';

		const fullCtx: RenderCtx = { ...ctx, file: entry.file };
		const memo = this.memo.get(root) ?? new Map<string, unknown>();

		const update = (
			slotKey: string,
			parentClass: string,
			slot: SlotConfig | undefined,
			isList: false,
		) => {
			if (!slot) {
				root.querySelector(`.${parentClass}`)?.detach();
				memo.delete(slotKey);
				return;
			}
			const value = this.resolveValue(entry, slot);
			const sig = this.signature(value, slot);
			if (memo.get(slotKey) === sig) return; // unchanged
			memo.set(slotKey, sig);

			let container = root.querySelector(`.${parentClass}`) as HTMLElement | null;
			if (!container) {
				container = document.createElement('div');
				container.className = parentClass;
			}
			container.empty();

			const propType = this.opts.descriptors.get(slot.property)?.type;
			const renderer = this.opts.registry.pick(value, slot, propType);
			container.appendChild(renderer.render(value, slot, fullCtx));

			if (!root.contains(container)) root.appendChild(container);
		};

		const updateList = (
			slotKey: string,
			parentClass: string,
			childClass: string,
			slots: SlotConfig[] | undefined,
		) => {
			if (!slots || slots.length === 0) {
				root.querySelector(`.${parentClass}`)?.detach();
				memo.delete(slotKey);
				return;
			}
			const sig = this.signature(slots.map((s) => this.resolveValue(entry, s)), { property: slotKey });
			if (memo.get(slotKey) === sig) return;
			memo.set(slotKey, sig);

			let container = root.querySelector(`.${parentClass}`) as HTMLElement | null;
			if (!container) {
				container = document.createElement('div');
				container.className = parentClass;
			}
			container.empty();

			for (const slot of slots) {
				const value = this.resolveValue(entry, slot);
				const propType = this.opts.descriptors.get(slot.property)?.type;
				const renderer = this.opts.registry.pick(value, slot, propType);
				const child = renderer.render(value, slot, fullCtx);
				child.addClass(childClass);
				container.appendChild(child);
			}

			if (!root.contains(container)) root.appendChild(container);
		};

		// Render slots in order: cover, title, badges, body
		update('cover', 'bv-card-cover', layout.cover, false);
		update('title', 'bv-card-title', layout.title, false);
		updateList('badges', 'bv-card-badges', 'bv-badge-slot', layout.badges);
		updateList('body', 'bv-card-body', 'bv-card-row', layout.body);

		this.memo.set(root, memo);
		return root;
	}

	private resolveValue(entry: ViewEntry, slot: SlotConfig): unknown {
		let value: unknown;

		if (slot.property === 'filename') {
			value = entry.file.basename;
		} else if (slot.property === 'path') {
			value = entry.file.path;
		} else {
			value = entry.properties[slot.property];
		}

		if ((value === null || value === undefined || value === '') && slot.fallback !== undefined) {
			if (typeof slot.fallback === 'string') {
				value = slot.fallback;
			} else {
				value = this.resolveValue(entry, { property: slot.fallback.property });
			}
		}
		return value;
	}

	private signature(value: unknown, slot: SlotConfig): unknown {
		const v = Array.isArray(value) ? JSON.stringify(value) :
			value !== null && typeof value === 'object' ? JSON.stringify(value) : value;
		return `${String(v)}::${slot.style ?? ''}`;
	}
}
