import { LayoutEngine } from "../../layout/LayoutEngine.ts";
import type { ItemLayoutData } from "../../layout/ItemLayoutData.ts";
import { BaseViewModel } from "../../viewmodel/BaseViewModel.ts";
import type { TileProvider } from "../../model/TileProvider.ts";

export interface LayoutContainerSnapshot {
  childLayoutData: ItemLayoutData[];
  contentHeight: number;
}

export interface LayoutContainerActions {
  setContainerSize: (width: number, height: number) => void;
}

export interface LayoutContainerViewProps {
  mode: "grid" | "list";
  tileProvider: TileProvider;
}

export class LayoutContainerViewModel
  extends BaseViewModel<LayoutContainerSnapshot, LayoutContainerViewProps>
  implements LayoutContainerActions
{
  private readonly layoutEngine: LayoutEngine;

  private readonly layoutListener = (layoutData: ItemLayoutData[]) => {
    this.snapshot.set({
      childLayoutData: layoutData,
      contentHeight: this.layoutEngine.contentHeight,
    });
  };

  constructor(props: LayoutContainerViewProps) {
    super(props, { childLayoutData: [], contentHeight: 0 });
    this.layoutEngine = new LayoutEngine();
    this.layoutEngine.setListener(this.layoutListener);
    const tileProvider = this.props.tileProvider;
    // this.props.tileProvider.on("tilesChanged", (tiles: TileMetaData[]) => {
    //     this.layoutEngine.updateTileInfo(tiles);
    // })
    this.layoutEngine.updateTileInfo(tileProvider.getTiles());
  }

  setContainerSize(width: number, height: number): void {
    this.layoutEngine.updateContainerSize(width, height);
  }
}
