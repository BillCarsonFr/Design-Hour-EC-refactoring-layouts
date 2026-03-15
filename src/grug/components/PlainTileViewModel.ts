import type {ViewModel} from "../viewmodel/ViewModel.ts";
import type {ItemLayoutData} from "../layout/ItemLayoutData.ts";


export interface PlainTileSnapshot {
    tileId: string;
    backgroundColor: string;
    layoutData: ItemLayoutData;
}

export class PlainTileViewModel implements ViewModel<PlainTileSnapshot> {
    getSnapshot(): PlainTileSnapshot {
        return {
            tileId: "tile-id",
            backgroundColor: "gray",
            layoutData: {
                uniqueId: "tile-id",
                x: 0,
                y: 0,
                width: 100,
                height: 100,
            },
        };
    }

    subscribe(listener: () => void): () => void {
        return function () {
        };
    }

}
