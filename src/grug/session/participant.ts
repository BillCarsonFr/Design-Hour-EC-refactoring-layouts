import { BehaviorSubject } from "rxjs";

export class Participant {
  id: string;
  displayName: BehaviorSubject<string | undefined>;
  isVideoEnabled$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false,
  );
  isMuted$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isSpeaking$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(id: string, displayName: string | undefined) {
    this.id = id;
    this.displayName = new BehaviorSubject<string | undefined>(displayName);
  }
}
