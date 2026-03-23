import { useViewModel, type ViewModel } from "../../viewmodel/ViewModel.ts";
import type { ParticipantTileSnapshot } from "./ParticipantTileViewModel.ts";
import { type JSX } from "react";
import styles from "./ParticipantTile.module.css";
import { Avatar, Pill } from "@vector-im/compound-web";
import {
  MicOffSolidIcon,
  MicOnSolidIcon,
} from "@vector-im/compound-design-tokens/assets/web/icons";

interface ParticipantTileProps {
  // The view consumes the snapshot contract, not a specific implementation class.
  vm: ViewModel<ParticipantTileSnapshot>;
}

export function ParticipantTile({ vm }: ParticipantTileProps): JSX.Element {
  const snapshot = useViewModel(vm);

  const className = [
    styles.plainTile,
    snapshot.isSpeaking ? styles.speaking : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={className}>
      <Avatar id={snapshot.tileId} name={snapshot.displayName} size={"128px"} />
      <div className={styles.displayName}>
        <Pill>{snapshot.displayName}</Pill>
      </div>
      <div className={styles.micIcon}>
        {snapshot.isMuted ? <MicOffSolidIcon /> : <MicOnSolidIcon />}
      </div>
    </div>
  );
}
