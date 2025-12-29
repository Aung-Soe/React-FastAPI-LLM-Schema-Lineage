export function transformLineageToGraph(lineage) {
  const nodes = [];
  const edges = [];

  const nodeMap = new Map();

  // 1️⃣ Tables & views only
  lineage.nodes
    .filter(n => n.type === "table" || n.type === "view")
    .forEach((n) => {
      const id = `${n.type}:${n.name}`;
      nodeMap.set(id, n);

      nodes.push({
        id,
        type: "tableNode",
        data: {
          label: n.name,
          nodeType: n.type
        },
        position: { x: 0, y: 0 } // layout later
      });
    });

  // 2️⃣ Edges only between tables/views
  lineage.edges.forEach((e) => {
    const sourceId = `${e.source.type}:${e.source.name}`;
    const targetId = `${e.target.type}:${e.target.name}`;

    if (nodeMap.has(sourceId) && nodeMap.has(targetId)) {
      edges.push({
        id: `${sourceId}->${targetId}`,
        source: sourceId,
        target: targetId,
        type: "smoothstep",
        animated: false,
        style: {
          strokeDasharray: "4 4"
        }
      });
    }
  });

  return { nodes, edges };
}
