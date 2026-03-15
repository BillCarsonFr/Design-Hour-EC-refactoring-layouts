import type {Meta, StoryObj} from '@storybook/react-vite';
import type {JSX} from "react";

import { PlainTile} from "./PlainTile.tsx";
import type {PlainTileSnapshot} from "./PlainTileViewModel.ts";
import {useMockedViewModel} from "../../viewmodel/useMockedViewModel.ts";

type PlainTileStoryArgs = {
    tileId: string;
    backgroundColor: string;
    x: number;
    y: number;
    width: number;
    height: number;
};

function PlainTileStoryRender(args: PlainTileStoryArgs): JSX.Element {
    const snapshot: PlainTileSnapshot = {
        tileId: args.tileId,
        backgroundColor: args.backgroundColor,
        layoutData: {
            uniqueId: args.tileId,
            x: args.x,
            y: args.y,
            width: args.width,
            height: args.height,
        },
    };

    const vm = useMockedViewModel(snapshot);
    return <PlainTile vm={vm} />;
}

const meta = {
    title: 'Grug/Tiles/PlainTile',
    render: (args) => <PlainTileStoryRender {...args} />,
    argTypes: {
        tileId: {control: 'text'},
        backgroundColor: {control: 'color'},
        x: {control: {type: 'number'}},
        y: {control: {type: 'number'}},
        width: {control: {type: 'number'}},
        height: {control: {type: 'number'}},
    },
} satisfies Meta<PlainTileStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        tileId: '0',
        backgroundColor: 'orange',
        uniqueId: 'tile-id',
        x: 16,
        y: 16,
        width: 200,
        height: 140,
    }
};
