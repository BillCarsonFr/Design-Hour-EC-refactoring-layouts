import type { Meta, StoryObj } from '@storybook/react-vite';

import { PlainTile } from "./PlainTile.tsx";
import { PlainTileViewModel } from "./PlainTileViewModel.ts";

const meta: Meta<typeof PlainTile> = {
    title: 'Grug/Tiles/PlainTile',
    component: PlainTile,
};

export default meta;
type Story = StoryObj<typeof PlainTile>;

export const Default: Story = {
    args: {
        vm: new PlainTileViewModel(),
    }
};
