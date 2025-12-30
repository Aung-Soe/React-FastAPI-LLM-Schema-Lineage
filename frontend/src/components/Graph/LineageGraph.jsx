import { useMemo, useState } from "react";
import ReactFlow, { Background, Controls, MiniMap } from "reactflow";
import "reactflow/dist/style.css";

/* ---------- layout constants ---------- */

const HEX_RADIUS = 90;       // distance between hex centers
const VIEW_OFFSET_X = 600;  // push views to the right
const VIEW_RING_RADIUS = 300;

/* ---------- hex helpers ---------- */

// axial hex → pixel
function hexToPixel(q, r) {
  const x = HEX_RADIUS * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r);
  const y = HEX_RADIUS * (1.5 * r);
  return { x, y };
}

// generate hex spiral positions
function generateHexPositions(count) {
  const results = [];
  let q = 0;
  let r = 0;
  let layer = 1;

  results.push({ q: 0, r: 0 });

  while (results.length < count) {
    q = layer;
    r = -layer;

    const directions = [
      [-1, 1], [-1, 0], [0, -1],
      [1, -1], [1, 0], [0, 1],
    ];

    for (const [dq, dr] of directions) {
      for (let i = 0; i < layer; i++) {
        if (results.length >= count) break;
        results.push({ q, r });
        q += dq;
        r += dr;
      }
    }

    layer++;
  }

  return results;
}

/* ---------- coloring ---------- */

function nodeColor(type, dimmed) {
  if (dimmed) return "#e5e7eb";

  if (type === "table") return "#c7ddf8"; // light blue
  if (type === "view") return "#fde68a";  // light yellow

  return "#d1d5db";
}

/* ---------- component ---------- */

export default function LineageGraph({ lineage, onNodeSelect }) {
  const [focusedNodeId, setFocusedNodeId] = useState(null);

  /* ---------- base nodes ---------- */

  const baseNodes = useMemo(() => {
    if (!lineage?.nodes) return [];

    const tables = lineage.nodes.filter(n => n.type === "table");
    const views = lineage.nodes.filter(n => n.type === "view");

    /* ----- tables: hex cluster ----- */
    const hexPositions = generateHexPositions(tables.length);

    const tableNodes = tables.map((n, i) => {
      const { x, y } = hexToPixel(hexPositions[i].q, hexPositions[i].r);

      return {
        id: `table:${n.name}`,
        position: { x, y },
        data: {
          label: n.name,
          type: "table",
          original: n,
        },
        type: "default",
      };
    });

    /* ----- views: outer ring (right biased) ----- */
    const viewNodes = views.map((n, i) => {
      const angle = (2 * Math.PI * i) / views.length;
      const x = VIEW_OFFSET_X + Math.cos(angle) * VIEW_RING_RADIUS;
      const y = Math.sin(angle) * VIEW_RING_RADIUS;

      return {
        id: `view:${n.name}`,
        position: { x, y },
        data: {
          label: n.name,
          type: "view",
          original: n,
        },
        type: "default",
      };
    });

    return [...tableNodes, ...viewNodes];
  }, [lineage]);

  /* ---------- edges ---------- */

  const baseEdges = useMemo(() => {
    if (!lineage?.edges) return [];

    return lineage.edges
      .filter(
        e =>
          (e.source.type === "table" || e.source.type === "view") &&
          (e.target.type === "table" || e.target.type === "view")
      )
      .map((e, i) => ({
        id: `e-${i}`,
        source: `${e.source.type}:${e.source.name}`,
        target: `${e.target.type}:${e.target.name}`,
        style: {
          strokeDasharray: "4 4",
          strokeWidth: 2,
          stroke: i % 2 ? "#6366f1" : "#ec4899",
        },
      }));
  }, [lineage]);

  /* ---------- focus logic ---------- */

  const connectedNodeIds = useMemo(() => {
    if (!focusedNodeId) return new Set();

    const ids = new Set([focusedNodeId]);
    baseEdges.forEach(e => {
      if (e.source === focusedNodeId) ids.add(e.target);
      if (e.target === focusedNodeId) ids.add(e.source);
    });
    return ids;
  }, [focusedNodeId, baseEdges]);

  /* ---------- render nodes ---------- */

  const nodes = useMemo(() => {
    return baseNodes.map(node => {
      const dimmed =
        focusedNodeId && !connectedNodeIds.has(node.id);

      return {
        ...node,
        style: {
          background: nodeColor(node.data.type, dimmed),
          borderRadius: 10,
          padding: 12,
          fontWeight: 600,
          opacity: dimmed ? 0.3 : 1,
          border:
            node.id === focusedNodeId
              ? "3px solid #111827"
              : "1px solid #9ca3af",
          cursor: "pointer",
        },
      };
    });
  }, [baseNodes, focusedNodeId, connectedNodeIds]);

  /* ---------- render edges ---------- */

  const edges = useMemo(() => {
    return baseEdges.map(e => ({
      ...e,
      style: {
        ...e.style,
        opacity:
          focusedNodeId &&
          !(e.source === focusedNodeId || e.target === focusedNodeId)
            ? 0.2
            : 1,
      },
    }));
  }, [baseEdges, focusedNodeId]);

  /* ---------- events ---------- */

  function onNodeClick(_, node) {
    setFocusedNodeId(node.id);
    if (onNodeSelect) onNodeSelect(node.data.original);
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
        <Background gap={18} />
        <Controls />
        <MiniMap
          nodeColor={n =>
            n.data.type === "table" ? "#93c5fd" : "#fde68a"
          }
        />
      </ReactFlow>
    </div>
  );
}
