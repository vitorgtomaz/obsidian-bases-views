/**
 * Trailing-edge debounce.
 *
 * Note: Obsidian ships its own `debounce(cb, timeout, resetTimer)` util.
 * We keep this hand-rolled version so the engine's hot path (50 ms tick
 * debounce) has an explicit .flush() API used during onunload.
 */

export interface DebouncedFn<A extends unknown[]> {
	(...args: A): void;
	cancel(): void;
	flush(): void;
}

export function debounce<A extends unknown[]>(
	fn: (...args: A) => void,
	waitMs: number,
): DebouncedFn<A> {
	let timer: number | null = null;
	let pendingArgs: A | null = null;

	const run = () => {
		const a = pendingArgs!;
		timer = null;
		pendingArgs = null;
		fn(...a);
	};

	const wrapped = (...args: A): void => {
		pendingArgs = args;
		if (timer !== null) window.clearTimeout(timer);
		timer = window.setTimeout(run, waitMs);
	};

	wrapped.cancel = (): void => {
		if (timer !== null) window.clearTimeout(timer);
		timer = null;
		pendingArgs = null;
	};

	wrapped.flush = (): void => {
		if (timer !== null && pendingArgs !== null) {
			window.clearTimeout(timer);
			run();
		}
	};

	return wrapped;
}
