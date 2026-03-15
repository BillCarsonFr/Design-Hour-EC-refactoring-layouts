import {PlainTileViewModel} from "./PlainTileViewModel.ts";
import {type JSX} from "react";
import styles from "./PlainTile.module.css";

interface PlainTileProps {
    // Ideally the view only depends on the view model i.e you don't expect any other props here.
    vm: PlainTileViewModel;
}


export function PlainTile({vm}: PlainTileProps): JSX.Element {

    const snapshot = vm.getSnapshot();

    const style = {
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
