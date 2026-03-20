import {BaseViewModel} from "../../viewmodel/BaseViewModel.ts";


export interface PlainTileSnapshot {
    tileId: string;
    backgroundColor: string;
}


export class PlainTileViewModel extends BaseViewModel<PlainTileSnapshot, unknown> {

    constructor() {
        super(undefined, {
            tileId: "",
            backgroundColor: "orange",
        });
    }

}
