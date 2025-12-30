CREATE TABLE schema_scans (
    id UUID PRIMARY KEY,
    started_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    status TEXT NOT NULL,         -- running | completed | failed
    object_count INT,
    version TEXT, 
    notes TEXT
);

CREATE TABLE lineage_nodes (
    id UUID PRIMARY KEY,
    scan_id UUID NOT NULL REFERENCES schema_scans(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,            -- table | view | column
    metadata JSONB,
    version TEXT NOT NULL DEFAULT 'latest',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (scan_id, name, type)
);

CREATE TABLE lineage_edges (
    id UUID PRIMARY KEY,
    scan_id UUID NOT NULL REFERENCES schema_scans(id) ON DELETE CASCADE,
    source_node_id UUID NOT NULL REFERENCES lineage_nodes(id),
    target_node_id UUID NOT NULL REFERENCES lineage_nodes(id),
    relation TEXT NOT NULL,         -- depends_on | derives_from
    version TEXT NOT NULL DEFAULT 'latest',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    metadata JSONB
);

CREATE INDEX idx_nodes_version ON lineage_nodes(version);
CREATE INDEX idx_edges_version ON lineage_edges(version);
CREATE INDEX idx_edges_source ON lineage_edges(source_node_id);
CREATE INDEX idx_edges_target ON lineage_edges(target_node_id);
