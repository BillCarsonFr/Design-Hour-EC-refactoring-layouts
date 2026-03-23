import type { Participant } from "./participant.ts";
import { BehaviorSubject, Subject } from "rxjs";

export class Session {
  readonly id: string;

  readonly participants$: Subject<Participant[]> = new BehaviorSubject<
    Participant[]
  >([]);

  constructor(id: string) {
    this.id = id;
  }
}
