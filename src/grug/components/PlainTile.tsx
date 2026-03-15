import {PlainTileViewModel} from "./PlainTileViewModel.ts";
import {JSX} from "react";



interface PlainTileProps {
    // Ideally the view only depends on the view model i.e you don't expect any other props here.
    vm: PlainTileViewModel;
}


export function PlainTile({ vm }: PlainTileProps): JSX.Element {

    const snapshot = vm.getSnapshot();

    return (
        <div className="plain-tile" style={{backgroundColor: snapshot.backgroundColor}}>
            <p className={"plain-id-text"}>{snapshot.tileId}</p>
        </div>
    );
}
