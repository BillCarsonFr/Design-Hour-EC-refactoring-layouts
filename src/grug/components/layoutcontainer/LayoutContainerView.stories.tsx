import { useEffect, useMemo, type CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  LayoutContainerView,
  type LayoutContainerSnapshot,
} from "./LayoutContainerView.tsx";
import { BehaviorSubject } from "rxjs";
import type { ViewModel } from "../../ec-viewmodel/ViewModel.ts";
import { expect, within } from "storybook/test";
import type { TileLayoutMetaData } from "./TileDataInterfaces.ts";

type LayoutContainerStoryArgs = {
  /**
   * The number of tiles to show in the LayoutContainer
   */
  numberOfTiles: number;
  mode: "grid" | "spotlight";
};

interface TestTileProps {
  tileId: string;
  onClick: () => void;
}

function TestTile({ tileId, onClick }: TestTileProps) {
  const style: CSSProperties = {
    flex: 1,
    backgroundColor: colorFromId(tileId),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
  };

  return (
    <div style={style} key={tileId}>
      <p
        onClick={onClick}
        style={{
          pointerEvents: "auto",
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
  { setNumberOfTiles: (amount: number, mode: "grid" | "spotlight") => void }
> {
  public constructor() {}

  private tiles: { score: number; id: string }[] = [];
  private mode: "grid" | "spotlight" = "grid";
  public snapshot$ = new BehaviorSubject<LayoutContainerSnapshot>({
    tilesLayoutMetaData: [],
    tiles: new Map(),
    mode: "grid",
  });

  private updateSnapshot(): void {
    const newTiles = new Map();
    const newTilesLayoutMetaData: TileLayoutMetaData[] = [];

    const sortedTiles = this.tiles.sort((a, b) => b.score - a.score);
    for (let i = 0; i < sortedTiles.length; i++) {
      const id = sortedTiles[i]?.id;
      const newOrOldTile = this.snapshot$.value.tiles.get(id) ?? (
        <TestTile
          tileId={id}
          onClick={() => {
            const score = this.tiles.find((t) => t.id === id)?.score;
            this.setScoreOfTile(id, (score ?? 0) + 1);
          }}
        />
      );
      newTiles.set(id, newOrOldTile);
      newTilesLayoutMetaData.push({ id });
    }

    const newSnapshot = {
      tilesLayoutMetaData: newTilesLayoutMetaData,
      tiles: newTiles,
      mode: this.mode,
    };
    console.log("update snapshot", newSnapshot);
    this.snapshot$.next(newSnapshot);
  }

  public setNumberOfTiles(amount: number): void {
    console.log("set number of tiles", amount);

    const prevTiles = Array.from(this.tiles);
    this.tiles = Array.from({ length: amount }, (_, i) => ({
      id: `tile ${i}`,
      score: prevTiles.find((t) => t.id === `tile ${i}`)?.score ?? 0,
    }));
    this.updateSnapshot();
  }
  public setMode(mode: "grid" | "spotlight"): void {
    this.mode = mode;
    this.updateSnapshot();
  }
  public addTile(): void {
    this.tiles.push({ id: `tile ${this.tiles.length}`, score: 0 });
    this.updateSnapshot();
  }
  public setScoreOfTile(tileId: string, score: number): void {
    this.tiles.find((t) => t.id === tileId)!.score = score;
    this.updateSnapshot();
  }
}

const meta = {
  title: "Grug/Container/LayoutContainer",
  render: (args: LayoutContainerStoryArgs) => {
    const vm = useMemo(() => new MockViewModel(), []);
    useEffect(() => {
      vm.setNumberOfTiles(args.numberOfTiles);
      vm.setMode(args.mode);
    }, [args, vm]);

    return (
      <div style={{ height: "100%" }}>
        <div
          data-testid="add"
          onClick={() => vm.addTile()}
          style={{ width: 0, height: 0 }}
        />
        <div
          data-testid="modeToggle"
          onClick={() =>
            vm.setMode(
              vm.snapshot$.value.mode === "grid" ? "spotlight" : "grid",
            )
          }
          style={{ width: 0, height: 0 }}
        />
        <LayoutContainerView vm={vm} />
      </div>
    );
  },
  argTypes: {
    mode: { options: ["grid", "spotlight"], control: { type: "inline-radio" } },
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

export const Spotlight: Story = {
  args: {
    numberOfTiles: 2,
    mode: "spotlight",
  },
};

export const SpeakerMovesUp: Story = {
  args: {
    numberOfTiles: 2,
    mode: "grid",
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText("tile 1")).toBeInTheDocument();
    await userEvent.click(await canvas.findByText("tile 1"));
    await userEvent.click(canvas.getByTestId("add"));
    await sleep(100);
    await userEvent.click(canvas.getByTestId("add"));
    await sleep(100);
    await userEvent.click(canvas.getByTestId("add"));
    await sleep(100);
    await userEvent.click(canvas.getByTestId("add"));
    await sleep(100);
    await userEvent.click(canvas.getByTestId("add"));
    await sleep(100);
    await userEvent.click(canvas.getByTestId("add"));
    await sleep(300);
    await userEvent.click(canvas.getByText("tile 3"));
    await sleep(300);
    await userEvent.click(canvas.getByText("tile 2"));
    await userEvent.click(canvas.getByTestId("modeToggle"));
    await sleep(300);
    await userEvent.click(canvas.getByText("tile 1"));
    await sleep(300);
    await userEvent.click(canvas.getByText("tile 0"));
    await sleep(300);
    await userEvent.click(canvas.getByText("tile 2"));
    await userEvent.click(canvas.getByTestId("modeToggle"));
    await sleep(300);
    await userEvent.click(canvas.getByText("tile 1"));
    await sleep(300);
    await userEvent.click(canvas.getByText("tile 0"));
    await sleep(300);
    await userEvent.click(canvas.getByText("tile 7"));
    await sleep(300);
    await userEvent.click(canvas.getByText("tile 7"));
    await sleep(300);
    await userEvent.click(canvas.getByText("tile 7"));
    await sleep(300);
    await userEvent.click(canvas.getByText("tile 7"));
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
