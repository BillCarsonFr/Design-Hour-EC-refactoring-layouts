import { BaseViewModel } from "../../viewmodel/BaseViewModel.ts";

export interface PlainTileSnapshot {
  tileId: string;
  backgroundColor: string;
}

export interface PlainTileViewProps {
  tileId: string;
}

export class PlainTileViewModel extends BaseViewModel<
  PlainTileSnapshot,
  PlainTileViewProps
> {
  constructor(props: PlainTileViewProps) {
    super(props, {
      tileId: props.tileId,
      backgroundColor: colorFromId(props.tileId),
    });
  }
}

const PASTEL_COLORS = [
  "#FF7F8E", // deeper red
  "#FFB347", // deeper orange
  "#FFE034", // deeper yellow
  "#6ED98A", // deeper green
  "#6AB8FF", // deeper blue
  "#A87EFF", // deeper purple
  "#FF7FD4", // deeper pink
  "#4FD9C8", // deeper cyan
  "#FF9A5C", // deeper peach
  "#A8E84A", // deeper lime
];

function colorFromId(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0; // keep it a 32-bit unsigned int
  }
  return PASTEL_COLORS[hash % PASTEL_COLORS.length];
}
