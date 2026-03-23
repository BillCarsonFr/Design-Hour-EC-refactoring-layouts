import { BaseViewModel } from "../../viewmodel/BaseViewModel.ts";

export interface ParticipantTileSnapshot {
  tileId: string;
  displayName: string;
  avatarUrl?: string;
  isSpeaking: boolean;
  isMuted: boolean;
  isVideoEnabled: boolean;
}

export interface ParticipantTileViewProps {
  vm: ParticipantTileViewModel;
}

export class ParticipantTileViewModel extends BaseViewModel<
  ParticipantTileSnapshot,
  ParticipantTileViewProps
> {
  constructor(props: ParticipantTileViewProps) {
    super(props, props.vm.snapshot.current);
  }
}
