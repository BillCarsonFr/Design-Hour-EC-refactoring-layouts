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

/**
 * The per tile position related data provided by the ViewModel.
 * This is very high level metadata. The view itself is resposible to compute the position of the tiles.
 * The order of the metadata array determines their score/priority.
 */
export interface TileLayoutMetaData {
  /** The unique identifier for this tile, used for tracking and layout purposes. */
  id: string;
  // isHero: boolean;
  // isMe: boolean;
  // isScreenshare: boolean;
}
