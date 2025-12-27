# app/domain/models.py
from dataclasses import dataclass
from typing import List

@dataclass
class Column:
    name: str
    data_type: str
    nullable: bool

@dataclass
class DatabaseObject:
    id: str
    name: str
    type: str  # table | view
    columns: List[Column]
