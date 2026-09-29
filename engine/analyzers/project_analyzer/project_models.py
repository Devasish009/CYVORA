from enum import Enum
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class FileCategory(str, Enum):
    SOURCE = "SOURCE"
    CONFIG = "CONFIG"
    TEST = "TEST"
    DOCUMENTATION = "DOCUMENTATION"
    ASSET = "ASSET"
    OTHER = "OTHER"

class FileItem(BaseModel):
    relative_path: str
    absolute_path: str
    filename: str
    extension: str
    category: FileCategory
    size_bytes: int

class ProjectInventory(BaseModel):
    project_path: str
    total_files: int = 0
    total_directories: int = 0
    ignored_paths_count: int = 0
    files: List[FileItem] = Field(default_factory=list)
    directories: List[str] = Field(default_factory=list)
    languages: List[str] = Field(default_factory=list)
    frameworks: List[str] = Field(default_factory=list)
    entry_points: List[str] = Field(default_factory=list)
    config_files: List[str] = Field(default_factory=list)
    test_files: List[str] = Field(default_factory=list)
    doc_files: List[str] = Field(default_factory=list)
