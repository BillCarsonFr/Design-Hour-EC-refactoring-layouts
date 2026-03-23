import { BaseViewModel } from "../../viewmodel/BaseViewModel.ts";
import type { Session } from "../../session/session.ts";
import { combineLatest, filter, map, switchMap } from "rxjs";
import type { Participant } from "../../session/participant.ts";

export interface ParticipantTileSnapshot {
  tileId: string;
  displayName: string;
  avatarUrl?: string;
  isSpeaking: boolean;
  isMuted: boolean;
  isVideoEnabled: boolean;
}

export interface ParticipantTileViewProps {
  participantId: string;
  session: Session;
}

export class ParticipantTileViewModel extends BaseViewModel<
  ParticipantTileSnapshot,
  ParticipantTileViewProps
> {
  constructor({ participantId, session }: ParticipantTileViewProps) {
    super(
      { participantId, session },
      {
        tileId: participantId,
        displayName: participantId,
        isSpeaking: false,
        isMuted: false,
        isVideoEnabled: false,
      },
    );

    const sub = session.participants$
      .pipe(
        map((participants) => participants.find((p) => p.id === participantId)),
        filter((p): p is Participant => p !== undefined),
        switchMap((participant) =>
          combineLatest([
            participant.displayName,
            participant.isSpeaking$,
            participant.isMuted$,
            participant.isVideoEnabled$,
          ]).pipe(
            map(([displayName, isSpeaking, isMuted, isVideoEnabled]) => ({
              tileId: participantId,
              displayName: displayName ?? participantId,
              isSpeaking,
              isMuted,
              isVideoEnabled,
            })),
          ),
        ),
      )
      .subscribe((snapshot) => {
        this.snapshot.set(snapshot);
      });

    this.disposables.track(() => sub.unsubscribe());
  }
}
