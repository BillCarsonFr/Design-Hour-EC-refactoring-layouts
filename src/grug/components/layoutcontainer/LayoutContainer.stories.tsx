import {type JSX, useCallback, useEffect, useMemo, useRef} from "react";
import {PlainTile} from "../tiles/PlainTile.tsx";
import type {Meta, StoryObj} from "@storybook/react-vite";
import {LayoutContainerViewModel} from "./LayoutContainerViewModel.ts";
import {LayoutContainer} from "./LayoutContainer.tsx";
import {PlainTileViewModel} from "../tiles/PlainTileViewModel.ts";
import type {TileProvider} from "../../model/TileProvider.ts";
import type {TileMetaData} from "../../layout/LayoutEngine.ts";


type LayoutContainerStoryArgs = {
    numberOfTiles: number;
    preferredWidth: number;
    preferredHeight: number;
};


function LayoutContainerStoryRender(args: LayoutContainerStoryArgs): JSX.Element {

    const vm = useMemo(() => {
        const mockTileProvider : TileProvider = {
            getTiles(): TileMetaData[] {
                return Array.from({length: args.numberOfTiles}, (_, i) => ({
                    stableId: i.toString(),
                    isHero: false,
                    score: 0
                }));
            },
        }

        return new LayoutContainerViewModel({
            mode: "grid",
            tileProvider: mockTileProvider,
        });
    }, [args.numberOfTiles])


    const tileVmsRef = useRef<Map<string, PlainTileViewModel>>(new Map());

    const getTileProps = useCallback((layoutData: { uniqueId: string }) => {
        let tileVm = tileVmsRef.current.get(layoutData.uniqueId);
        if (!tileVm) {
            tileVm = new PlainTileViewModel({tileId: layoutData.uniqueId});
            tileVmsRef.current.set(layoutData.uniqueId, tileVm);
        }
        return {vm: tileVm};
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

    return <LayoutContainer vm={vm} TileComponent={PlainTile} getTileProps={getTileProps}/>;
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
