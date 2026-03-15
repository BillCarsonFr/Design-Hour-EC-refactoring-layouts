import {useMemo} from "react";
import type {ViewModel} from "./ViewModel.ts";

/**
 * Hook helper to return a mocked view model created with the given snapshot and actions.
 * This is useful for testing components in isolation with a mocked view model and allows to use primitive types in stories.
 *
 * @param snapshot
 * @param actions
 */
export function useMockedViewModel<S, A>(snapshot: S, actions: A): ViewModel<S> & A {
    return useMemo(() => {
        const vm = new MockViewModel<S>(snapshot);
        Object.assign(vm, actions);
        return vm as unknown as ViewModel<S> & A;
    }, [snapshot, actions]);
}



/**
 * A mock view model that returns a static snapshot passed in the constructor, with no updates.
 */
class MockViewModel<T> implements ViewModel<T> {
    public constructor(private snapshot: T) {}

    public getSnapshot = (): T => {
        return this.snapshot;
    };

    public subscribe(listener: () => void): () => void {
        return () => undefined;
    }
}
