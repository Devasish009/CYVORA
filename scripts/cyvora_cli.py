#!/usr/bin/env python3
"""
CYVORA Phase 3 CLI — Project Intelligence Command Tool
Performs real scanning, language detection, framework detection, dependency analysis, AST code structure analysis, project mapping, and search indexing.
"""

import sys
import os
import asyncio
import argparse

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from engine.core.orchestrator import engine_orchestrator
from engine.analyzers.project_analyzer import (
    project_scanner,
    language_detector,
    framework_detector,
    entry_point_detector,
    ProjectInventory
)
from engine.analyzers.dependency_analyzer import dependency_analyzer
from engine.analyzers.code_analyzer import code_analyzer, CodeAnalysisResult
from engine.context.project_map import project_map_builder
from engine.context.dependency_graph import dependency_graph_builder
from engine.context.code_search import code_search_engine
from security import FilesystemPolicy, security_policy, AgentPermission, agent_permission_manager

async def run_project_intelligence_cli(project_path: str):
    abs_path = os.path.abspath(project_path)
    if not os.path.exists(abs_path):
        print(f"Error: Path '{abs_path}' does not exist.")
        sys.exit(1)

    print("CYVORA\n")
    print("Creating session...")
    print("Security initialized...\n")

    # Initialize security policies
    fs_policy = FilesystemPolicy(project_root=abs_path)
    security_policy.set_filesystem_policy(fs_policy)

    agent_id = "project_scanner_agent"
    agent_permission_manager.grant_permissions(agent_id, {
        AgentPermission.PROJECT_READ,
        AgentPermission.PROJECT_WRITE,
        AgentPermission.PROJECT_EXECUTE
    })

    session_id = "cli_session_intelligence"

    print("[1/8] Scanning project...")
    inventory: ProjectInventory = project_scanner.scan(abs_path, session_id=session_id)

    print("[2/8] Detecting languages...")
    inventory.languages = language_detector.detect_languages(inventory)

    print("[3/8] Detecting frameworks...")
    inventory.frameworks = framework_detector.detect_frameworks(inventory)

    print("[4/8] Analyzing dependencies...")
    deps_data = dependency_analyzer.analyze_dependencies(inventory)

    print("[5/8] Analyzing code structure...")
    code_analyses = []
    for item in inventory.files:
        if item.category.value == "SOURCE":
            an = code_analyzer.analyze_file(item.relative_path, item.absolute_path)
            code_analyses.append(an)

    print("[6/8] Building project map...")
    proj_map = project_map_builder.build_map(inventory)

    print("[7/8] Building dependency graph...")
    dep_graph = dependency_graph_builder.build_graph(code_analyses)

    print("[8/8] Building context index...\n")
    code_search_engine.index_project(inventory, code_analyses)
    inventory.entry_points = entry_point_detector.detect_entry_points(inventory)

    print("PROJECT INTELLIGENCE READY\n")
    print(f"Files: {inventory.total_files}")
    print(f"Languages: {', '.join(inventory.languages) if inventory.languages else 'None'}")
    print(f"Frameworks: {', '.join(inventory.frameworks) if inventory.frameworks else 'None'}")
    print(f"Dependencies: {deps_data['total_dependencies']}")
    print(f"Entry Points: {len(inventory.entry_points)} ({', '.join(inventory.entry_points[:3]) if inventory.entry_points else 'None'})\n")
    print("Project analysis completed.")

def main():
    parser = argparse.ArgumentParser(description="CYVORA Phase 3 Project Intelligence CLI")
    subparsers = parser.add_subparsers(dest="command", help="Sub-command help")

    start_parser = subparsers.add_parser("start", help="Perform real project intelligence analysis")
    start_parser.add_argument("project_path", type=str, help="Path to target project directory")

    args = parser.parse_args()

    if args.command == "start":
        asyncio.run(run_project_intelligence_cli(args.project_path))
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
