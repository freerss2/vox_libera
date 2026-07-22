#! /usr/bin/env python3
"""
Validate that course lessons definitions (in YAML) are matching application schema
"""

import os
import yaml
import argparse
from pathlib import Path
from typing import Dict, List, Optional, Literal
from pydantic import BaseModel, ConfigDict, ValidationError


def parse_arguments():
    """
    Parse command-line arguments.
    @return: parsed arguments
    """
    parser = argparse.ArgumentParser(description="Validate course lessons data in YAML format.")
    parser.add_argument('-d', '--course_dir', required=True, help="Directory containing course data.")
    return parser.parse_args()

# --- 1. Schema that fits lesson-XX.yaml

class Localized(BaseModel):
    model_config = ConfigDict(extra='allow')
    en: str
    ru: str

class StoryLine(BaseModel):
    model_config = ConfigDict(extra='allow')
    ar: str
    vocalized: Optional[str] = None
    transliteration: Optional[str] = None
    en: Optional[str] = None
    ru: Optional[str] = None

class Word(BaseModel):
    model_config = ConfigDict(extra='allow')
    ar: str
    en: str
    ru: str
    transliteration: Optional[str] = None
    vocalized: Optional[str] = None

class Sentence(Word):
    pass

class SortSet(BaseModel):
    id: str
    question1: Localized
    question2: Localized
    type: Literal['pairs', 'lists']
    data: List[List[str]]

class PairsSet(BaseModel):
    title: Localized
    words: List[str]

class LessonFile(BaseModel):
    model_config = ConfigDict(extra='forbid')
    id: str
    name: Localized
    explanations: Dict[str, str]
    story: Optional[Dict[str, List[StoryLine]]] = None
    words: List[Word] = []
    sentences: List[Sentence] = []
    sort_set: Optional[List[SortSet]] = None
    pairs_set: Optional[List[PairsSet]] = None

# --- 2. Line map builder ---

def build_line_map(node, path=(), mapping=None):
    if mapping is None:
        mapping = {}
    mapping[path] = node.start_mark.line + 1
    if isinstance(node, yaml.MappingNode):
        for k_node, v_node in node.value:
            child = path + (k_node.value,)
            mapping[child] = k_node.start_mark.line + 1
            build_line_map(v_node, child, mapping)
    elif isinstance(node, yaml.SequenceNode):
        for idx, item in enumerate(node.value):
            child = path + (idx,)
            mapping[child] = item.start_mark.line + 1
            build_line_map(item, child, mapping)
    return mapping

def validate_with_lines(path: str):
    text = Path(path).read_text(encoding='utf-8')

    # syntax error -> yaml already gives line
    try:
        root_node = yaml.compose(text)
        line_map = build_line_map(root_node)
    except yaml.YAMLError as e:
        return f"SYNTAX ERROR {path}: {e}"

    # schema error -> map pydantic loc to line_map
    try:
        data = yaml.safe_load(text)
        LessonFile(**data)
    except ValidationError as e:
        result = [f"\n❌ {Path(path).name} - {len(e.errors())} error(s):"]
        for err in e.errors():
            loc = err['loc']
            line = line_map.get(loc)
            # if field is missing, exact path not in map -> walk up
            if line is None:
                for i in range(len(loc), 0, -1):
                    if loc[:i] in line_map:
                        line = line_map[loc[:i]]
                        break
            loc_str = "".join(f"[{x}]" if isinstance(x,int) else f".{x}" for x in loc).lstrip(".")
            result.append(f" line {line}: {loc_str} -> {err['msg']}")
        return "\n".join(result)
    return ""

def main(args):
    dest_dir = os.path.join(args.course_dir, 'yaml')
    directory = Path(dest_dir)
    lesson_files = list(directory.glob("lesson-*.yaml"))
    for fp in sorted(lesson_files):
        res = validate_with_lines(fp)
        if res:
            print(res)
            return 1
        else:
            print(f"✅ {Path(fp).name} OK")
    return 0

if __name__ == "__main__":
    args = parse_arguments()
    rc = main(args)
    exit(rc)
