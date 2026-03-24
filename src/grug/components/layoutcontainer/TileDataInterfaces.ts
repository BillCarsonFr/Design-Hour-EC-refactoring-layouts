export interface TilePositionData {
  id: string;
  /**
   * The x and y coordinates of the top-left corner of the item, relative to the layout container.
   */
  x: number;
  /**
   * The x and y coordinates of the top-left corner of the item, relative to the layout container.
   */
  y: number;
  /**
   * The width and height of the item in pixels.
   */
  width: number;
  /**
   * The width and height of the item in pixels.
   */
  height: number;
  zIndex: number;
  fixed: boolean;
}

/** The per tile position related data provided by the ViewModel.
 * This is very high level metadata. The view itself is resposible to compute the position of the tiles
 */
export interface TileLayoutMetaData {
  /** The unique identifier for this tile, used for tracking and layout purposes. */
  id: string;
  // isHero: boolean;
  // isMe: boolean;
  // isScreenshare: boolean;
  /**
   * A score representing the importance of this tile for layout purposes.
   * Higher scores indicate higher importance.
   * For a call it would be based on factors like whether the tile is active/speaking,
   * whether the tile is has video enabled ot not...
   */
  // TODO make score implicit by TileMetaData array order
  score: number;
}
