from datetime import datetime, timedelta

class RouteEvaluator:
    def __init__(self, data_loader):
        self.data = data_loader
        
        # Rate card defaults
        self.fuel_price = self.data.rate_cards.get("fuel_price_per_gallon", 3.85)
        self.mpg = self.data.rate_cards.get("tractor_mpg_loaded", 6.2)
        self.base_wage = self.data.rate_cards.get("driver_base_wage_hourly", 28.50)
        self.ot_multiplier = self.data.rate_cards.get("driver_overtime_multiplier", 1.5)
        self.maint_rate = self.data.rate_cards.get("maintenance_cost_per_mile", 0.18)
        self.fixed_stop_fee = self.data.rate_cards.get("fixed_stop_fee", 15.0)

    def evaluate_solution(self, routes):
        total_fuel_cost = 0.0
        total_wage_cost = 0.0
        total_ot_cost = 0.0
        total_maint_cost = 0.0
        total_toll_cost = 0.0
        total_stop_fees = 0.0
        total_backhaul_credits = 0.0
        total_penalties = 0.0
        
        total_miles = 0.0
        total_duration_mins = 0.0
        
        late_keydrop_count = 0
        hos_violations_count = 0
        capacity_violations_count = 0
        backhauls_matched = 0

        for r in routes:
            hub_id = r["hub_id"]
            stops = r.get("stops", [])
            if not stops:
                continue
            
            # 1. Capacity Checks
            route_weight_lbs = 0.0
            route_chilled_pallets = 0.0
            route_frozen_pallets = 0.0
            route_ambient_pallets = 0.0
            route_total_pallets = 0.0

            for st in stops:
                if st["type"] == "store":
                    ord_item = st.get("order", {})
                    route_weight_lbs += ord_item.get("total_weight_lbs", 0.0)
                    route_chilled_pallets += ord_item.get("chilled_pallets", 0.0)
                    route_frozen_pallets += ord_item.get("frozen_pallets", 0.0)
                    route_ambient_pallets += ord_item.get("ambient_pallets", 0.0)
                    route_total_pallets += ord_item.get("total_pallets", 0.0)

            trailer = self.data.trailers.get(r.get("trailer_id"), {})
            max_pallets = trailer.get("total_pallet_capacity", 28.0)
            max_weight = 44000.0

            if route_weight_lbs > max_weight or route_total_pallets > max_pallets:
                capacity_violations_count += 1
                total_penalties += 5000.0

            # 2. Driving & Time Windows
            curr_loc = hub_id
            dispatch_time_mins = self._time_str_to_mins(r.get("dispatch_time_str", "00:00"))
            curr_time_mins = dispatch_time_mins
            
            route_miles = 0.0
            route_tolls = 0.0
            route_stop_count = 0

            for st in stops:
                next_loc = st["id"]
                miles, drive_time, toll = self.data.get_distance_and_time(curr_loc, next_loc)
                
                route_miles += miles
                route_tolls += toll
                curr_time_mins += drive_time
                
                if st["type"] == "store":
                    route_stop_count += 1
                    store_info = self.data.stores.get(next_loc, {})
                    unload_time = store_info.get("avg_unload_time_mins", 30.0)
                    
                    window_start = self._time_str_to_mins(store_info.get("delivery_window_start", "01:00"))
                    window_end = self._time_str_to_mins(store_info.get("delivery_window_end", "05:00"))
                    
                    # Key drop window check
                    if curr_time_mins < window_start:
                        curr_time_mins = window_start # Wait outside until store delivery window opens
                    elif curr_time_mins > window_end:
                        late_keydrop_count += 1
                        total_penalties += 500.0 # Late arrival past window end
                        
                    curr_time_mins += unload_time

                elif st["type"] == "supplier":
                    backhauls_matched += 1
                    curr_time_mins += 45.0 # dwell time at supplier
                    total_backhaul_credits += 120.0

                curr_loc = next_loc

            # Return trip to hub
            return_miles, return_time, return_toll = self.data.get_distance_and_time(curr_loc, hub_id)
            route_miles += return_miles
            route_tolls += return_toll
            curr_time_mins += return_time

            route_duration_mins = curr_time_mins - dispatch_time_mins

            # HOS Check (Max shift = 11 hours = 660 mins)
            if route_duration_mins > 660.0:
                hos_violations_count += 1
                total_penalties += 10000.0

            fuel_cost = (route_miles / self.mpg) * self.fuel_price
            maint_cost = route_miles * self.maint_rate
            stop_fees = route_stop_count * self.fixed_stop_fee

            duration_hours = route_duration_mins / 60.0
            base_wage_hours = min(8.0, duration_hours)
            ot_hours = max(0.0, duration_hours - 8.0)

            driver_hourly = self.base_wage
            if r.get("driver_id") in self.data.drivers:
                driver_hourly = self.data.drivers[r["driver_id"]]["hourly_rate"]

            wage_cost = base_wage_hours * driver_hourly
            ot_cost = ot_hours * driver_hourly * self.ot_multiplier

            total_fuel_cost += fuel_cost
            total_maint_cost += maint_cost
            total_wage_cost += wage_cost
            total_ot_cost += ot_cost
            total_toll_cost += route_tolls
            total_stop_fees += stop_fees
            total_miles += route_miles
            total_duration_mins += route_duration_mins

        total_net_expense = (
            total_fuel_cost +
            total_wage_cost +
            total_ot_cost +
            total_maint_cost +
            total_toll_cost +
            total_stop_fees -
            total_backhaul_credits +
            total_penalties
        )

        return {
            "objective_score": round(total_net_expense, 2),
            "fuel_cost": round(total_fuel_cost, 2),
            "wage_cost": round(total_wage_cost, 2),
            "overtime_cost": round(total_ot_cost, 2),
            "maintenance_cost": round(total_maint_cost, 2),
            "toll_cost": round(total_toll_cost, 2),
            "stop_fees": round(total_stop_fees, 2),
            "backhaul_credits": round(total_backhaul_credits, 2),
            "penalty_cost": round(total_penalties, 2),
            "total_miles": round(total_miles, 1),
            "total_hours": round(total_duration_mins / 60.0, 1),
            "late_keydrop_violations": late_keydrop_count,
            "hos_violations": hos_violations_count,
            "capacity_violations": capacity_violations_count,
            "backhauls_matched": backhauls_matched,
            "total_routes": len(routes),
            "is_feasible": (late_keydrop_count + hos_violations_count + capacity_violations_count) == 0,
        }

    def _time_str_to_mins(self, time_str):
        try:
            parts = str(time_str).split(":")
            return float(parts[0]) * 60.0 + float(parts[1])
        except Exception:
            return 0.0
