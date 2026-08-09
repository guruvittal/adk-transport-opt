import math

class SeedSolver:
    def __init__(self, data_loader):
        self.data = data_loader
        
        # Dynamic strategy handlers that can be injected/mutated
        self.store_hub_assign_func = self._default_store_hub_assign
        self.clustering_sequence_func = self._default_clustering_sequence
        self.backhaul_matching_func = self._default_backhaul_matching

    # =========================================================================
    # EVOLVE BLOCK 1: STORE HUB ASSIGNMENT LOGIC
    # =========================================================================
    def _default_store_hub_assign(self, store_id, primary_hub, candidate_hubs, params):
        max_swap = params.get("max_swap_distance_delta", 10.0)
        best_hub = primary_hub
        min_dist, _, _ = self.data.get_distance_and_time(primary_hub, store_id)
        
        for hub_id in candidate_hubs:
            if hub_id == primary_hub:
                continue
            dist, _, _ = self.data.get_distance_and_time(hub_id, store_id)
            if dist < min_dist - max_swap:
                min_dist = dist
                best_hub = hub_id
        return best_hub

    # =========================================================================
    # EVOLVE BLOCK 2: ORDER CLUSTERING AND SEQUENCING LOGIC
    # =========================================================================
    def _default_clustering_sequence(self, hub_id, hub_orders, params):
        max_pallets = params.get("max_pallets", 24.0)
        max_weight = params.get("max_weight", 38000.0)
        max_stops = params.get("max_stops_per_route", 3)
        
        # Sort by urgency ratio: (delivery_window_start / distance_from_hub)
        sorted_orders = sorted(
            hub_orders,
            key=lambda x: (
                self._time_str_to_mins(self.data.stores[x["store_id"]]["delivery_window_start"]),
                self.data.get_distance_and_time(hub_id, x["store_id"])[0]
            )
        )
        return sorted_orders, max_pallets, max_weight, max_stops

    # =========================================================================
    # EVOLVE BLOCK 3: SUPPLIER BACKHAUL MATCHING LOGIC
    # =========================================================================
    def _default_backhaul_matching(self, hub_id, stops, curr_time_mins, dispatch_mins, params):
        max_detour = params.get("backhaul_detour_miles", 25.0)
        if not stops:
            return stops
            
        last_store_id = stops[-1]["id"]
        for sup_id, sup in self.data.suppliers.items():
            if sup["preferred_hub_id"] == hub_id:
                direct_dist, _, _ = self.data.get_distance_and_time(last_store_id, hub_id)
                to_sup, sup_drive, _ = self.data.get_distance_and_time(last_store_id, sup_id)
                sup_to_hub, ret_drive, _ = self.data.get_distance_and_time(sup_id, hub_id)
                
                detour = (to_sup + sup_to_hub) - direct_dist
                # Verify HOS cap (600 mins = 10h)
                if detour <= max_detour and (curr_time_mins + sup_drive + 45.0 + ret_drive - dispatch_mins) <= 600.0:
                    stops.append({
                        "type": "supplier",
                        "id": sup_id,
                        "backhaul_pallets": 10
                    })
                    break
        return stops

    def solve_with_strategy(self, params):
        hub_order_map = {}
        all_hubs = list(self.data.hubs.keys())

        # 1. Assign Stores to Hubs
        for ord_item in self.data.orders:
            store_id = ord_item["store_id"]
            primary_hub = self.data.stores[store_id]["primary_hub_id"]
            assigned_hub = self.store_hub_assign_func(store_id, primary_hub, all_hubs, params)
            if assigned_hub not in hub_order_map:
                hub_order_map[assigned_hub] = []
            hub_order_map[assigned_hub].append(ord_item)

        # 2. Build Routes per Hub
        all_routes = []
        for hub_id, hub_orders in hub_order_map.items():
            sorted_orders, max_pallets, max_weight, max_stops = self.clustering_sequence_func(hub_id, hub_orders, params)
            
            hub_trucks = [t_id for t_id, t in self.data.trucks.items() if t["assigned_hub_id"] == hub_id]
            hub_trailers = [t_id for t_id, t in self.data.trailers.items() if t["assigned_hub_id"] == hub_id]
            hub_drivers = [d_id for d_id, d in self.data.drivers.items() if d["assigned_hub_id"] == hub_id]
            
            truck_idx = 0
            unassigned_orders = list(sorted_orders)

            while unassigned_orders:
                route_orders = []
                curr_weight = 0.0
                curr_pallets = 0.0
                
                first_ord = unassigned_orders[0]
                first_store = self.data.stores[first_ord["store_id"]]
                win_start = self._time_str_to_mins(first_store["delivery_window_start"])
                first_dist, first_drive, _ = self.data.get_distance_and_time(hub_id, first_ord["store_id"])
                
                dispatch_mins = max(0.0, win_start - first_drive)
                curr_time_mins = dispatch_mins
                curr_loc = hub_id
                
                i = 0
                while i < len(unassigned_orders):
                    if len(route_orders) >= max_stops:
                        break
                        
                    cand_order = unassigned_orders[i]
                    cand_store_id = cand_order["store_id"]
                    store_info = self.data.stores[cand_store_id]
                    
                    if (curr_weight + cand_order["total_weight_lbs"] > max_weight or
                        curr_pallets + cand_order["total_pallets"] > max_pallets):
                        i += 1
                        continue
                    
                    dist, drive_mins, _ = self.data.get_distance_and_time(curr_loc, cand_store_id)
                    unload_mins = store_info["avg_unload_time_mins"]
                    
                    w_start = self._time_str_to_mins(store_info["delivery_window_start"])
                    w_end = self._time_str_to_mins(store_info["delivery_window_end"])
                    
                    arrival_time = curr_time_mins + drive_mins
                    if arrival_time < w_start:
                        arrival_time = w_start
                    elif arrival_time > w_end:
                        i += 1
                        continue
                    
                    finish_time = arrival_time + unload_mins
                    ret_dist, ret_mins, _ = self.data.get_distance_and_time(cand_store_id, hub_id)
                    
                    if (finish_time + ret_mins - dispatch_mins) > 600.0:
                        i += 1
                        continue

                    route_orders.append(cand_order)
                    curr_weight += cand_order["total_weight_lbs"]
                    curr_pallets += cand_order["total_pallets"]
                    curr_time_mins = finish_time
                    curr_loc = cand_store_id
                    unassigned_orders.pop(i)

                if not route_orders:
                    forced = unassigned_orders.pop(0)
                    route_orders.append(forced)
                    forced_store = self.data.stores[forced["store_id"]]
                    win_st = self._time_str_to_mins(forced_store["delivery_window_start"])
                    _, d_mins, _ = self.data.get_distance_and_time(hub_id, forced["store_id"])
                    dispatch_mins = max(0.0, win_st - d_mins)

                stops = [{"type": "store", "id": ord_item["store_id"], "order": ord_item} for ord_item in route_orders]

                # Backhaul matching strategy
                stops = self.backhaul_matching_func(hub_id, stops, curr_time_mins, dispatch_mins, params)

                truck_id = hub_trucks[truck_idx % len(hub_trucks)] if hub_trucks else "TRK-101"
                trailer_id = hub_trailers[truck_idx % len(hub_trailers)] if hub_trailers else "TRL-201"
                driver_id = hub_drivers[truck_idx % len(hub_drivers)] if hub_drivers else "DRV-501"
                truck_idx += 1

                disp_hh = int(dispatch_mins // 60)
                disp_mm = int(dispatch_mins % 60)
                disp_str = f"{disp_hh:02d}:{disp_mm:02d}"

                all_routes.append({
                    "route_id": f"RT_{hub_id}_{truck_idx}",
                    "hub_id": hub_id,
                    "truck_id": truck_id,
                    "trailer_id": trailer_id,
                    "driver_id": driver_id,
                    "dispatch_time_str": disp_str,
                    "stops": stops
                })

        return all_routes

    def solve(self):
        default_params = {
            "max_swap_distance_delta": 10.0,
            "max_pallets": 24.0,
            "max_weight": 38000.0,
            "max_stops_per_route": 3,
            "backhaul_detour_miles": 25.0
        }
        return self.solve_with_strategy(default_params)

    def _time_str_to_mins(self, time_str):
        try:
            p = str(time_str).split(":")
            return float(p[0]) * 60.0 + float(p[1])
        except Exception:
            return 0.0
