import { useViewModel, type ViewModel } from "../../viewmodel/ViewModel.ts";
import { type ComponentType, type CSSProperties, type JSX } from "react";
import styles from "./LayoutContainer.module.css";
import type {
  LayoutContainerActions,
  LayoutContainerSnapshot,
} from "./LayoutContainerViewModel.ts";
import type { ItemLayoutData } from "../../layout/ItemLayoutData.ts";
import useMeasure from "react-use-measure";
import { type LayoutConfig } from "../../layout/LayoutEngine.ts";
import { useLayoutData } from "../../layout/useLayoutData.ts";

interface LayoutContainerProps<TTileProps extends object> {
  // The view consumes the snapshot contract, not a specific implementation class.
  vm: ViewModel<LayoutContainerSnapshot, LayoutContainerActions>;
  // Layout configuration
  config: LayoutConfig;
  // Tile component is injected so the container does not depend on a concrete tile implementation.
  TileComponent: ComponentType<TTileProps>;
  // Maps each layout entry to props consumed by TileComponent
  getTileProps: (id: string) => TTileProps;
}

export function LayoutContainer<TTileProps extends object>({
  vm,
  config,
  TileComponent,
  getTileProps,
}: LayoutContainerProps<TTileProps>): JSX.Element {
  const snapshot = useViewModel(vm);

  const [ref, { width, height }] = useMeasure();

  const { childLayoutData, contentHeight } = useLayoutData({
    config,
    tiles: snapshot.tiles,
    width,
    height,
  });

  const enableTransition = width > 0 && height > 0;
  return (
    <div ref={ref} className={styles.gridRoot}>
      <div
        className={styles.scrollingContent}
        style={{ height: Math.max(contentHeight, height) }}
      >
        {childLayoutData.map((layoutData) => (
          <div
            key={layoutData.uniqueId}
            className={styles.tileWrapper}
            style={stylesForLayoutData(layoutData, enableTransition)}
          >
            <TileComponent {...getTileProps(layoutData.uniqueId)} />
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
