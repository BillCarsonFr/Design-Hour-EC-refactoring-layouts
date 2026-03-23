import type { Meta, StoryObj } from "@storybook/react-vite";
import type { JSX } from "react";

import { PlainTile } from "./PlainTile.tsx";
import type { PlainTileSnapshot } from "./PlainTileViewModel.ts";
import { useMockedViewModel } from "../../viewmodel/useMockedViewModel.ts";

type PlainTileStoryArgs = {
  tileId: string;
  backgroundColor: string;
};

function PlainTileStoryRender(args: PlainTileStoryArgs): JSX.Element {
  const snapshot: PlainTileSnapshot = {
    tileId: args.tileId,
    backgroundColor: args.backgroundColor,
  };

  const vm = useMockedViewModel(snapshot, undefined);
  return <PlainTile vm={vm} />;
}

const meta = {
  title: "Grug/Tiles/PlainTile",
  render: (args: PlainTileStoryArgs) => (
    <div style={{ display: "flex", width: "200px", height: "140px" }}>
      <PlainTileStoryRender {...args} />
    </div>
  ),
  argTypes: {
    tileId: { control: "text" },
    backgroundColor: { control: "color" },
  },
} satisfies Meta<PlainTileStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    tileId: "0",
    backgroundColor: "orange",
  },
};
