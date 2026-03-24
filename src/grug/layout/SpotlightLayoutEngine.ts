import type { ItemLayoutData } from "./ItemLayoutData.ts";
import {
  DEFAULT_LAYOUT_CONFIG,
  type LayoutConfig,
  type LayoutDataEngine,
  type LayoutListener,
  type TileMetaData,
} from "./LayoutEngine.ts";
import { partitionSpotlightTiles } from "./partitionSpotlightTiles.ts";

export class SpotlightLayoutEngine implements LayoutDataEngine {
  private readonly config: LayoutConfig;
  private containerSize: [number, number] | undefined = undefined;
  private tiles: TileMetaData[] = [];
  private cachedTileLayoutData: Map<string, ItemLayoutData> = new Map();
  contentHeight: number = 0;

  constructor(config: LayoutConfig = DEFAULT_LAYOUT_CONFIG) {
    this.config = config;
  }

  private _listener: LayoutListener | null = null;

  public setListener(listener: LayoutListener) {
    this._listener = listener;
  }

  public updateTileInfo(sortedTiles: TileMetaData[]) {
    this.tiles = sortedTiles;
    this.computeLayout();
  }

  public updateContainerSize(containerWidth: number, containerHeight: number) {
    this.containerSize = [containerWidth, containerHeight];
    this.computeLayout();
  }

  private computeLayout() {
    if (!this.containerSize || this.containerSize[0] <= 0) {
      console.debug(
        "Container size not set yet, cannot compute spotlight layout",
      );
      return;
    }

    if (this.tiles.length === 0) {
      this.cachedTileLayoutData.clear();
      this.contentHeight = 0;
      this._listener?.([], this.contentHeight);
      return;
    }

    const [containerWidth, rawContainerHeight] = this.containerSize;
    const containerHeight =
      rawContainerHeight > 0 ? rawContainerHeight : undefined;
    const { spotlightTiles, sideTiles } = partitionSpotlightTiles(this.tiles);
    const hasSideColumn = sideTiles.length > 0;

    // Spotlight tiles all overlap → treat as 1 tile when sizing the side column.
    const sideColumnWidth = hasSideColumn
      ? this.computeSideColumnWidth(containerWidth, containerHeight)
      : 0;
    const leftAreaWidth = hasSideColumn
      ? Math.max(0, containerWidth - sideColumnWidth - this.config.spacing)
      : containerWidth;

    const spotlightWidth = this.computeSpotlightWidth(
      leftAreaWidth,
      containerHeight,
      1, // tiles overlap, so height = 1 tile
    );
    const spotlightHeight = spotlightWidth / this.config.preferredRatio;

    const sideTileHeight = hasSideColumn
      ? sideColumnWidth / this.config.preferredRatio
      : 0;
    const sideColumnHeight = this.computeStackHeight(
      sideTileHeight,
      sideTiles.length,
    );

    this.contentHeight = Math.max(spotlightHeight, sideColumnHeight);

    const spotlightOffsetX = Math.max(0, (leftAreaWidth - spotlightWidth) / 2);
    const sideOffsetY = this.computeColumnOffset(
      containerHeight,
      sideColumnHeight,
    );
    const sideX = containerWidth - sideColumnWidth;

    this.cachedTileLayoutData.clear();

    // All spotlight tiles occupy the same area; the engine drives their z-order.
    spotlightTiles.forEach((tile, index) => {
      this.cachedTileLayoutData.set(tile.stableId, {
        uniqueId: tile.stableId,
        x: spotlightOffsetX,
        y: 0,
        width: spotlightWidth,
        height: spotlightHeight,
        zIndex: spotlightTiles.length - index,
        sticky: index === 0,
      });
    });

    sideTiles.forEach((tile, index) => {
      const y = sideOffsetY + index * (sideTileHeight + this.config.spacing);
      this.cachedTileLayoutData.set(tile.stableId, {
        uniqueId: tile.stableId,
        x: sideX,
        y,
        width: sideColumnWidth,
        height: sideTileHeight,
        zIndex: 0,
        sticky: false,
      });
    });

    this._listener?.(
      [...this.cachedTileLayoutData.values()],
      this.contentHeight,
    );
  }

  private computeSideColumnWidth(
    containerWidth: number,
    containerHeight: number | undefined,
  ): number {
    const maxSideColumnWidth = Math.max(
      0,
      Math.min(
        this.config.preferredTileWidth,
        containerWidth - this.config.spacing,
      ),
    );
    const minSideColumnWidth = Math.min(
      maxSideColumnWidth,
      Math.max(120, this.config.preferredTileWidth / 3),
    );

    if (!containerHeight) {
      return Math.max(minSideColumnWidth, maxSideColumnWidth);
    }

    const spotlightMaxWidth = this.computeWidthThatFitsHeight(
      containerHeight,
      1, // spotlight tiles overlap → 1 tile tall
      containerWidth,
    );
    const idealSideColumnWidth = Math.max(
      0,
      containerWidth - this.config.spacing - spotlightMaxWidth,
    );

    return Math.min(
      maxSideColumnWidth,
      Math.max(minSideColumnWidth, idealSideColumnWidth),
    );
  }

  private computeSpotlightWidth(
    leftAreaWidth: number,
    containerHeight: number | undefined,
    spotlightTileCount: number,
  ): number {
    if (!containerHeight) {
      return leftAreaWidth;
    }

    const maxWidthThatFitsHeight = this.computeWidthThatFitsHeight(
      containerHeight,
      spotlightTileCount,
      leftAreaWidth,
    );

    return Math.min(leftAreaWidth, maxWidthThatFitsHeight);
  }

  private computeWidthThatFitsHeight(
    containerHeight: number,
    tileCount: number,
    fallbackWidth: number,
  ): number {
    const availableHeight = Math.max(
      0,
      containerHeight - Math.max(0, tileCount - 1) * this.config.spacing,
    );

    return tileCount > 0
      ? (availableHeight / tileCount) * this.config.preferredRatio
      : fallbackWidth;
  }

  private computeStackHeight(tileHeight: number, tileCount: number): number {
    if (tileCount === 0) {
      return 0;
    }

    return tileHeight * tileCount + this.config.spacing * (tileCount - 1);
  }

  private computeColumnOffset() // _containerHeight: number | undefined,
  // _contentHeight: number,
  : number {
    return 0;
  }
}
