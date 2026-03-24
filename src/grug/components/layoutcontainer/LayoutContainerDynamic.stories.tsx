import {
  type CSSProperties,
  type JSX,
  useEffect,
  useRef,
  useState,
} from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  type LayoutContainerActions,
  type LayoutContainerSnapshot,
} from "./LayoutContainerViewModel.ts";
import { LayoutContainer } from "./LayoutContainer.tsx";
import { useViewModel, type ViewModel } from "../../viewmodel/ViewModel.ts";
import { BaseViewModel } from "../../viewmodel/BaseViewModel.ts";
import {
  DEFAULT_LAYOUT_CONFIG,
  type TileMetaData,
} from "../../layout/LayoutEngine.ts";

type LayoutContainerStoryArgs = {
  addTile?: (tileId: string) => void;
  removeTile?: (tileId: string) => void;
};

interface TestTileSnapshot {
  tileId: string;
  backgroundColor: string;
}

export interface TestTileViewModelProps {
  tileId: string;
}

class TestTileViewModel extends BaseViewModel<
  TestTileSnapshot,
  TestTileViewModelProps
> {
  constructor(props: TestTileViewModelProps) {
    super(props, {
      tileId: props.tileId,
      backgroundColor: colorFromId(props.tileId),
    });
  }
}

type TestTileViewProps = {
  vm: ViewModel<TestTileSnapshot>;
  onClose: () => void;
  weight: number;
  onWeightChange: (weight: number) => void;
};

function TestTile({ vm, onClose, weight, onWeightChange }: TestTileViewProps) {
  const snapshot = useViewModel(vm);
  const [draftWeight, setDraftWeight] = useState(weight);

  useEffect(() => {
    setDraftWeight(weight);
  }, [weight]);

  const commitWeightIfChanged = () => {
    if (draftWeight !== weight) {
      onWeightChange(draftWeight);
    }
  };

  const style: CSSProperties = {
    flex: 1,
    backgroundColor: snapshot.backgroundColor,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    position: "relative",
    paddingBottom: 48,
  };

  return (
    <div style={style}>
      <button
        type="button"
        onClick={onClose}
        aria-label={`Remove tile ${snapshot.tileId}`}
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          width: 28,
          height: 28,
          borderRadius: "50%",
          border: "none",
          cursor: "pointer",
          fontWeight: 700,
          lineHeight: 1,
        }}
      >
        x
      </button>

      <p
        style={{
          fontFamily: "monospace",
          fontSize: "3rem",
          fontWeight: "700",
          color: "white",
          margin: 0,
        }}
      >
        {snapshot.tileId}
      </p>

      <div
        style={{
          position: "absolute",
          left: 12,
          right: 12,
          bottom: 10,
          display: "flex",
          alignItems: "center",
          gap: 8,
          color: "white",
          fontFamily: "monospace",
          fontSize: "0.9rem",
        }}
      >
        <span>W:{weight}</span>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={draftWeight}
          onChange={(event) => setDraftWeight(Number(event.target.value))}
          onPointerUp={commitWeightIfChanged}
          onBlur={commitWeightIfChanged}
          style={{ flex: 1 }}
        />
      </div>
    </div>
  );
}

// 1) Mutable VM used only for Storybook
class StoryLayoutContainerViewModel
  extends BaseViewModel<LayoutContainerSnapshot, Record<string, never>>
  implements LayoutContainerActions
{
  constructor() {
    super({}, { tiles: [], mode: "grid" });
  }

  setLayoutMode = (mode: LayoutContainerSnapshot["mode"]) => {
    this.snapshot.merge({ mode });
  };

  setTiles = (tiles: TileMetaData[]) => {
    this.snapshot.merge({ tiles });
  };
}

function LayoutContainerStoryRender(
  args: LayoutContainerStoryArgs,
): JSX.Element {
  const [vm] = useState(() => new StoryLayoutContainerViewModel());
  const tileVmsRef = useRef<Map<string, TestTileViewModel>>(new Map());
  const nextTileIdRef = useRef(0);

  useEffect(() => {
    const initialTilesCount = 5;
    const initialTiles = sortTilesByWeight(
      Array.from({ length: initialTilesCount }, (_, i) => ({
        stableId: i.toString(),
        score: 0,
      })),
    );

    nextTileIdRef.current = initialTilesCount;
    vm.setTiles(initialTiles);
  }, [vm]);

  useEffect(() => () => vm.dispose(), [vm]);

  const removeTileById = (tileId: string) => {
    const currentTiles = vm.getSnapshot().tiles;
    const exists = currentTiles.some((t) => t.stableId === tileId);
    if (!exists) return;

    vm.setTiles(currentTiles.filter((t) => t.stableId !== tileId));

    const tileVm = tileVmsRef.current.get(tileId);
    if (tileVm) {
      tileVm.dispose();
      tileVmsRef.current.delete(tileId);
    }

    args.removeTile?.(tileId);
  };

  const handleTileWeightChange = (tileId: string, nextWeight: number) => {
    const currentTiles = vm.getSnapshot().tiles;
    const updatedTiles = currentTiles.map((tile) =>
      tile.stableId === tileId ? { ...tile, score: nextWeight } : tile,
    );
    vm.setTiles(sortTilesByWeight(updatedTiles));
  };

  const getTileProps = (id: string) => {
    let tileVm = tileVmsRef.current.get(id);
    if (!tileVm) {
      tileVm = new TestTileViewModel({ tileId: id });
      tileVmsRef.current.set(id, tileVm);
    }

    const tile = vm.getSnapshot().tiles.find((item) => item.stableId === id);
    const weight = tile?.score ?? 0;

    return {
      vm: tileVm,
      onClose: () => removeTileById(id),
      weight,
      onWeightChange: (nextWeight: number) =>
        handleTileWeightChange(id, nextWeight),
    };
  };

  const handleAddTile = () => {
    const tileId = String(nextTileIdRef.current++);
    const currentTiles = vm.getSnapshot().tiles;
    vm.setTiles(
      sortTilesByWeight([...currentTiles, { stableId: tileId, score: 0 }]),
    );
    args.addTile?.(tileId);
  };

  const handleRemoveTile = () => {
    const currentTiles = vm.getSnapshot().tiles;
    if (currentTiles.length === 0) return;

    const removed = currentTiles[currentTiles.length - 1];
    vm.setTiles(currentTiles.slice(0, -1));

    const tileVm = tileVmsRef.current.get(removed.stableId);
    if (tileVm) {
      tileVm.dispose();
      tileVmsRef.current.delete(removed.stableId);
    }

    args.removeTile?.(removed.stableId);
  };

  useEffect(() => {
    const tileVms = tileVmsRef.current;
    return () => {
      for (const tileVm of tileVms.values()) {
        tileVm.dispose();
      }
      tileVms.clear();
    };
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        width: "100%",
      }}
    >
      <div style={{ display: "flex", gap: 8 }}>
        <button type="button" onClick={handleAddTile}>
          Add tile
        </button>
        <button type="button" onClick={handleRemoveTile}>
          Remove tile
        </button>
      </div>

      <LayoutContainer
        vm={vm}
        config={DEFAULT_LAYOUT_CONFIG}
        TileComponent={TestTile}
        getTileProps={getTileProps}
      />
    </div>
  );
}

const meta = {
  title: "Grug/Container/DynamicLayoutContainer",
  render: (args: LayoutContainerStoryArgs) => (
    <div style={{ display: "flex" }}>
      <LayoutContainerStoryRender {...args} />
    </div>
  ),
  argTypes: {
    addTile: { action: "addTile" },
    removeTile: { action: "removeTile" },
  },
} satisfies Meta<LayoutContainerStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

// Some utility functions for generating random colors

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

function sortTilesByWeight(tiles: TileMetaData[]): TileMetaData[] {
  return [...tiles].sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.stableId.localeCompare(b.stableId);
  });
}
