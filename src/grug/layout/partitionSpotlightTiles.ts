import type { TileMetaData } from "./LayoutEngine.ts";

export type SpotlightPartition = {
  spotlightTiles: TileMetaData[];
  sideTiles: TileMetaData[];
};

export function partitionSpotlightTiles(
  tiles: TileMetaData[],
): SpotlightPartition {
  const spotlightTiles: TileMetaData[] = [];
  const spotlightIds = new Set<string>();

  // Always keep the first tile in the spotlight.
  const firstTile = tiles[0];
  if (firstTile) {
    spotlightTiles.push(firstTile);
    spotlightIds.add(firstTile.stableId);
  }

  for (const tile of tiles) {
    if (!tile.isHero || spotlightIds.has(tile.stableId)) {
      continue;
    }

    spotlightTiles.push(tile);
    spotlightIds.add(tile.stableId);
  }


  return {
    spotlightTiles,
    sideTiles: tiles.filter((tile) => !spotlightIds.has(tile.stableId)),
  };
}
