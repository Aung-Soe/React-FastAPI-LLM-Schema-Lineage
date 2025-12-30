# app/services/lineage_builder.py

from typing import Set, Tuple
import sqlglot
from sqlglot.expressions import Table, Column


class LineageBuilder:
    def __init__(self, view_name: str, view_sql: str):
        self.view_name = view_name
        self.ast = sqlglot.parse_one(view_sql)

    # ---------- OBJECT DEPENDENCIES ----------

    def extract_object_dependencies(self) -> Set[str]:
        """
        Returns names of tables OR views referenced by this view
        """
        deps = set()

        for table in self.ast.find_all(Table):
            if table.name and table.name != self.view_name:
                deps.add(table.name)

        return deps

    # ---------- COLUMN DEPENDENCIES ----------

    def extract_column_dependencies(self) -> Set[Tuple[str, str]]:
        """
        Returns (source_column, target_column)
        """
        deps = set()

        for col in self.ast.find_all(Column):
            if not col.table:
                continue

            source = f"{col.table}.{col.name}"
            target = f"{self.view_name}.{col.alias_or_name}"

            deps.add((source, target))

        return deps