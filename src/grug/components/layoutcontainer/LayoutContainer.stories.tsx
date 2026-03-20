import type {JSX} from "react";
import {useMockedViewModel} from "../../viewmodel/useMockedViewModel.ts";
import {PlainTile} from "../tiles/PlainTile.tsx";
import type {Meta, StoryObj} from "@storybook/react-vite";
import type {LayoutContainerActions, LayoutContainerSnapshot} from "./LayoutContainerViewModel.ts";
import {LayoutContainer} from "./LayoutContainer.tsx";
import {PlainTileViewModel} from "../tiles/PlainTileViewModel.ts";


type LayoutContainerStoryArgs = {
    numberOfTiles: number;
    preferredWidth: number;
    preferredHeight: number;
};


function LayoutContainerStoryRender(args: LayoutContainerStoryArgs): JSX.Element {
    const snapshot: LayoutContainerSnapshot = {
        childLayoutData: [
            {uniqueId: "0", x: 0, y: 0, width: args.preferredWidth, height: args.preferredHeight},
            {uniqueId: "1", x: args.preferredWidth + 16, y: 0, width: args.preferredWidth, height: args.preferredHeight},
            {uniqueId: "2", x: (args.preferredWidth + 16) * 2, y: 0, width: args.preferredWidth, height: args.preferredHeight},
            {uniqueId: "3", x: 0, y: args.preferredHeight + 16 , width: args.preferredWidth, height: args.preferredHeight},
            {uniqueId: "4", x: args.preferredWidth + 16, y: args.preferredHeight + 16, width: args.preferredWidth, height: args.preferredHeight},
            {uniqueId: "5", x: (args.preferredWidth + 16) * 2, y: args.preferredHeight + 16, width: args.preferredWidth, height: args.preferredHeight},
        ], contentHeight: (args.preferredHeight + 16) * 2,
    };

    const actions: LayoutContainerActions = {
        setContainerSize: (width: number, height: number) => {
        },
    }
    const vm = useMockedViewModel(snapshot, actions);
    return <LayoutContainer vm={vm} TileComponent={PlainTile} getTileProps={() => {
        return {vm: new PlainTileViewModel()};
    }}/>;
}

const meta = {
    title: 'Grug/Container/LayoutContainer',
    render: (args: LayoutContainerStoryArgs) => (
        <div style={{display: "flex"}}>
            <LayoutContainerStoryRender {...args} />
        </div>
    ),
    argTypes: {
        numberOfTiles: {control: 'number'},
        preferredWidth: {control: 'number'},
        preferredHeight: {control: 'number'},
    },
} satisfies Meta<LayoutContainerStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        numberOfTiles: 8,
        preferredWidth: 200,
        preferredHeight: 140
    }
};
