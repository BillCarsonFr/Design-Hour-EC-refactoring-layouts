import type {
  TileLayoutMetaData,
  TilePositionData,
} from "./TileDataInterfaces.ts";

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

const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  preferredTileWidth: 360,
  preferredRatio: 1.33,
  spacing: 16,
};

export class LayoutEngine {
  private readonly config: LayoutConfig;

  private cachedTileLayoutData: TilePositionData[] = [];
  /**
   * The current width and height of a child tile.
   * Tiles all have the same size in the current layout algorithm.
   * This is computed based on the available container size.
   * @private
   */
  private tileSize: [number, number] | undefined = undefined;
  private colNumber: number | undefined = undefined;

  private containerHeight: number | undefined = undefined;
  private containerWidth: number | undefined = undefined;

  private mode: "spotlight" | "grid" = "grid";

  /**
   * The list of tiles to be laid out, along with their metadata.
   * Ordered by their score, with the most important tiles first.
   * @private
   */
  private tiles: TileLayoutMetaData[] = [];
  contentHeight: number = 0;

  constructor(config: LayoutConfig = DEFAULT_LAYOUT_CONFIG) {
    this.config = config;
  }

  private _listener:
    | ((layoutData: TilePositionData[], contentHeight: number) => void)
    | null = null;

  public setListener(
    listener: (layoutData: TilePositionData[], contentHeight: number) => void,
  ) {
    this._listener = listener;
  }

  public updateTileInfo(tiles: TileLayoutMetaData[]) {
    // TODO make score implicit
    const unsortedTiles = [...tiles];
    const sortedTiles = unsortedTiles.sort((a, b) => b.score - a.score);

    this.tiles = sortedTiles;
    // TODO: re-compute only if really needed.
    // For example, if the order of tiles changes we can just swap their layout data in the cachedTileLayoutData mapping without re-computing the whole layout.
    // In case or removing/adding tiles as there are no width/height changes, we might be able to keep the same layout and just update the stableId->layoutData mapping for new/removed tiles.
    this.computeLayout();
  }

  public updateContainerSize(containerWidth: number, containerHeight: number) {
    console.log("updateContainerSize", containerWidth, containerHeight);

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
    this.containerHeight = containerHeight;
    this.containerWidth = containerWidth;

    // TODO: compute only if changes?
    this.computeLayout();
  }

  public updateMode(mode: "spotlight" | "grid") {
    console.log("mode updated", mode);
    this.mode = mode;
    // TODO: compute only if changes?
    this.computeLayout();
  }

  private computeLayout() {
    console.log("computeLayout");
    if (
      !this.tileSize ||
      !this.colNumber ||
      !this.containerWidth ||
      !this.containerHeight
    ) {
      console.log("Container size not yet set, cannot compute layout");
      return;
    }

    if (this.tiles.length === 0) {
      console.debug("No tiles to layout");
      return;
    }

    console.debug("computeLayout mode", this.mode);
    if (this.mode === "spotlight") {
      this.cachedTileLayoutData = [];

      const tileSpotlight = this.tiles[0];
      const tilesScrolling = this.tiles.slice(1);
      const HEIGHT = 250;
      const WIDTH = 320;
      this.cachedTileLayoutData.push({
        id: tileSpotlight.id,
        x: this.config.spacing,
        y: this.config.spacing,
        width: this.containerWidth - 3 * this.config.spacing - WIDTH,
        height: this.containerHeight - 2 * this.config.spacing,
        fixed: true,
        zIndex: 1,
      });
      for (let i = 0; i < tilesScrolling.length; i++) {
        const scrollTileLeft =
          this.containerWidth - WIDTH - this.config.spacing;
        const scrollTileTop =
          i * (HEIGHT + this.config.spacing) + this.config.spacing;
        this.cachedTileLayoutData.push({
          id: tilesScrolling[i].id,
          x: scrollTileLeft,
          y: scrollTileTop,
          width: WIDTH,
          height: HEIGHT,
          fixed: false,
          zIndex: 0,
        });
      }

      const scrollingSize =
        // height from tiles
        tilesScrolling.length * HEIGHT +
        // height from spacing (+1 since we have top and bottom spacing -> one more space than tiles)
        (tilesScrolling.length + 1) * this.config.spacing;
      this.contentHeight = Math.max(this.containerHeight, scrollingSize);
    } else if (this.mode === "grid") {
      this.cachedTileLayoutData = [];
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

        this.cachedTileLayoutData.push({
          id: tile.id,
          x,
          y,
          width: tileWidth,
          height: tileHeight,
          fixed: false,
          zIndex: 0,
        });

        x += tileWidth + this.config.spacing;
        colNumber++;
      }

      this.contentHeight = y + tileHeight; // Total height of the content, used for scroll container sizing.
    }

    this._listener?.(this.cachedTileLayoutData, this.contentHeight);
  }
}
