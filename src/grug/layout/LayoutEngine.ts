import type { ItemLayoutData } from "./ItemLayoutData.ts";

export type LayoutListener = (
  layoutData: ItemLayoutData[],
  contentHeight: number,
) => void;

export interface TileMetaData {
  /** The unique identifier for this tile, used for tracking and layout purposes. */
  stableId: string;
  isHero: boolean;
  // isMe: boolean;
  /**
   * A score representing the importance of this tile for layout purposes.
   * Higher scores indicate higher importance.
   * For a call it would be based on factors like whether the tile is active/speaking,
   * whether the tile is has video enabled ot not...
   */
  score: number;
}

export interface LayoutConfig {
  // This is the preferred width for tiles in the layout.
  // The layout engine will try to size tiles to this width if possible, but may adjust it based on available space and tile importance.
  // It is also a breaking point for when to switch from a single column layout to a multi-column layout.
  // For example, if the available width is less than 2x the preferred tile width, the layout engine may choose to stack tiles vertically instead of placing them side by side.
  preferredTileWidth: number; //360;
  preferredRatio: number; // 1.33
  // Space in px between tiles.
  spacing: number;
}

export interface LayoutDataEngine {
  setListener(listener: LayoutListener): void;
  updateTileInfo(sortedTiles: TileMetaData[]): void;
  updateContainerSize(containerWidth: number, containerHeight: number): void;
}

export const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  preferredTileWidth: 360,
  preferredRatio: 1.33,
  spacing: 16,
};

export class LayoutEngine implements LayoutDataEngine {
  private readonly config: LayoutConfig;

  private cachedTileLayoutData: Map<string, ItemLayoutData> = new Map();
  /**
   * The current width and height of a child tile.
   * Tiles all have the same size in the current layout algorithm.
   * This is computed based on the available container size.
   * @private
   */
  private tileSize: [number, number] | undefined = undefined;
  private colNumber: number | undefined = undefined;

  /**
   * The list of tiles to be laid out, along with their metadata.
   * Ordered by their score, with the most important tiles first.
   * @private
   */
  private tiles: TileMetaData[] = [];
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
    // TODO: re-compute only if really needed.
    // For example, if the order of tiles changes we can just swap their layout data in the cachedTileLayoutData mapping without re-computing the whole layout.
    // In case or removing/adding tiles as there are no width/height changes, we might be able to keep the same layout and just update the stableId->layoutData mapping for new/removed tiles.
    this.computeLayout();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public updateContainerSize(containerWidth: number, _containerHeight: number) {
    // Calculate the ideal (fractional) number of tiles that fit in the container
    const idealTilesPerRow =
      (containerWidth + this.config.spacing) /
      (this.config.preferredTileWidth + this.config.spacing);
    const fractionalPart = idealTilesPerRow % 1;

    // If fractional part <= 0.5: round down and grow tiles to fill space
    // If fractional part >  0.5: round up and shrink tiles to fit the extra tile
    const tilesPerRow = Math.max(
      1,
      fractionalPart <= 0.5
        ? Math.floor(idealTilesPerRow)
        : Math.ceil(idealTilesPerRow),
    );

    const tileWidth =
      (containerWidth - (tilesPerRow - 1) * this.config.spacing) / tilesPerRow;
    const tileHeight = tileWidth / this.config.preferredRatio;
    this.tileSize = [tileWidth, tileHeight];
    this.colNumber = tilesPerRow;

    // TODO: compute only if changes?
    this.computeLayout();
  }

  private computeLayout() {
    if (!this.tileSize || !this.colNumber) {
      console.debug("Container size not set yet, cannot compute layout");
      return;
    }

    if (this.tiles.length === 0) {
      this.cachedTileLayoutData.clear();
      this.contentHeight = 0;
      this._listener?.([], this.contentHeight);
      return;
    }

    // const layout = [];
    this.cachedTileLayoutData.clear();
    let x = 0;
    let y = 0;

    const tileWidth = this.tileSize[0];
    const tileHeight = this.tileSize[1];
    // let rowHeight = tileHeight + this.config.spacing;
    let colNumber = 0;
    // let rowNumber = 0;
    for (const tile of this.tiles) {
      if (colNumber >= this.colNumber) {
        // Move to the next row
        x = 0;
        y += tileHeight + this.config.spacing;
        colNumber = 0;
      }

      this.cachedTileLayoutData.set(tile.stableId, {
        uniqueId: tile.stableId,
        x,
        y,
        width: tileWidth,
        height: tileHeight,
      });

      x += tileWidth + this.config.spacing;
      colNumber++;
    }

    this.contentHeight = y + tileHeight; // Total height of the content, used for scroll container sizing.

    this._listener?.(this.getLayoutDataInInputOrder(), this.contentHeight);
  }

  private getLayoutDataInInputOrder(): ItemLayoutData[] {
    return this.tiles.flatMap((tile) => {
      const layoutData = this.cachedTileLayoutData.get(tile.stableId);
      return layoutData ? [layoutData] : [];
    });
  }
}
