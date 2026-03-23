import type { TileMetaData } from "../layout/LayoutEngine.ts";
import type { Observable } from "rxjs";

export interface TileProvider {
  tiles$: Observable<TileMetaData[]>;
}
