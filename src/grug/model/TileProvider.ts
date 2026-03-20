import type {TileMetaData} from "../layout/LayoutEngine.ts";
import type {EventEmitter} from "events";

export interface TileProvider extends EventEmitter {
    getTiles(): TileMetaData[];
}
