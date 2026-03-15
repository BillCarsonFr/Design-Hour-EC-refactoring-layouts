import type {ViewModel} from "../../viewmodel/ViewModel.ts";
import type {PlainTileSnapshot} from "./PlainTileViewModel.ts";
import {type CSSProperties, type JSX} from "react";
import styles from "./PlainTile.module.css";

interface PlainTileProps {
    // The view consumes the snapshot contract, not a specific implementation class.
    vm: ViewModel<PlainTileSnapshot>;
}


export function PlainTile({vm}: PlainTileProps): JSX.Element {

    const snapshot = vm.getSnapshot();

    const style: CSSProperties = {
        position: "absolute",
        left: snapshot.layoutData.x,
        top: snapshot.layoutData.y,
        width: snapshot.layoutData.width,
        height: snapshot.layoutData.height,

        backgroundColor: snapshot.backgroundColor
    }
    return (
        <div className={styles.plainTile} style={style}>
            <p className={styles.tileId}>{snapshot.tileId}</p>
        </div>
    );
}
