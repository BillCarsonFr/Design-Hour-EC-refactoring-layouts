import { useEffect, useMemo, useState } from "react";
import {
  LayoutEngine,
  type LayoutConfig,
  type LayoutDataEngine,
  type TileMetaData,
} from "./LayoutEngine.ts";
import type { ItemLayoutData } from "./ItemLayoutData.ts";
import { SpotlightLayoutEngine } from "./SpotlightLayoutEngine.ts";

export type LayoutEngineKind = "grid" | "spotlight";

type UseLayoutDataParams = {
  config: LayoutConfig;
  tiles: TileMetaData[];
  width: number;
  height: number;
  engineKind: LayoutEngineKind;
};

type LayoutState = {
  childLayoutData: ItemLayoutData[];
  contentHeight: number;
};

export function useLayoutData({
  config,
  tiles,
  width,
  height,
  engineKind,
}: UseLayoutDataParams): LayoutState {
  const [state, setState] = useState<LayoutState>({
    childLayoutData: [],
    contentHeight: 0,
  });

  // Keep one engine instance per config
  const layoutEngine = useMemo<LayoutDataEngine>(() => {
    if (engineKind === "spotlight") {
      return new SpotlightLayoutEngine(config);
    }

    return new LayoutEngine(config);
  }, [config, engineKind]);

  // Subscribe to engine listener
  useEffect(() => {
    layoutEngine.setListener((layoutData, contentHeight) => {
      setState({ childLayoutData: layoutData, contentHeight });
    });

    // Current API has no clearListener; replace with no-op on cleanup
    return () => {
      layoutEngine.setListener(() => {});
    };
  }, [layoutEngine]);

  // Push tile changes into engine
  useEffect(() => {
    layoutEngine.updateTileInfo(tiles);
  }, [layoutEngine, tiles]);

  // Push container size changes into engine
  useEffect(() => {
    if (width <= 0) return;
    layoutEngine.updateContainerSize(width, height);
  }, [layoutEngine, width, height]);

  return state;
}
