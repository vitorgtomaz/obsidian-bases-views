/**
 * Trailing-edge debounce.
 *
 * Use the obsidian-shipped `debounce` if its API matches your needs; this
 * helper exists to keep our engine free of soft Obsidian-API dependencies in
 * one or two hot paths (and to make the timing trivial to override in tests).
 *
 * Behaviour:
 *   - Calls during a quiet window of `waitMs` defer execution.
 *   - The most recent arguments win.
 *   - .cancel() drops the pending call.
 *   - .flush() runs the pending call immediately and clears the timer.
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
	// Pseudocode:
	//   let timer: number | null = null
	//   let pendingArgs: A | null = null
	//   const wrapped = (...args: A) => {
	//     pendingArgs = args
	//     if (timer != null) window.clearTimeout(timer)
	//     timer = window.setTimeout(() => {
	//       const a = pendingArgs!
	//       timer = null; pendingArgs = null
	//       fn(...a)
	//     }, waitMs)
	//   }
	//   wrapped.cancel = () => { if (timer != null) window.clearTimeout(timer); timer = null; pendingArgs = null }
	//   wrapped.flush  = () => { if (timer != null && pendingArgs) { window.clearTimeout(timer); const a = pendingArgs; timer = null; pendingArgs = null; fn(...a) } }
	//   return wrapped
	throw new Error('not implemented');
}
