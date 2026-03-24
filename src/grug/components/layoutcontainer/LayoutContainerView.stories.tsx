import { type CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  LayoutContainerView,
  type LayoutContainerSnapshot,
  type TileLayoutMetaData,
} from "./LayoutContainerView.tsx";
import { BehaviorSubject } from "rxjs";
import type { ViewModel } from "../../ec-viewmodel/ViewModel.ts";
import { screen } from "storybook/test";

type LayoutContainerStoryArgs = {
  /**
   * The number of tiles to show in the LayoutContainer
   */
  numberOfTiles: number;
  mode: "grid" | "list";
};

interface TestTileSnapshot {
  tileId: string;
  onClick: () => void;
}

function TestTile({ tileId, onClick }: TestTileSnapshot) {
  const style: CSSProperties = {
    flex: 1,
    backgroundColor: colorFromId(tileId),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
  };

  return (
    <div style={style} onClick={onClick}>
      <p
        style={{
          fontFamily: "monospace",
          fontSize: "3rem",
          fontWeight: "700",
          color: "white",
          margin: 0,
        }}
      >
        {tileId}
      </p>
    </div>
  );
}

class MockViewModel implements ViewModel<
  LayoutContainerSnapshot,
  { setNumberOfTiles: (amount: number) => void }
> {
  public constructor(args: LayoutContainerStoryArgs) {
    this.setNumberOfTiles(args.numberOfTiles);
  }

  public snapshot$ = new BehaviorSubject<LayoutContainerSnapshot>({
    tilesLayoutMetaData: [],
    tiles: new Map(),
    mode: "grid",
  });

  public setNumberOfTiles(amount: number): void {
    const tiles = new Map();
    const tilesLayoutMetaData: TileLayoutMetaData[] = [];

    const tileIds = [...Array(amount).keys()].map((i) => `tile-${i}`);
    tileIds.forEach((id) => {
      tiles.set(
        id,
        <TestTile
          key={id}
          tileId={id}
          onClick={() => {
            const score = this.snapshot$.value.tilesLayoutMetaData.find(
              (t) => t.stableId === id,
            )?.score;
            this.setScoreOfTile(id, (score ?? 0) + 1);
          }}
        />,
      );
      tilesLayoutMetaData.push({ stableId: id, score: 0 });
    });

    this.snapshot$.next({
      tilesLayoutMetaData,
      tiles,
      mode: "grid",
    });
  }

  public addTile(): void {
    const snapshot = this.snapshot$.value;
    const newTileId = `tile-${snapshot.tilesLayoutMetaData.length}`;

    snapshot.tiles.set(
      newTileId,
      <TestTile
        key={newTileId}
        tileId={newTileId}
        onClick={() => {
          const score = snapshot.tilesLayoutMetaData.find(
            (t) => t.stableId === newTileId,
          )?.score;
          this.setScoreOfTile(newTileId, (score ?? 0) + 1);
        }}
      />,
    );

    snapshot.tilesLayoutMetaData.push({ stableId: newTileId, score: 0 });

    this.snapshot$.next({
      ...snapshot,
      // duplicate array to trigger react
      tilesLayoutMetaData: Array.from(snapshot.tilesLayoutMetaData),
    });
  }

  public setScoreOfTile(tileId: string, score: number): void {
    const snapshot = this.snapshot$.value;
    const tileMeta = snapshot.tilesLayoutMetaData.find(
      (t) => t.stableId === tileId,
    );
    if (tileMeta) {
      tileMeta.score = score;
      this.snapshot$.next({
        ...snapshot,
        // Duplicate Array to trigger react
        tilesLayoutMetaData: Array.from(snapshot.tilesLayoutMetaData),
      });
    }
  }
}

const meta = {
  title: "Grug/Container/LayoutContainer",
  render: (args: LayoutContainerStoryArgs) => {
    const vm = new MockViewModel(args);
    return (
      <>
        <div
          data-testid="add"
          onClick={() => vm.addTile()}
          style={{ width: 0, height: 0 }}
        />
        <LayoutContainerView vm={vm} />
      </>
    );
  },
  argTypes: {
    mode: { options: ["grid", "list"], control: { type: "inline-radio" } },
  },
} satisfies Meta<LayoutContainerStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    numberOfTiles: 4,
    mode: "grid",
  },
};

export const SpeakerMovesUp: Story = {
  args: {
    numberOfTiles: 2,
    mode: "grid",
  },
  play: async (inputs) => {
    const { userEvent } = inputs;
    await sleep(800);
    await userEvent.click(screen.getByText("tile-1"));
    await sleep(100);
    await userEvent.click(screen.getByTestId("add"));
    await sleep(100);
    await userEvent.click(screen.getByTestId("add"));
    await sleep(100);
    await userEvent.click(screen.getByTestId("add"));
    await sleep(100);
    await userEvent.click(screen.getByTestId("add"));
    await sleep(100);
    await userEvent.click(screen.getByTestId("add"));
    await sleep(100);
    await userEvent.click(screen.getByTestId("add"));
    await sleep(300);
    await userEvent.click(screen.getByText("tile-3"));
    await sleep(300);
    await userEvent.click(screen.getByText("tile-2"));
    await sleep(300);
    await userEvent.click(screen.getByText("tile-1"));
    await sleep(300);
    await userEvent.click(screen.getByText("tile-0"));
    await sleep(300);
    await userEvent.click(screen.getByText("tile-2"));
    await sleep(300);
    await userEvent.click(screen.getByText("tile-1"));
    await sleep(300);
    await userEvent.click(screen.getByText("tile-0"));
    await sleep(300);
    await userEvent.click(screen.getByText("tile-7"));
    await sleep(300);
    await userEvent.click(screen.getByText("tile-7"));
    await sleep(300);
    await userEvent.click(screen.getByText("tile-7"));
    await sleep(300);
    await userEvent.click(screen.getByText("tile-7"));
  },
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

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
