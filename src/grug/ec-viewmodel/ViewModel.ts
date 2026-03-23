import type { Behavior } from "./Behavior";

export type ViewModel<Snapshot, Actions> = {
  snapshot$: Behavior<Snapshot>;
} & Actions;
