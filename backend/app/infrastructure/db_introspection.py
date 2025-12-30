from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine
from app.infrastructure.db import get_engine
from typing import List, Dict


class PostgresIntrospector:
    def __init__(self, engine: Engine | None = None):
        self.engine = engine or get_engine()

    def _query(self, sql: str, params: dict | None = None) -> List[Dict]:
        with self.engine.connect() as conn:
            result = conn.execute(text(sql), params or {})
            return [dict(row._mapping) for row in result]
    
    def list_tables(self, schema: str = "public") -> List[Dict]:
        sql = """
        SELECT
            table_schema,
            table_name
        FROM information_schema.tables
        WHERE table_type = 'BASE TABLE'
          AND table_schema = :schema
        ORDER BY table_name;
        """
        return self._query(sql, {"schema": schema})
    
    def list_views(self, schema: str = "public") -> List[Dict]:
        sql = """
        SELECT
            schemaname AS table_schema,
            viewname AS table_name,
            pg_get_viewdef(
                format('%I.%I', schemaname, viewname)::regclass,
                true
            ) AS definition
        FROM pg_views
        WHERE schemaname = :schema
        ORDER BY viewname;
        """
        return self._query(sql, {"schema": schema})
    
    def list_columns(
        self,
        object_name: str,
        schema: str = "public"
        ) -> List[Dict]:
        """
        Returns columns with data types for BOTH tables and views.
        """

        sql = """
        SELECT
            a.attname AS column_name,
            pg_catalog.format_type(a.atttypid, a.atttypmod) AS data_type,
            NOT a.attnotnull AS is_nullable,
            a.attnum AS ordinal_position
        FROM pg_attribute a
        JOIN pg_class c ON a.attrelid = c.oid
        JOIN pg_namespace n ON c.relnamespace = n.oid
        WHERE
            c.relname = :object_name
            AND n.nspname = :schema
            AND a.attnum > 0
            AND NOT a.attisdropped
        ORDER BY a.attnum;
        """

        return self._query(sql, {
            "object_name": object_name,
            "schema": schema,
        })
    
    def get_object_metadata(
        self,
        object_name: str,
        schema: str = "public"
        ) -> Dict:
        tables = self.list_tables(schema)
        views = self.list_views(schema)

        table_names = {t["table_name"] for t in tables}
        view_map = {v["table_name"]: v for v in views}

        if object_name in table_names:
            return {
                "type": "table",
                "schema": schema,
                "name": object_name,
                "columns": self.list_columns(object_name, schema),
            }

        if object_name in view_map:
            return {
                "type": "view",
                "schema": schema,
                "name": object_name,
                "columns": self.list_columns(object_name, schema),
                "definition": view_map[object_name]["definition"],
            }

        raise ValueError(f"Object not found: {schema}.{object_name}")



