import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  map,
  Observable,
} from "rxjs";
import type {
  TileLayoutMetaData,
  TilePositionData,
} from "./TileDataInterfaces.ts";
import type { LayoutData } from "./LayoutContainerView.tsx";

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

export function LayoutEngine$(
  snapshotData$: Observable<{
    tilesLayoutMetaData: TileLayoutMetaData[];
    mode: "grid" | "spotlight";
  }>,
  containerData$: Observable<{ w: number; h: number }>,
  config: LayoutConfig = DEFAULT_LAYOUT_CONFIG,
): Observable<LayoutData> {
  const tilesPositionData$ = new BehaviorSubject<TilePositionData[]>([]);
  const contentHeight$ = new BehaviorSubject<number>(0);

  console.log("called LayoutEngine$");
  const containerDerivedData$ = containerData$.pipe(
    map(({ w: width, h: height }) => {
      console.log("updateContainerSize Called from obs", width, height);

      // Calculate the ideal (fractional) number of tiles that fit in the container
      const idealTilesPerRow =
        (width + config.spacing) / (config.preferredTileWidth + config.spacing);
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
        (width - (tilesPerRow - 1) * config.spacing) / tilesPerRow;
      const tileHeight = tileWidth / config.preferredRatio;
      return {
        tileSize: [tileWidth, tileHeight],
        colNumber: tilesPerRow,
        width,
        height,
      };
    }),
    distinctUntilChanged((a, b) => JSON.stringify(a) == JSON.stringify(b)),
  );

  snapshotData$.subscribe((snapshot) =>
    console.log("snapshot subscription", snapshot),
  );

  combineLatest([snapshotData$, containerDerivedData$]).subscribe(
    ([{ tilesLayoutMetaData, mode }, container]) => {
      console.log("computeLayout");
      if (
        !container.tileSize ||
        !container.colNumber ||
        !container.width ||
        !container.height
      ) {
        console.log("Container size not yet set, cannot compute layout");
        return;
      }

      tilesLayoutMetaData.sort((a, b) => b.score - a.score);

      if (tilesLayoutMetaData.length === 0) {
        console.debug("No tiles to layout");
        return;
      }

      console.debug("computeLayout mode", mode);
      if (mode === "spotlight") {
        const newPositionData = [];

        const tileSpotlight = tilesLayoutMetaData[0];
        const tilesScrolling = tilesLayoutMetaData.slice(1);
        const HEIGHT = 250;
        const WIDTH = 320;
        newPositionData.push({
          id: tileSpotlight.id,
          x: config.spacing,
          y: config.spacing,
          width: container.width - 3 * config.spacing - WIDTH,
          height: container.height - 2 * config.spacing,
          fixed: true,
          zIndex: 1,
        });
        for (let i = 0; i < tilesScrolling.length; i++) {
          const scrollTileLeft = container.width - WIDTH - config.spacing;
          const scrollTileTop = i * (HEIGHT + config.spacing) + config.spacing;
          newPositionData.push({
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
          (tilesScrolling.length + 1) * config.spacing;
        contentHeight$.next(Math.max(container.height, scrollingSize));
        tilesPositionData$.next(newPositionData);
      } else if (mode === "grid") {
        const newPositionData = [];
        let x = 0;
        let y = 0;

        const tileWidth = container.tileSize[0];
        const tileHeight = container.tileSize[1];
        // let rowHeight = tileHeight + this.config.spacing;
        let colNumber = 0;
        // let rowNumber = 0;
        for (const tile of tilesLayoutMetaData) {
          if (colNumber >= container.colNumber) {
            // Move to the next row
            x = 0;
            y += tileHeight + config.spacing;
            colNumber = 0;
          }

          newPositionData.push({
            id: tile.id,
            x,
            y,
            width: tileWidth,
            height: tileHeight,
            fixed: false,
            zIndex: 0,
          });

          x += tileWidth + config.spacing;
          colNumber++;
        }

        contentHeight$.next(y + tileHeight); // Total height of the content, used for scroll container sizing.
        tilesPositionData$.next(newPositionData);
      }
    },
  );

  return combineLatest([tilesPositionData$, contentHeight$]).pipe(
    map(([tilesPositionData, contentHeight]) => ({
      tilesPositionData,
      contentHeight,
    })),
  );
}
