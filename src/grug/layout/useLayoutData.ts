import { useEffect, useMemo, useState } from "react";
import {
  LayoutEngine,
  type LayoutConfig,
  type TileMetaData,
} from "./LayoutEngine.ts";
import type { ItemLayoutData } from "./ItemLayoutData.ts";

type UseLayoutDataParams = {
  config: LayoutConfig;
  tiles: TileMetaData[];
  width: number;
  height: number;
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
}: UseLayoutDataParams): LayoutState {
  const [state, setState] = useState<LayoutState>({
    childLayoutData: [],
    contentHeight: 0,
  });

  // Keep one engine instance per config
  const layoutEngine = useMemo(() => new LayoutEngine(config), [config]);

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
