import { type TileMetaData } from "../../layout/LayoutEngine.ts";
import { BaseViewModel } from "../../viewmodel/BaseViewModel.ts";
import type { Session } from "../../session/session.ts";
import { SessionTileProvider } from "../../model/SessionTileProvider.ts";

export type LayoutTypes = "grid" | "spotlight";

export interface LayoutContainerSnapshot {
  tiles: TileMetaData[];
  mode: LayoutTypes;
}

export interface LayoutContainerActions {
  setLayoutMode: (mode: LayoutTypes) => void;
}

export interface LayoutContainerViewProps {
  mode: LayoutTypes;
  session: Session;
}

export class LayoutContainerViewModel
  extends BaseViewModel<LayoutContainerSnapshot, LayoutContainerViewProps>
  implements LayoutContainerActions
{
  constructor(props: LayoutContainerViewProps) {
    super(props, { tiles: [], mode: props.mode });
    const tileProvider = new SessionTileProvider(props.session);
    const sub = tileProvider.tiles$.subscribe((tiles) => {
      this.snapshot.merge({ tiles });
    });
    this.disposables.track(() => sub.unsubscribe());
  }

  setLayoutMode(mode: LayoutTypes) {
    this.snapshot.merge({ mode });
  }
}
