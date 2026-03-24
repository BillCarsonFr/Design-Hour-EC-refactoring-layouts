import {
  type CSSProperties,
  type JSX,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import styles from "./LayoutContainerView.module.css";
import useMeasure from "react-use-measure";
import { LayoutEngine } from "./LayoutEngine.ts";

import { useBehavior } from "../../ec-viewmodel/Behavior.ts";
import type { ViewModel } from "../../ec-viewmodel/ViewModel.ts";
import type {
  TileLayoutMetaData,
  TilePositionData,
} from "./TileDataInterfaces.ts";

export interface LayoutContainerSnapshot {
  tilesLayoutMetaData: TileLayoutMetaData[];
  tiles: Map<string, JSX.Element>;
  mode: "grid" | "spotlight";
}

interface LayoutContainerViewProps {
  // Tile component is injected so the container does not depend on a concrete tile implementation.
  vm: ViewModel<LayoutContainerSnapshot, object>;
}

export function LayoutContainerView({
  vm,
}: LayoutContainerViewProps): JSX.Element {
  const { tilesLayoutMetaData, tiles, mode } = useBehavior(vm.snapshot$);
  // TODO move layoutEngine to rxjs and pass it the layoutMetaData withou react hooks!
  // const {contentHight, tilesPositionData} = useBehavior(LayoutEngine$(tilesLayoutMetaData$, mode$, width$, height$))
  const [ref, { width, height }] = useMeasure();

  const [contentHeight, setContentHeight] = useState(0);
  const [tilesPositionData, setTilesPositionData] = useState<
    TilePositionData[]
  >([]);

  const layoutListener = useCallback(
    (positionData: TilePositionData[], contentHeight: number) => {
      setContentHeight(contentHeight);
      // Clone array so we actually get a react render
      setTilesPositionData(Array.from(positionData));
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
    layoutEngine.updateTileInfo(tilesLayoutMetaData);
  }, [layoutEngine, tilesLayoutMetaData]);
  useEffect(() => {
    layoutEngine.updateMode(mode);
  }, [layoutEngine, mode]);

  const enableTransition = width > 0 && height > 0;
  console.log("tilesPositionData", tilesPositionData);
  return (
    <div ref={ref} className={styles.gridRoot}>
      <div
        className={styles.scrollingContent}
        // transform to create a fixed position containing box
        style={{ height: contentHeight }}
      >
        {tilesPositionData
          // We order by stable id to ensure consistent dom tree ordering across renders.
          // Otherwise items might get repositioned in the dom and css wont work with: `transform 300ms ease`.
          .sort((a, b) => a.id.localeCompare(b.id))
          .map((data) => {
            const style = stylesForPositionData(data, enableTransition);
            return (
              <div key={data.id} className={styles.tileWrapper} style={style}>
                {tiles.get(data.id)}
              </div>
            );
          })}
      </div>
    </div>
  );
}

/**
 * Get the position and size styles for a given layout data.
 * @param positionData
 * @param enableTransition - Whether to enable transition animations.
 */
function stylesForPositionData(
  positionData: TilePositionData,
  enableTransition: boolean,
): CSSProperties {
  return {
    position: positionData.fixed ? "fixed" : "absolute",
    pointerEvents: positionData.fixed ? "none" : "auto",
    // Use transform instead of top/left for better performance when animating position changes,
    // as it can be GPU-accelerated and doesn't trigger layout recalculations.
    transform: `translate3d(${positionData.x}px, ${positionData.y}px, 0)`,
    width: positionData.width,
    height: positionData.height,
    transition: enableTransition
      ? "transform 300ms ease, width 300ms ease, height 300ms ease"
      : "none",
  };
}
