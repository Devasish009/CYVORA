import os
import json
from typing import List, Optional, Dict, Any
from engine.memory.hindsight.hindsight_models import (
    HindsightRecord,
    HindsightRecallResult,
    HindsightReflectSummary,
)
from engine.memory.hindsight.runbook_generator import runbook_generator, Runbook

class HindsightMemoryManager:
    """
    Hindsight Persistent Memory Layer executing Retain, Recall, and Reflect operations.
    Prevents CYVORA from starting from scratch on recurring software incidents.
    """

    def __init__(self):
        self._records: List[HindsightRecord] = []

    def retain(
        self,
        incident_id: str,
        project_path: str,
        error_type: str,
        error_message: str,
        category: str,
        root_cause_summary: str,
        recommended_fix_strategy: str,
        affected_file: Optional[str] = None,
        line_number: Optional[int] = None,
        function_name: Optional[str] = None,
        unified_diff: Optional[str] = None,
        verification_status: str = "REPAIR VERIFIED",
        build_passed: bool = True,
        tests_passed: bool = True,
        security_passed: bool = True,
        regression_passed: bool = True,
        tags: Optional[List[str]] = None
    ) -> HindsightRecord:
        """RETAIN Operation: Stores incident resolution knowledge in Hindsight memory."""
        record = HindsightRecord(
            incident_id=incident_id,
            project_path=project_path,
            error_type=error_type,
            error_message=error_message,
            category=category,
            affected_file=affected_file,
            line_number=line_number,
            function_name=function_name,
            root_cause_summary=root_cause_summary,
            recommended_fix_strategy=recommended_fix_strategy,
            unified_diff=unified_diff,
            verification_status=verification_status,
            build_passed=build_passed,
            tests_passed=tests_passed,
            security_passed=security_passed,
            regression_passed=regression_passed,
            tags=tags or [category.lower(), error_type.lower()]
        )

        # Generate or update operational runbook
        if verification_status == "REPAIR VERIFIED":
            runbook = runbook_generator.generate_or_update(record)
            record.runbook_id = runbook.runbook_id

        self._records.append(record)
        return record

    def recall(
        self,
        error_type: Optional[str] = None,
        error_message: Optional[str] = None,
        affected_file: Optional[str] = None,
        category: Optional[str] = None,
        min_similarity: float = 0.2
    ) -> HindsightRecallResult:
        """RECALL Operation: Searches historical memory for similar past incidents and runbooks."""
        matched: List[HindsightRecord] = []
        query_parts = [p for p in [error_type, error_message, affected_file, category] if p]
        query_str = " | ".join(query_parts) or "General Recall Query"

        for rec in self._records:
            score = self._calculate_similarity(rec, error_type, error_message, affected_file, category)
            if score >= min_similarity:
                rec_copy = rec.model_copy()
                rec_copy.similarity_score = round(score, 2)
                matched.append(rec_copy)

        # Sort by similarity score descending
        matched.sort(key=lambda r: r.similarity_score, reverse=True)

        # Get top runbook recommendation if matched
        top_runbook = None
        if matched and matched[0].runbook_id:
            rb = runbook_generator.get_runbook(matched[0].runbook_id)
            if rb:
                top_runbook = rb.model_dump()

        return HindsightRecallResult(
            query=query_str,
            matches_found=len(matched),
            matched_records=matched,
            suggested_runbook=top_runbook
        )

    def reflect(self) -> HindsightReflectSummary:
        """REFLECT Operation: Analyzes accumulated incident memory to identify recurring patterns."""
        total = len(self._records)
        verified_count = sum(1 for r in self._records if r.verification_status == "REPAIR VERIFIED")

        cat_counts: Dict[str, int] = {}
        file_counts: Dict[str, int] = {}

        for r in self._records:
            cat_counts[r.category] = cat_counts.get(r.category, 0) + 1
            if r.affected_file:
                file_counts[r.affected_file] = file_counts.get(r.affected_file, 0) + 1

        patterns: List[str] = []
        for cat, count in cat_counts.items():
            if count >= 2:
                patterns.append(f"Recurring pattern detected: {count} incidents involving '{cat}' failure category.")
        for fn, count in file_counts.items():
            if count >= 2:
                patterns.append(f"Hotspot file identified: '{fn}' affected in {count} separate incidents.")

        if not patterns:
            patterns.append("System operating with low incident repetition. Memory baseline established.")

        return HindsightReflectSummary(
            total_incidents_recorded=total,
            successful_repairs_count=verified_count,
            top_failing_categories=cat_counts,
            top_affected_files=file_counts,
            recurring_patterns=patterns
        )

    def _calculate_similarity(
        self,
        record: HindsightRecord,
        error_type: Optional[str],
        error_message: Optional[str],
        affected_file: Optional[str],
        category: Optional[str]
    ) -> float:
        score = 0.0

        if error_type and record.error_type.lower() == error_type.lower():
            score += 0.4

        if category and record.category.lower() == category.lower():
            score += 0.3

        if affected_file and record.affected_file and (affected_file in record.affected_file or record.affected_file in affected_file):
            score += 0.2

        if error_message and record.error_message:
            msg1_words = set(error_message.lower().split())
            msg2_words = set(record.error_message.lower().split())
            overlap = msg1_words.intersection(msg2_words)
            if overlap:
                score += min(0.1, 0.02 * len(overlap))

        return score

    def get_all_records(self) -> List[HindsightRecord]:
        return list(self._records)

hindsight_memory = HindsightMemoryManager()
