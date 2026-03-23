import {
  type CSSProperties,
  type JSX,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  type LayoutContainerActions,
  type LayoutContainerSnapshot,
} from "./LayoutContainerViewModel.ts";
import { LayoutContainer } from "./LayoutContainer.tsx";
import { useViewModel, type ViewModel } from "../../viewmodel/ViewModel.ts";
import { BaseViewModel } from "../../viewmodel/BaseViewModel.ts";
import { useMockedViewModel } from "../../viewmodel/useMockedViewModel.ts";
import { DEFAULT_LAYOUT_CONFIG } from "../../layout/LayoutEngine.ts";

type LayoutContainerStoryArgs = {
  numberOfTiles: number;
  preferredWidth: number;
  preferredRatio: number;
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
  const mockViewModel = useMockedViewModel<
    LayoutContainerSnapshot,
    LayoutContainerActions
  >(
    {
      tiles: Array.from({ length: args.numberOfTiles }, (_, i) => ({
        stableId: i.toString(),
        isHero: false,
        score: 0,
      })),
      mode: "grid",
    },
    {
      setLayoutMode: (mode) => console.log("setLayoutMode", mode),
    },
  );

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

  const config = useMemo(
    () => ({
      ...DEFAULT_LAYOUT_CONFIG,
      preferredTileWidth: args.preferredWidth,
      preferredRatio: args.preferredRatio,
    }),
    [args.preferredWidth, args.preferredRatio],
  );

  return (
    <LayoutContainer
      vm={mockViewModel}
      config={config}
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
    preferredRatio: { control: "number" },
  },
} satisfies Meta<LayoutContainerStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    numberOfTiles: 8,
    preferredWidth: 300,
    preferredRatio: 4 / 3,
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
