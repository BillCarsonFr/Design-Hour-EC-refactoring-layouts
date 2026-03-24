import {
  type CSSProperties,
  type JSX,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import styles from "./LayoutContainerView.module.css";
import type { TilePositionData as TilePositionData } from "./layout/ItemLayoutData.ts";
import useMeasure from "react-use-measure";
import { LayoutEngine } from "./layout/LayoutEngine.ts";

import { useBehavior } from "../../ec-viewmodel/Behavior.ts";
import type { ViewModel } from "../../ec-viewmodel/ViewModel.ts";

export interface TileLayoutMetaData {
  /** The unique identifier for this tile, used for tracking and layout purposes. */
  stableId: string;
  // isHero: boolean;
  // isMe: boolean;
  /**
   * A score representing the importance of this tile for layout purposes.
   * Higher scores indicate higher importance.
   * For a call it would be based on factors like whether the tile is active/speaking,
   * whether the tile is has video enabled ot not...
   */
  // TODO make score implicit by TileMetaData array order
  score: number;
}

export interface LayoutContainerSnapshot {
  // Consider splitting the two into tiles Map<string, JSX.Element> and tileMetadata: TileMetaData[]
  tilesLayoutMetaData: TileLayoutMetaData[];
  tiles: Map<string, JSX.Element>;
  mode: "grid" | "list";
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

  return (
    <div ref={ref} className={styles.gridRoot}>
      <div
        className={styles.scrollingContent}
        style={{ height: contentHeight }}
      >
        {tilesPositionData.map((data) => {
          const style = stylesForPositionData(data, enableTransition);
          return (
            <div
              key={data.stableId}
              className={styles.tileWrapper}
              style={style}
            >
              {tiles.get(data.stableId)}
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
    position: "absolute",
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
