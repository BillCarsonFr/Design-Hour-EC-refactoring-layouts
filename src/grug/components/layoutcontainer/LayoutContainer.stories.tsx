import {
  type CSSProperties,
  type JSX,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { LayoutContainerViewModel } from "./LayoutContainerViewModel.ts";
import { LayoutContainer } from "./LayoutContainer.tsx";
import type { TileProvider } from "../../model/TileProvider.ts";
import { of } from "rxjs";
import { useViewModel, type ViewModel } from "../../viewmodel/ViewModel.ts";
import { BaseViewModel } from "../../viewmodel/BaseViewModel.ts";

type LayoutContainerStoryArgs = {
  numberOfTiles: number;
  preferredWidth: number;
  preferredHeight: number;
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

type TestTileViewProps = { vm: ViewModel<TestTileSnapshot> };

function TestTile({ vm }: TestTileViewProps) {
  const snapshot = useViewModel(vm);

  const style: CSSProperties = {
    flex: 1,
    backgroundColor: snapshot.backgroundColor,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
  };

  return (
    <div style={style}>
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
    </div>
  );
}

function LayoutContainerStoryRender(
  args: LayoutContainerStoryArgs,
): JSX.Element {
  const vm = useMemo(() => {
    const mockTileProvider: TileProvider = {
      tiles$: of(
        Array.from({ length: args.numberOfTiles }, (_, i) => ({
          stableId: i.toString(),
          isHero: false,
          score: 0,
        })),
      ),
    };

    return new LayoutContainerViewModel({
      mode: "grid",
      tileProvider: mockTileProvider,
    });
  }, [args.numberOfTiles]);

  const tileVmsRef = useRef<Map<string, TestTileViewModel>>(new Map());

  const getTileProps = useCallback((id: string) => {
    let tileVm = tileVmsRef.current.get(id);
    if (!tileVm) {
      tileVm = new TestTileViewModel({ tileId: id });
      tileVmsRef.current.set(id, tileVm);
    }
    return { vm: tileVm };
  }, []);

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
    <LayoutContainer
      vm={vm}
      TileComponent={TestTile}
      getTileProps={getTileProps}
    />
  );
}

const meta = {
  title: "Grug/Container/LayoutContainer",
  render: (args: LayoutContainerStoryArgs) => (
    <div style={{ display: "flex" }}>
      <LayoutContainerStoryRender {...args} />
    </div>
  ),
  argTypes: {
    numberOfTiles: { control: "number" },
    preferredWidth: { control: "number" },
    preferredHeight: { control: "number" },
  },
} satisfies Meta<LayoutContainerStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    numberOfTiles: 8,
    preferredWidth: 200,
    preferredHeight: 140,
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
