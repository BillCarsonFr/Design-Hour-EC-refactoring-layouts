import {useViewModel, type ViewModel} from "../../viewmodel/ViewModel.ts";
import {type ComponentType, type CSSProperties, type JSX} from "react";
import styles from "./LayoutContainer.module.css";
import type {LayoutContainerSnapshot} from "./LayoutContainerViewModel.ts";
import type {ItemLayoutData} from "../../layout/ItemLayoutData.ts";

interface LayoutContainerProps<TTileProps extends object> {
    // The view consumes the snapshot contract, not a specific implementation class.
    vm: ViewModel<LayoutContainerSnapshot>;
    // Tile component is injected so the container does not depend on a concrete tile implementation.
    TileComponent: ComponentType<TTileProps>;
    // Maps each layout entry to props consumed by TileComponent
    getTileProps: (layoutData: ItemLayoutData) => TTileProps;

}

export function LayoutContainer<TTileProps extends object>({
    vm,
    TileComponent,
    getTileProps,
}: LayoutContainerProps<TTileProps>): JSX.Element {
    const snapshot = useViewModel(vm);

    return (
        <div className={styles.gridRoot}>
            <div className={styles.scrollingContent} style={{height: snapshot.contentHeight}}>
                {snapshot.childLayoutData.map((layoutData) => (
                    (
                        <div key={layoutData.uniqueId} className={styles.tileWrapper} style={stylesForLayoutData(layoutData)}>
                            <TileComponent {...getTileProps(layoutData)} />
                        </div>
                    )
                ))}
            </div>
        </div>
    );
}

/**
 * Get the position and size styles for a given layout data.
 * @param layoutData
 */
function stylesForLayoutData(layoutData: ItemLayoutData): CSSProperties {
    return {
        position: "absolute",
        // Use transform instead of top/left for better performance when animating position changes,
        // as it can be GPU-accelerated and doesn't trigger layout recalculations.
        transform: `translate3d(${layoutData.x}px, ${layoutData.y}px, 0)`,
        width: layoutData.width,
        height: layoutData.height,
        transition: "transform 300ms ease",
    }
}
