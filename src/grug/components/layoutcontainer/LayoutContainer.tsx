import { useViewModel, type ViewModel } from "../../viewmodel/ViewModel.ts";
import {
  type ComponentType,
  type CSSProperties,
  type JSX,
  useEffect,
} from "react";
import styles from "./LayoutContainer.module.css";
import type {
  LayoutContainerActions,
  LayoutContainerSnapshot,
} from "./LayoutContainerViewModel.ts";
import type { ItemLayoutData } from "../../layout/ItemLayoutData.ts";
import useMeasure from "react-use-measure";

interface LayoutContainerProps<TTileProps extends object> {
  // The view consumes the snapshot contract, not a specific implementation class.
  vm: ViewModel<LayoutContainerSnapshot, LayoutContainerActions>;
  // Tile component is injected so the container does not depend on a concrete tile implementation.
  TileComponent: ComponentType<TTileProps>;
  // Maps each layout entry to props consumed by TileComponent
  getTileProps: (id: string) => TTileProps;
}

export function LayoutContainer<TTileProps extends object>({
  vm,
  TileComponent,
  getTileProps,
}: LayoutContainerProps<TTileProps>): JSX.Element {
  const snapshot = useViewModel(vm);

  const [ref, { width, height }] = useMeasure();

  useEffect(() => {
    // Only check width here, as height can be 0 when the container is first rendered,
    // and will only be updated after the first layout calculated the scroll height.
    if (width <= 0) return;
    vm.setContainerSize(width, height);
  }, [vm, width, height]);

  const enableTransition = width > 0 && height > 0;
  return (
    <div ref={ref} className={styles.gridRoot}>
      <div
        className={styles.scrollingContent}
        style={{ height: snapshot.contentHeight }}
      >
        {snapshot.childLayoutData.map((layoutData) => (
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
