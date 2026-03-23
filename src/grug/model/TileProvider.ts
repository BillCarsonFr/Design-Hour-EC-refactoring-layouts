import type { TileMetaData } from "../components/layoutcontainer/layout/LayoutEngine.ts";
import type { Observable } from "rxjs";

export interface TileProvider {
  tiles$: Observable<TileMetaData[]>;
}
