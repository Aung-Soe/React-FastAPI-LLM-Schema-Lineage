import { useEffect, useMemo, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
} from "reactflow";
import "reactflow/dist/style.css";

const MAX_PER_COLUMN = 5;
const COLUMN_WIDTH = 260;
const ROW_HEIGHT = 90;

/* ---------- helpers ---------- */

function buildGridLayout(nodes) {
  return nodes.map((node, index) => {
    const column = Math.floor(index / MAX_PER_COLUMN);
    const row = index % MAX_PER_COLUMN;

    return {
      ...node,
      position: {
        x: column * COLUMN_WIDTH,
        y: row * ROW_HEIGHT,
      },
    };
  });
}

function nodeColor(type, dimmed) {
  if (dimmed) return "#e5e7eb"; // gray

  if (type === "table") return "#95b9eeff"; // blue
  if (type === "view") return "#cf816aff"; // yellow

  return "#9ca3af";
}

/* ---------- component ---------- */

export default function LineageGraph({ lineage }) {
  const [focusedNodeId, setFocusedNodeId] = useState(null);

  /* ---------- base nodes ---------- */

  const baseNodes = useMemo(() => {
    if (!lineage?.nodes) return [];

    const tableViewNodes = lineage.nodes.filter(
      (n) => n.type === "table" || n.type === "view"
    );

    return buildGridLayout(
      tableViewNodes.map((n) => ({
        id: `${n.type}:${n.name}`,
        data: { label: n.name, type: n.type },
        type: "default",
      }))
    );
  }, [lineage]);

  /* ---------- base edges ---------- */

  const baseEdges = useMemo(() => {
    if (!lineage?.edges) return [];

    return lineage.edges
      .filter(
        (e) =>
          (e.source.type === "table" || e.source.type === "view") &&
          (e.target.type === "table" || e.target.type === "view")
      )
      .map((e, idx) => ({
        id: `e-${idx}`,
        source: `${e.source.type}:${e.source.name}`,
        target: `${e.target.type}:${e.target.name}`,
        animated: false,
        style: {
          strokeDasharray: "5 5",
          strokeWidth: 2,
          stroke: idx % 2 === 0 ? "#6366f1" : "#ec4899", // colorful
        },
      }));
  }, [lineage]);

  /* ---------- focus logic ---------- */

  const connectedNodeIds = useMemo(() => {
    if (!focusedNodeId) return new Set();

    const ids = new Set([focusedNodeId]);

    baseEdges.forEach((e) => {
      if (e.source === focusedNodeId) ids.add(e.target);
      if (e.target === focusedNodeId) ids.add(e.source);
    });

    return ids;
  }, [focusedNodeId, baseEdges]);

  /* ---------- render nodes ---------- */

  const nodes = useMemo(() => {
    return baseNodes.map((node) => {
      const isDimmed =
        focusedNodeId && !connectedNodeIds.has(node.id);

      return {
        ...node,
        style: {
          background: nodeColor(node.data.type, isDimmed),
          color: "#111827",
          borderRadius: 8,
          padding: 10,
          border:
            node.id === focusedNodeId
              ? "3px solid #111827"
              : "1px solid #9ca3af",
          opacity: isDimmed ? 0.3 : 1,
          cursor: "pointer",
          fontWeight: 600,
        },
      };
    });
  }, [baseNodes, focusedNodeId, connectedNodeIds]);

  /* ---------- render edges ---------- */

  const edges = useMemo(() => {
    return baseEdges.map((edge) => {
      const isDimmed =
        focusedNodeId &&
        !(
          edge.source === focusedNodeId ||
          edge.target === focusedNodeId
        );

      return {
        ...edge,
        style: {
          ...edge.style,
          opacity: isDimmed ? 0.2 : 1,
        },
      };
    });
  }, [baseEdges, focusedNodeId]);

  /* ---------- events ---------- */

  function onNodeClick(_, node) {
    setFocusedNodeId(node.id);
  }

  function onPaneClick() {
    setFocusedNodeId(null);
  }

  /* ---------- render ---------- */

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
      >
        <Background gap={16} />
        <Controls />
        <MiniMap
          nodeColor={(n) =>
            n.data.type === "table" ? "#3b82f6" : "#facc15"
          }
        />
      </ReactFlow>
    </div>
  );
}
