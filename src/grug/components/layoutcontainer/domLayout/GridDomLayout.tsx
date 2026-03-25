import { useLayoutEffect, useRef } from "react";
import type { TileLayoutMetaData } from "../TileDataInterfaces.ts";
import type { LayoutData } from "../LayoutContainerView.tsx";

export interface DomLayoutProps {
  tilesLayoutMetaData: TileLayoutMetaData[];
  onLayoutChange: (data: LayoutData) => void;
}

export function GridDomLayout({
  tilesLayoutMetaData,
  onLayoutChange,
}: DomLayoutProps) {
  const layoutObserverContainerRef = useTileLayoutPositionObserver(
    onLayoutChange,
    tilesLayoutMetaData,
  );

  return (
    <div
      ref={layoutObserverContainerRef}
      style={{
        position: "absolute",
        width: "100%",
        display: "grid",
        gap: "10px",
        gridTemplateColumns: "auto auto auto auto",
        padding: "10px",
      }}
    >
      {tilesLayoutMetaData
        .sort((a, b) => b.score - a.score)
        .map((metaData) => (
          <div
            key={metaData.id}
            id={metaData.id}
            style={{ aspectRatio: 4 / 3 }}
          ></div>
        ))}
    </div>
  );
}

function useTileLayoutPositionObserver(
  onLayoutChange: (data: LayoutData) => void,
  tilesLayoutMetaData: TileLayoutMetaData[],
): React.RefObject<HTMLDivElement | null> {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const allChildren: Element[] = [];
    function addChildrenRecursive(el: Element) {
      if (
        el.nodeType === Node.ELEMENT_NODE &&
        // check if the element is actually one of the tiles we want to display
        tilesLayoutMetaData.find((meta) => meta.id === el.getAttribute("id"))
      ) {
        allChildren.push(el);
      }
      for (const child of el.children) {
        addChildrenRecursive(child);
      }
    }
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    addChildrenRecursive(containerRef.current);

    const pos = allChildren.flatMap((c) => {
      const id = c.getAttribute("id");
      if (!id) return [];
      const position = {
        x: c.getBoundingClientRect().left - containerRect.left,
        y: c.getBoundingClientRect().top - containerRect.top,
      };
      const size = {
        width: c.getBoundingClientRect().width,
        height: c.getBoundingClientRect().height,
      };
      const zIndex = parseInt(c.getAttribute("zIndex") ?? "0");
      return [{ id, zIndex, fixed: false, ...position, ...size }];
    });
    const conversion = pos.map(
      (p) =>
        `metadata: ${JSON.stringify(tilesLayoutMetaData.find((meta) => meta.id === p.id))} ---> position: ${JSON.stringify(p)}`,
    );
    console.log("useLayoutEffect result:", conversion.join("\n"));
    onLayoutChange({
      tilesPositionData: pos,
    });
  }, [
    onLayoutChange,
    // we have to add tilesLayoutMetaData to the dependencies to update the layout on each metadata change
    tilesLayoutMetaData,
  ]);

  return containerRef;
}
