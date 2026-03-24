import { describe, expect, it } from "vitest";
import { LayoutEngine, type TileMetaData } from "./LayoutEngine.ts";
import { SpotlightLayoutEngine } from "./SpotlightLayoutEngine.ts";
import type { ItemLayoutData } from "./ItemLayoutData.ts";

function createTile(
  stableId: string,
  options: Partial<Pick<TileMetaData, "isHero" | "score">> = {},
): TileMetaData {
  return {
    stableId,
    isHero: options.isHero ?? false,
    score: options.score ?? 0,
  };
}

function createListenerProbe() {
  let layoutData: ItemLayoutData[] = [];
  let contentHeight = 0;

  return {
    listener(nextLayoutData: ItemLayoutData[], nextContentHeight: number) {
      layoutData = nextLayoutData;
      contentHeight = nextContentHeight;
    },
    getLayoutData() {
      return layoutData;
    },
    getContentHeight() {
      return contentHeight;
    },
  };
}

describe("SpotlightLayoutEngine", () => {
  it("puts the first tile in the spotlight and the rest in a right column", () => {
    const engine = new SpotlightLayoutEngine({
      preferredTileWidth: 360,
      preferredRatio: 4 / 3,
      spacing: 16,
    });
    const probe = createListenerProbe();
    engine.setListener(probe.listener);

    engine.updateContainerSize(1200, 800);
    engine.updateTileInfo([
      createTile("a", { score: 100 }),
      createTile("b", { score: 80 }),
      createTile("c", { score: 60 }),
    ]);

    const layoutById = new Map(
      probe
        .getLayoutData()
        .map((layoutData) => [layoutData.uniqueId, layoutData]),
    );
    const spotlightTile = layoutById.get("a");
    const sideTileOne = layoutById.get("b");
    const sideTileTwo = layoutById.get("c");

    expect(spotlightTile).toBeDefined();
    expect(sideTileOne).toBeDefined();
    expect(sideTileTwo).toBeDefined();

    expect(spotlightTile?.x).toBeCloseTo(0);
    expect(spotlightTile?.width).toBeCloseTo(1064);
    expect(spotlightTile?.height).toBeCloseTo(798);
    expect(sideTileOne?.x).toBeCloseTo(1080);
    expect(sideTileOne?.width).toBeCloseTo(120);
    expect(sideTileTwo?.x).toBeCloseTo(1080);
    expect(sideTileTwo?.y).toBeGreaterThan(sideTileOne?.y ?? 0);
    expect(spotlightTile?.width ?? 0).toBeGreaterThan(sideTileOne?.width ?? 0);
  });

  it("lets the side column overflow vertically instead of shrinking it too aggressively", () => {
    const engine = new SpotlightLayoutEngine({
      preferredTileWidth: 360,
      preferredRatio: 4 / 3,
      spacing: 16,
    });
    const probe = createListenerProbe();
    engine.setListener(probe.listener);

    engine.updateContainerSize(1200, 800);
    engine.updateTileInfo([
      createTile("a", { score: 100 }),
      createTile("b", { score: 90 }),
      createTile("c", { score: 80 }),
      createTile("d", { score: 70 }),
      createTile("e", { score: 60 }),
      createTile("f", { score: 50 }),
      createTile("g", { score: 40 }),
      createTile("h", { score: 30 }),
      createTile("i", { score: 20 }),
    ]);

    const layoutById = new Map(
      probe
        .getLayoutData()
        .map((layoutData) => [layoutData.uniqueId, layoutData]),
    );
    const spotlightTile = layoutById.get("a");
    const firstSideTile = layoutById.get("b");
    const lastSideTile = layoutById.get("i");

    expect(spotlightTile).toBeDefined();
    expect(firstSideTile).toBeDefined();
    expect(lastSideTile).toBeDefined();

    expect(spotlightTile?.width).toBeCloseTo(1064);
    expect(firstSideTile?.width).toBeCloseTo(120);
    expect(probe.getContentHeight()).toBeGreaterThan(800);
    expect(lastSideTile?.y ?? 0).toBeGreaterThan(
      800 - (lastSideTile?.height ?? 0),
    );
  });

  it("keeps hero tiles in the spotlight stack together with the first tile", () => {
    const engine = new SpotlightLayoutEngine({
      preferredTileWidth: 360,
      preferredRatio: 4 / 3,
      spacing: 16,
    });
    const probe = createListenerProbe();
    engine.setListener(probe.listener);

    engine.updateContainerSize(1200, 800);
    engine.updateTileInfo([
      createTile("a", { score: 100 }),
      createTile("b", { isHero: true, score: 90 }),
      createTile("c", { isHero: true, score: 80 }),
      createTile("d", { score: 70 }),
    ]);

    const layoutById = new Map(
      probe
        .getLayoutData()
        .map((layoutData) => [layoutData.uniqueId, layoutData]),
    );
    const firstTile = layoutById.get("a");
    const heroTileOne = layoutById.get("b");
    const heroTileTwo = layoutById.get("c");
    const sideTile = layoutById.get("d");

    expect(firstTile).toBeDefined();
    expect(heroTileOne).toBeDefined();
    expect(heroTileTwo).toBeDefined();
    expect(sideTile).toBeDefined();

    expect(firstTile?.x).toBeCloseTo(heroTileOne?.x ?? 0);
    expect(heroTileOne?.x).toBeCloseTo(heroTileTwo?.x ?? 0);
    expect(firstTile?.width).toBeCloseTo(heroTileOne?.width ?? 0);
    expect(heroTileOne?.width).toBeCloseTo(heroTileTwo?.width ?? 0);
    // All spotlight tiles overlap at y=0 — stacking is done via z-index in the view
    expect(firstTile?.y).toBeCloseTo(0);
    expect(heroTileOne?.y).toBeCloseTo(0);
    expect(heroTileTwo?.y).toBeCloseTo(0);
    expect(sideTile?.x ?? 0).toBeGreaterThan(
      (firstTile?.x ?? 0) + (firstTile?.width ?? 0),
    );
    expect(probe.getContentHeight()).toBeCloseTo(798);
  });
});

describe("LayoutEngine", () => {
  it("clears the published layout when all tiles are removed", () => {
    const engine = new LayoutEngine({
      preferredTileWidth: 360,
      preferredRatio: 4 / 3,
      spacing: 16,
    });
    const probe = createListenerProbe();
    engine.setListener(probe.listener);

    engine.updateContainerSize(1200, 800);
    engine.updateTileInfo([createTile("a")]);
    expect(probe.getLayoutData()).toHaveLength(1);

    engine.updateTileInfo([]);
    expect(probe.getLayoutData()).toEqual([]);
    expect(probe.getContentHeight()).toBe(0);
  });
});
