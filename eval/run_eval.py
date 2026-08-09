"""
Automated ADK Evaluation Benchmark Suite for Transport Optimization.
Runs test cases in eval/evalset.json and scores quality, hallucination prevention, and grounding.
"""

import os
import sys
import json

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.agent import root_agent

def run_evalset():
    evalset_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "evalset.json")
    with open(evalset_path, "r") as f:
        evalset = json.load(f)

    print("=" * 70)
    print("🚀 RUNNING AUTOMATED ADK EVALUATION SUITE")
    print("=" * 70)

    total_scenarios = len(evalset)
    passed_scenarios = 0

    for item in evalset:
        eval_id = item["eval_id"]
        desc = item["description"]
        hub_id = item.get("hub_id", "HUB_DEN_CO")
        turns = item["turns"]
        print(f"\n📋 Evaluating Scenario: [{eval_id}]")
        print(f"   Description: {desc}")

        session_history = []
        scenario_passed = True

        for idx, turn in enumerate(turns):
            user_input = turn["user_input"]
            expected_kw = turn["expected_keywords"]

            reply = root_agent.execute(
                user_input, 
                context={"hub_id": hub_id, "day": "Wed", "history": session_history}
            )

            # Record turn
            session_history.append({"role": "user", "text": user_input})
            session_history.append({"role": "model", "text": reply})

            # Check expected keywords
            missing_kw = [kw for kw in expected_kw if kw.lower() not in reply.lower()]
            if missing_kw:
                print(f"   ❌ Turn {idx+1} Failed: Missing expected grounding keywords: {missing_kw}")
                scenario_passed = False
            else:
                print(f"   ✅ Turn {idx+1} Passed grounding keyword checks.")

        if scenario_passed:
            passed_scenarios += 1
            print(f"   ✨ Scenario [{eval_id}] PASSED 100%.")
        else:
            print(f"   ⚠️ Scenario [{eval_id}] FAILED.")

    print("\n" + "=" * 70)
    print(f"📊 ADK EVALUATION BENCHMARK SCORE: {passed_scenarios}/{total_scenarios} Passed ({int(passed_scenarios/total_scenarios*100)}%)")
    print("=" * 70)

    return passed_scenarios == total_scenarios

if __name__ == "__main__":
    success = run_evalset()
    sys.exit(0 if success else 1)
