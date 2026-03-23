import { useSyncExternalStore } from "react";

/**
 * A small wrapper around useSyncExternalStore to use a view model in a shared component view
 * @param vm The view model to use
 * @returns The current snapshot
 */
export function useViewModel<T>(vm: ViewModel<T, unknown>): T {
  // We need to pass the same getSnapshot function as getServerSnapshot as this
  // is used when making the HTML chat export.
  return useSyncExternalStore(vm.subscribe, vm.getSnapshot, vm.getSnapshot);
}

// Utility type to map all VM actions to unbound functions so that they do not have
// to be called with the correct 'this' context. This prevents "cannot read X of undefined" bugs.
type MapToVoidThis<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => infer R
    ? (this: void, ...args: A) => R
    : T[K];
};

export type ViewModel<Snapshot, Actions = unknown> = {
  /**
   * The current snapshot of the view model.
   */
  getSnapshot: () => Snapshot;

  /**
   * Subscribes to changes in the view model.
   * The listener will be called whenever the snapshot changes.
   */
  subscribe: (listener: () => void) => () => void;
} & MapToVoidThis<Actions>;
