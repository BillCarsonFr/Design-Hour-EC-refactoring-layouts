import type { ViewModel } from "./ViewModel.ts";
import { Snapshot } from "./Snapshot.ts";
import { Disposables } from "./Disposables.ts";
import { ViewModelSubscriptions } from "./ViewModelSubscriptions.ts";

export abstract class BaseViewModel<T, P> implements ViewModel<T> {
  protected subs: ViewModelSubscriptions;
  protected snapshot: Snapshot<T>;
  protected props: P;
  protected disposables = new Disposables();

  protected constructor(props: P, initialSnapshot: T) {
    this.props = props;
    this.subs = new ViewModelSubscriptions();
    this.snapshot = new Snapshot(initialSnapshot, () => {
      this.subs.emit();
    });
  }

  public subscribe = (listener: () => void): (() => void) => {
    return this.subs.add(listener);
  };

  /**
   * Returns the current snapshot of the view model.
   */
  public getSnapshot = (): T => {
    return this.snapshot.current;
  };

  /**
   * Relinquish any resources held by this view-model.
   */
  public dispose(): void {
    this.disposables.dispose();
  }

  /**
   * Whether this view-model has been disposed.
   */
  public get isDisposed(): boolean {
    return this.disposables.isDisposed;
  }
}
