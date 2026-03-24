import type { TileLayoutMetaData } from "../components/layoutcontainer/TileDataInterfaces.ts";
import type { Observable } from "rxjs";

export interface TileProvider {
  tiles$: Observable<TileLayoutMetaData[]>;
}
