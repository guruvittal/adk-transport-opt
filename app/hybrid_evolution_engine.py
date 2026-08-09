import copy
import random
import time
from data_loader import DataLoader
from seed_solver import SeedSolver
from evaluator import RouteEvaluator

class HybridEvolutionEngine:
    def __init__(self, data_loader, code_generations=2, parametric_generations=3, population_size=4):
        self.data = data_loader
        self.evaluator = RouteEvaluator(data_loader)
        self.code_generations = code_generations
        self.parametric_generations = parametric_generations
        self.population_size = population_size

    def _get_algorithmic_strategies(self):
        """
        Defines algorithmic strategy blocks that simulate LLM code mutations.
        """
        strategies = []

        # Strategy A: Urgency-Ratio Priority
        def assign_A(store_id, primary_hub, candidate_hubs, params):
            max_swap = params.get("max_swap_distance_delta", 10.0)
            best_hub = primary_hub
            min_dist, _, _ = self.data.get_distance_and_time(primary_hub, store_id)
            for hub_id in candidate_hubs:
                if hub_id == primary_hub: continue
                dist, _, _ = self.data.get_distance_and_time(hub_id, store_id)
                if dist < min_dist - max_swap:
                    min_dist = dist
                    best_hub = hub_id
            return best_hub

        def sequence_A(hub_id, hub_orders, params):
            max_pallets = params.get("max_pallets", 24.0)
            max_weight = params.get("max_weight", 38000.0)
            max_stops = params.get("max_stops_per_route", 3)
            sorted_orders = sorted(
                hub_orders,
                key=lambda x: (
                    self._time_str_to_mins(self.data.stores[x["store_id"]]["delivery_window_start"]),
                    self.data.get_distance_and_time(hub_id, x["store_id"])[0]
                )
            )
            return sorted_orders, max_pallets, max_weight, max_stops

        strategies.append({
            "name": "LLM-Mutation-A (Delivery-Urgency Priority)",
            "assign_func": assign_A,
            "sequence_func": sequence_A
        })

        # Strategy B: Distance-Density Savings Sorting
        def sequence_B(hub_id, hub_orders, params):
            max_pallets = params.get("max_pallets", 25.0)
            max_weight = params.get("max_weight", 40000.0)
            max_stops = params.get("max_stops_per_route", 3)
            sorted_orders = sorted(
                hub_orders,
                key=lambda x: self.data.get_distance_and_time(hub_id, x["store_id"])[0]
            )
            return sorted_orders, max_pallets, max_weight, max_stops

        strategies.append({
            "name": "LLM-Mutation-B (Distance-Savings Clustering)",
            "assign_func": assign_A,
            "sequence_func": sequence_B
        })

        return strategies

    def run_hybrid_evolution(self):
        print("\n" + "=" * 80)
        print(" STARTING HYBRID EVOLUTIONARY ENGINE (LLM CODE MUTATION + PARAMETRIC SEARCH)")
        print("=" * 80)

        strategies = self._get_algorithmic_strategies()
        best_overall_score = float("inf")
        best_overall_metrics = None
        best_overall_chrom = None
        best_overall_routes = None
        best_strategy_name = ""

        solver = SeedSolver(self.data)

        for code_gen in range(1, self.code_generations + 1):
            print(f"\n--- [TIER 1: LLM Code Generation Cycle {code_gen}/{self.code_generations}] ---")
            strat = random.choice(strategies)
            print(f"Injecting Mutated Code Block: '{strat['name']}'")

            # Inject LLM code function overrides into solver
            solver.store_hub_assign_func = strat["assign_func"]
            solver.clustering_sequence_func = strat["sequence_func"]

            # Tier 2: Run Parametric Fine-Tuning
            print(f"--- [TIER 2: Parametric Search Loop across {self.parametric_generations} generations] ---")
            
            population = []
            for _ in range(self.population_size):
                chrom = {
                    "max_swap_distance_delta": random.uniform(5.0, 20.0),
                    "max_pallets": random.uniform(20.0, 26.0),
                    "max_weight": random.uniform(35000.0, 42000.0),
                    "max_stops_per_route": random.randint(2, 3),
                    "backhaul_detour_miles": random.uniform(15.0, 35.0),
                }
                population.append(chrom)

            strat_best_score = float("inf")
            strat_best_metrics = None
            strat_best_chrom = None
            strat_best_routes = None

            for p_gen in range(1, self.parametric_generations + 1):
                evaluated_pop = []
                for chrom in population:
                    routes = solver.solve_with_strategy(chrom)
                    metrics = self.evaluator.evaluate_solution(routes)
                    score = metrics["objective_score"]
                    if not metrics["is_feasible"]:
                        score += 10000000.0
                    
                    evaluated_pop.append((score, chrom, metrics, routes))
                    
                    if score < strat_best_score:
                        strat_best_score = score
                        strat_best_metrics = metrics
                        strat_best_chrom = chrom
                        strat_best_routes = routes

                evaluated_pop.sort(key=lambda x: x[0])
                top_survivors = evaluated_pop[: max(2, self.population_size // 3)]

                # Mutate parametric population
                new_pop = [p[1] for p in top_survivors]
                while len(new_pop) < self.population_size:
                    parent = copy.deepcopy(random.choice(top_survivors)[1])
                    parent["max_swap_distance_delta"] = max(0.0, parent["max_swap_distance_delta"] + random.uniform(-2.0, 2.0))
                    parent["max_pallets"] = min(26.0, max(18.0, parent["max_pallets"] + random.uniform(-1.0, 1.0)))
                    parent["max_weight"] = min(42000.0, max(30000.0, parent["max_weight"] + random.uniform(-1000.0, 1000.0)))
                    parent["max_stops_per_route"] = random.randint(2, 3)
                    parent["backhaul_detour_miles"] = max(5.0, parent["backhaul_detour_miles"] + random.uniform(-3.0, 3.0))
                    new_pop.append(parent)

                population = new_pop

            print(f"Cycle {code_gen} Best Net Spend: ${strat_best_metrics['objective_score']:,.2f} | Backhauls: {strat_best_metrics['backhauls_matched']}")

            if strat_best_score < best_overall_score:
                best_overall_score = strat_best_score
                best_overall_metrics = strat_best_metrics
                best_overall_chrom = strat_best_chrom
                best_overall_routes = strat_best_routes
                best_strategy_name = strat["name"]

        print("\n" + "=" * 80)
        print(" HYBRID EVOLUTIONARY ENGINE COMPLETE")
        print("=" * 80)
        print(f"Winning Code Strategy: {best_strategy_name}")
        print(f"Winning Net Daily Spend: ${best_overall_metrics['objective_score']:,.2f}")
        print(f"Total Routes Generated:  {best_overall_metrics['total_routes']}")
        print(f"Total Mileage:           {best_overall_metrics['total_miles']:,.1f} miles")
        print(f"Backhaul Matches:        {best_overall_metrics['backhauls_matched']} pickups")

        return best_overall_score, best_overall_metrics, best_overall_chrom, best_overall_routes

    def _time_str_to_mins(self, time_str):
        try:
            p = str(time_str).split(":")
            return float(p[0]) * 60.0 + float(p[1])
        except Exception:
            return 0.0

if __name__ == "__main__":
    loader = DataLoader(use_bigquery=True)
    engine = HybridEvolutionEngine(loader, code_generations=2, parametric_generations=3, population_size=4)
    engine.run_hybrid_evolution()
