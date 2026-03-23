import {
  type CSSProperties,
  type JSX,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import styles from "./LayoutContainerView.module.css";
import type { ItemLayoutData } from "./layout/ItemLayoutData.ts";
import useMeasure from "react-use-measure";
import { LayoutEngine } from "./layout/LayoutEngine.ts";

import { useBehavior } from "../../ec-viewmodel/Behavior.ts";
import type { ViewModel } from "../../ec-viewmodel/ViewModel.ts";

export interface LayoutContainerSnapshot {
  tiles: Map<string, { score: number; tile: JSX.Element; stableId: string }>;
  mode: "grid" | "list";
}

interface LayoutContainerViewProps {
  // Tile component is injected so the container does not depend on a concrete tile implementation.
  vm: ViewModel<LayoutContainerSnapshot, object>;
}

export function LayoutContainerView({
  vm,
}: LayoutContainerViewProps): JSX.Element {
  const { tiles, mode } = useBehavior(vm.snapshot$);
  const [ref, { width, height }] = useMeasure();

  const [contentHeight, setContentHeight] = useState(0);
  const [layoutDataMap, setLayoutDataMap] = useState({
    map: new Map<string, ItemLayoutData>(),
  });

  const layoutListener = useCallback(
    (layoutData: Map<string, ItemLayoutData>, contentHeight: number) => {
      setContentHeight(contentHeight);
      // wrap in additional object so we actually get a react rerender
      setLayoutDataMap({ map: layoutData });
    },
    [],
  );

  const layoutEngine = useMemo(() => {
    const engine = new LayoutEngine();
    engine.setListener(layoutListener);
    return engine;
  }, [layoutListener]);

  useEffect(() => {
    // Only check width here, as height can be 0 when the container is first rendered,
    // and will only be updated after the first layout calculated the scroll height.
    if (width <= 0) return;
    layoutEngine.updateContainerSize(width, height);
  }, [layoutEngine, width, height]);

  useEffect(() => {
    layoutEngine.updateTileInfo(tiles);
  }, [layoutEngine, tiles]);

  useEffect(() => {
    layoutEngine.updateMode(mode);
  }, [layoutEngine, mode]);

  const enableTransition = width > 0 && height > 0;

  const tilesRenderData = useMemo(() => {
    return Array.from(tiles.entries())
      .map(([uniqueId, { tile }]) => {
        const layoutData = layoutDataMap.map.get(uniqueId);
        if (layoutData === undefined) return null;
        return {
          id: uniqueId,
          tile,
          style: stylesForLayoutData(layoutData, enableTransition),
        };
      })
      .filter((item) => item !== null);
  }, [tiles, layoutDataMap, enableTransition]);

  return (
    <div ref={ref} className={styles.gridRoot}>
      <div
        className={styles.scrollingContent}
        style={{ height: contentHeight }}
      >
        {tilesRenderData.map(({ id, tile, style }) => (
          <div key={id} className={styles.tileWrapper} style={style}>
            {tile}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Get the position and size styles for a given layout data.
 * @param layoutData
 * @param enableTransition - Whether to enable transition animations.
 */
function stylesForLayoutData(
  layoutData: ItemLayoutData,
  enableTransition: boolean,
): CSSProperties {
  return {
    position: "absolute",
    // Use transform instead of top/left for better performance when animating position changes,
    // as it can be GPU-accelerated and doesn't trigger layout recalculations.
    transform: `translate3d(${layoutData.x}px, ${layoutData.y}px, 0)`,
    width: layoutData.width,
    height: layoutData.height,
    transition: enableTransition
      ? "transform 300ms ease, width 300ms ease, height 300ms ease"
      : "none",
  };
}
