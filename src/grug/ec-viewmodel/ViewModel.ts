import { useObservable } from "observable-hooks";
import type { Behavior } from "./Behavior";
import { switchMap } from "rxjs";

export type ViewModel<Snapshot, Actions> = {
  snapshot$: Behavior<Snapshot>;
} & Actions;

// ALTERNATIVE for sub snapshot updates
export type ViewModelAlt<Snapshot, Actions> = Record<
  keyof Snapshot,
  Behavior<Snapshot[keyof Snapshot]>
> &
  Actions;

/**
 * Make sure we access the snapshot as a clean observable.
 * If the vm changes we just get a new emission on the same observable.
 * @param vm The ViewModel. It can change and the snapshot will get updated.
 * @returns The snapshot observable.
 */
export function useSnapshot<S, A>(vm: ViewModel<S, A>) {
  return useObservable(
    (inputs$) => inputs$.pipe(switchMap(([snapshot]) => snapshot)),
    [vm.snapshot$],
  );
}
