import { type CSSProperties, type JSX } from "react";
import styles from "./LayoutContainerView.module.css";
import useMeasure from "react-use-measure";

import { useSnapshot, type ViewModel } from "../../ec-viewmodel/ViewModel.ts";
import type {
  TileLayoutMetaData,
  TilePositionData,
} from "./TileDataInterfaces.ts";

import { useObservable, useObservableState } from "observable-hooks";
import { map, startWith } from "rxjs";
import { LayoutEngine$ } from "./LayoutEngineFunction.ts";

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
  const snapshot$ = useSnapshot(vm);
  const tiles = useObservableState(snapshot$.pipe(map((s) => s.tiles)));

  const [ref, { width, height }] = useMeasure();
  const enableTransition = width > 0 && height > 0;
  const containerSize$ = useObservable(
    (inputs$) =>
      inputs$.pipe(
        map(([w, h]) => ({ w, h })),
        startWith({ w: 0, h: 0 }),
      ),
    [width, height],
  );

  const layoutData = useObservableState(
    useObservable(() => LayoutEngine$(snapshot$, containerSize$)),
  );

  return (
    <div ref={ref} className={styles.gridRoot}>
      <div
        className={styles.scrollingContent}
        // transform to create a fixed position containing box
        style={{ height: layoutData?.contentHeight }}
      >
        {/* Alternative

         {layoutReactElementTree}
         tiles.values().map((tile) => {
           return <ReactSpringSlot itToAttachTo={data.id} refToLayoutTree={layoutTreeRef} key={data.id} >
             {tiles.get(data.id)}
           </ReactSpringSlot>
         })

          */}

        {layoutData?.tilesPositionData
          // We order by stable id to ensure consistent dom tree ordering across renders.
          // Otherwise items might get repositioned in the dom and css wont work with: `transform 300ms ease`.
          .sort((a, b) => a.id.localeCompare(b.id))
          .map((data) => {
            const style = stylesForPositionData(data, enableTransition);
            return (
              <div key={data.id} className={styles.tileWrapper} style={style}>
                {tiles?.get(data.id)}
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
