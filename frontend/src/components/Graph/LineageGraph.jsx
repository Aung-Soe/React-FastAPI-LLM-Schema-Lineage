import { useMemo, useState, useEffect } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";

/* ---------- layout constants ---------- */

const HEX_RADIUS = 90;
const VIEW_OFFSET_X = 600;
const VIEW_RING_RADIUS = 320;

/* ---------- hex helpers ---------- */

function hexToPixel(q, r) {
  return {
    x: HEX_RADIUS * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r),
    y: HEX_RADIUS * (1.5 * r),
  };
}

function generateHexPositions(count) {
  const results = [{ q: 0, r: 0 }];
  let layer = 1;

  while (results.length < count) {
    let q = layer;
    let r = -layer;

    const dirs = [
      [-1, 1], [-1, 0], [0, -1],
      [1, -1], [1, 0], [0, 1],
    ];

    for (const [dq, dr] of dirs) {
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

/* ---------- colors ---------- */

function nodeColor(type, dimmed) {
  if (dimmed) return "#e5e7eb";
  if (type === "table") return "#c7ddf8";
  if (type === "view") return "#fde68a";
  return "#d1d5db";
}

/* ---------- component ---------- */

export default function LineageGraph({ lineage, onNodeSelect }) {
  const [focusedNodeId, setFocusedNodeId] = useState(null);
  const { fitView, setCenter } = useReactFlow();

  /* ---------- base nodes ---------- */

  const baseNodes = useMemo(() => {
    const tables = lineage.nodes.filter(n => n.type === "table");
    const views = lineage.nodes.filter(n => n.type === "view");

    const hex = generateHexPositions(tables.length);

    const tableNodes = tables.map((n, i) => {
      const { x, y } = hexToPixel(hex[i].q, hex[i].r);
      return {
        id: `table:${n.name}`,
        position: { x, y },
        data: { label: n.name, type: "table", original: n },
      };
    });

    const viewNodes = views.map((n, i) => {
      const angle = (2 * Math.PI * i) / views.length;
      return {
        id: `view:${n.name}`,
        position: {
          x: VIEW_OFFSET_X + Math.cos(angle) * VIEW_RING_RADIUS,
          y: Math.sin(angle) * VIEW_RING_RADIUS,
        },
        data: { label: n.name, type: "view", original: n },
      };
    });

    return [...tableNodes, ...viewNodes];
  }, [lineage]);

  /* ---------- edges ---------- */

  const edges = useMemo(() => {
    return lineage.edges.map((e, i) => ({
      id: `e-${i}`,
      source: `${e.source.type}:${e.source.name}`,
      target: `${e.target.type}:${e.target.name}`,
      style: {
        strokeDasharray: "4 4",
        strokeWidth: 2,
        stroke: "#6366f1",
      },
    }));
  }, [lineage]);

  /* ---------- connected nodes ---------- */

  const connectedNodeIds = useMemo(() => {
    if (!focusedNodeId) return new Set();

    const ids = new Set([focusedNodeId]);
    edges.forEach(e => {
      if (e.source === focusedNodeId) ids.add(e.target);
      if (e.target === focusedNodeId) ids.add(e.source);
    });
    return ids;
  }, [focusedNodeId, edges]);

  /* ---------- styled nodes ---------- */

  const nodes = useMemo(() => {
    return baseNodes.map(node => {
      const dimmed =
        focusedNodeId && !connectedNodeIds.has(node.id);

      const focused = node.id === focusedNodeId;

      return {
        ...node,
        style: {
          background: nodeColor(node.data.type, dimmed),
          borderRadius: 10,
          padding: 12,
          fontWeight: 600,
          opacity: dimmed ? 0.25 : 1,
          border: focused
            ? "2px solid #2563eb"
            : "1px solid #9ca3af",
          boxShadow: focused
            ? "0 0 14px rgba(37,99,235,0.6)"
            : "none",
          cursor: "pointer",
        },
      };
    });
  }, [baseNodes, focusedNodeId, connectedNodeIds]);

  /* ---------- zoom-to-node ---------- */

  useEffect(() => {
    if (!focusedNodeId) return;

    const node = nodes.find(n => n.id === focusedNodeId);
    if (node) {
      setCenter(node.position.x, node.position.y, {
        zoom: 1.4,
        duration: 600,
      });
    }
  }, [focusedNodeId, nodes, setCenter]);

  /* ---------- events ---------- */

  function onNodeClick(_, node) {
    setFocusedNodeId(node.id);
    onNodeSelect?.(node.data.original);
  }

  function onPaneClick() {
    setFocusedNodeId(null);
    onNodeSelect?.(null);
    fitView({ padding: 0.2, duration: 400 });
    onCanvasClick?.();
  }

  /* ---------- render ---------- */

  return (
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
  );
}