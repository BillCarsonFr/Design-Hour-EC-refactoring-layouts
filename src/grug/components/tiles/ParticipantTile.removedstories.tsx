import type { Meta, StoryObj } from "@storybook/react-vite";
import type { JSX } from "react";

import { ParticipantTile } from "./ParticipantTile.tsx";
import type { ParticipantTileSnapshot } from "./ParticipantTileViewModel.ts";
import { useMockedViewModel } from "../../viewmodel/useMockedViewModel.ts";

type ParticipantTileStoryArgs = {
  id: string;
  displayName: string;
  isSpeaking: boolean;
  isMuted: boolean;
};

function ParticipantTileStoryRender(
  args: ParticipantTileStoryArgs,
): JSX.Element {
  const snapshot: ParticipantTileSnapshot = {
    displayName: args.displayName,
    isMuted: args.isMuted,
    isSpeaking: args.isSpeaking,
    isVideoEnabled: false,
    tileId: args.id,
  };

  const vm = useMockedViewModel(snapshot, undefined);
  return <ParticipantTile vm={vm} />;
}

const meta = {
  title: "Grug/Tiles/ParticipantTile",
  render: (args: ParticipantTileStoryArgs) => (
    <div style={{ display: "flex", width: "300px", height: "210px" }}>
      <ParticipantTileStoryRender {...args} />
    </div>
  ),
  argTypes: {
    id: { control: "text" },
    displayName: { control: "color" },
  },
} satisfies Meta<ParticipantTileStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: "@alice:me.org",
    displayName: "Alice",
    isSpeaking: false,
    isMuted: false,
  },
};

export const Speaking: Story = {
  args: {
    id: "@alice:me.org",
    displayName: "Alice",
    isSpeaking: true,
    isMuted: false,
  },
};
