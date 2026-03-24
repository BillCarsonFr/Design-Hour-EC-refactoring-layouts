import type { TileMetaData } from "../components/layoutcontainer/LayoutEngine.ts";
import type { Observable } from "rxjs";

export interface TileProvider {
  tiles$: Observable<TileMetaData[]>;
}
