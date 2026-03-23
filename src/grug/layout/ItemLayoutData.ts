export interface ItemLayoutData {
  /**
   * A unique identifier for the item.
   * This is used to track the item across layout changes and should be stable for the same item,
   * even if its position or size changes.
   */
  uniqueId: string;
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
}
