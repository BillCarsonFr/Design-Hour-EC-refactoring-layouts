import {useSyncExternalStore} from "react";

/**
 * A small wrapper around useSyncExternalStore to use a view model in a shared component view
 * @param vm The view model to use
 * @returns The current snapshot
 */
export function useViewModel<T>(vm: ViewModel<T>): T {
    // We need to pass the same getSnapshot function as getServerSnapshot as this
    // is used when making the HTML chat export.
    return useSyncExternalStore(vm.subscribe, vm.getSnapshot, vm.getSnapshot);
}


export type ViewModel<Snapshot> = {
    /**
     * The current snapshot of the view model.
     */
    getSnapshot: () => Snapshot;

    /**
     * Subscribes to changes in the view model.
     * The listener will be called whenever the snapshot changes.
     */
    subscribe: (listener: () => void) => () => void;
}
