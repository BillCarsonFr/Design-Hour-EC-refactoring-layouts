/**
 * This is the output of the viewmodel that the view consumes.
 * Updating snapshot through this object will make react re-render
 * components.
 */
export class Snapshot<T> {
  private snapshot: T;
  private readonly emit: () => void;

  public constructor(snapshot: T, emit: () => void) {
    this.snapshot = snapshot;
    this.emit = emit;
  }

  /**
   * Replace current snapshot with a new snapshot value.
   * @param snapshot New snapshot value
   */
  public set(snapshot: T): void {
    this.snapshot = snapshot;
    this.emit();
  }

  /**
   * Update a part of the current snapshot by merging into the existing snapshot.
   * @param snapshot A subset of the snapshot to merge into the current snapshot.
   */
  public merge(snapshot: Partial<T>): void {
    this.snapshot = { ...this.snapshot, ...snapshot };
    this.emit();
  }

  /**
   * The current value of the snapshot.
   */
  public get current(): T {
    return this.snapshot;
  }
}
