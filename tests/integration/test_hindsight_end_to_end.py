import os
import pytest
import asyncio
from engine.core.orchestrator import engine_orchestrator
from engine.core.state_manager import SessionState
from engine.memory.hindsight import hindsight_memory

def test_hindsight_end_to_end_demo_flow():
    async def run():
        shop_dir = os.path.abspath("./example_project/cyvora_shop")
        os.makedirs(shop_dir, exist_ok=True)

        err_traceback_1 = (
            "TypeError: 'NoneType' object is not subscriptable\n"
            "  File 'checkout_service.py', line 12, in checkout\n"
            "    return {'item': cart_item, 'status': res['status']}\n"
        )

        # ----------------------------------------------------
        # INCIDENT #1: First Time Occurrence
        # ----------------------------------------------------
        session1 = await engine_orchestrator.run_repair_session(
            project_path=shop_dir,
            target_error=err_traceback_1,
            simulate_validation_failure=False
        )

        assert session1.current_state == SessionState.SUCCESS
        assert "retained_hindsight_record" in session1.context_data
        retained = session1.context_data["retained_hindsight_record"]
        assert retained["category"] == "NULL_POINTER"

        # Verify incident is in Hindsight memory index
        all_recs = hindsight_memory.get_all_records()
        assert len(all_recs) >= 1

        # ----------------------------------------------------
        # INCIDENT #2: Second Similar Incident Occurrence
        # ----------------------------------------------------
        err_traceback_2 = (
            "TypeError: 'NoneType' object is not subscriptable\n"
            "  File 'checkout_service.py', line 14, in process_response\n"
            "    val = res['transaction_id']\n"
        )

        session2 = await engine_orchestrator.run_repair_session(
            project_path=shop_dir,
            target_error=err_traceback_2,
            simulate_validation_failure=False
        )

        assert session2.current_state == SessionState.SUCCESS
        assert "hindsight_recall" in session2.context_data
        recall_data = session2.context_data["hindsight_recall"]
        
        # KEY DEMO CHECK: Hindsight Recall found similar past incident!
        assert recall_data["matches_found"] >= 1
        assert recall_data["matched_records"][0]["similarity_score"] > 0.5
        assert recall_data["suggested_runbook"] is not None

    asyncio.run(run())
