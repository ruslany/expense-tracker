import { useState } from 'react';

/**
 * Calls `onOpen` while rendering whenever `open` turns true, or whenever any value in
 * `deps` changes while `open` is true. Use it to (re)initialize a dialog's form state.
 *
 * This replaces `useEffect(() => { if (open) reset(); }, [open, ...deps])`, which first
 * renders the dialog with stale state and then renders it again with the reset state.
 * Setting state during render makes React discard the stale render before it is shown.
 * See https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
 *
 * `onOpen` may only update state owned by the calling component.
 */
export function useOnOpen(open: boolean, onOpen: () => void, deps: readonly unknown[] = []) {
  const [prev, setPrev] = useState<{ open: boolean; deps: readonly unknown[] }>({
    open: false,
    deps,
  });

  const changed =
    prev.open !== open ||
    prev.deps.length !== deps.length ||
    prev.deps.some((value, i) => !Object.is(value, deps[i]));

  if (changed) {
    setPrev({ open, deps });
    if (open) onOpen();
  }
}
