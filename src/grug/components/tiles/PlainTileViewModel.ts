import type {ViewModel} from "../../viewmodel/ViewModel.ts";
import type {ItemLayoutData} from "../../layout/ItemLayoutData.ts";


export interface PlainTileSnapshot {
    tileId: string;
    backgroundColor: string;
    layoutData: ItemLayoutData;
}

export class PlainTileViewModel implements ViewModel<PlainTileSnapshot> {
    getSnapshot(): PlainTileSnapshot {
        return {
            tileId: "0",
            backgroundColor: "orange",
            layoutData: {
                uniqueId: "tile-id",
                x: 16,
                y: 16,
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
