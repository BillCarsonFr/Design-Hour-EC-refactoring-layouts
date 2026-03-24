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

  for (const tile of tiles) {
    if (!tile.isHero || spotlightIds.has(tile.stableId)) {
      continue;
    }

    spotlightTiles.push(tile);
    spotlightIds.add(tile.stableId);
  }

  if (spotlightTiles.length === 0) {
    // No hero tiles → treat the first tile as the spotlight tile
    const firstTile = tiles[0];
    if (firstTile) {
      spotlightTiles.push(firstTile);
      spotlightIds.add(firstTile.stableId);
    }
  }

  return {
    spotlightTiles,
    sideTiles: tiles.filter((tile) => !spotlightIds.has(tile.stableId)),
  };
}
