import type {TileMetaData} from "../layout/LayoutEngine.ts";

export interface TileProvider {
    getTiles(): TileMetaData[];
}
