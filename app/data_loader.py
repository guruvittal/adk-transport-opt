import os
import json
import csv
import subprocess

PROJECT_ID = "vertexsearch-447722"
DATASET_ID = "transport_optimization"
DATA_DIR = "/home/guruvittal/transport_opt/Data"

class DataLoader:
    def __init__(self, use_bigquery=True):
        self.use_bigquery = use_bigquery
        self.rate_cards = {}
        self.hubs = {}
        self.stores = {}
        self.orders = []
        self.trucks = {}
        self.trailers = {}
        self.drivers = {}
        self.suppliers = {}
        self.distance_matrix = {}
        self.availability = {}
        self.route_history = []
        
        self.load_all_data()

    def _query_bq_table(self, table_name):
        if not self.use_bigquery:
            return None
        sql = f"SELECT * FROM `{PROJECT_ID}.{DATASET_ID}.{table_name}`"
        cmd = [
            "bq", "query",
            "--use_legacy_sql=false",
            "--format=json",
            "--max_rows=10000",
            sql
        ]
        try:
            res = subprocess.run(cmd, capture_output=True, text=True, check=True)
            return json.loads(res.stdout)
        except Exception as e:
            print(f"BigQuery fetch failed for {table_name}, falling back to CSV: {e}")
            return None

    def _read_csv_table(self, filename):
        filepath = os.path.join(DATA_DIR, filename)
        if not os.path.exists(filepath):
            return []
        with open(filepath, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            return list(reader)

    def load_table(self, table_name, csv_filename):
        rows = self._query_bq_table(table_name)
        if rows is None:
            rows = self._read_csv_table(csv_filename)
        return rows

    def load_all_data(self):
        print("Loading data from BigQuery / local cache...")
        
        # 1. Rate cards
        rc_rows = self.load_table("cost_rate_cards", "cost_rate_cards.csv")
        for row in rc_rows:
            self.rate_cards[row["parameter_name"]] = float(row["value"])
            
        # 2. Hubs
        hub_rows = self.load_table("distribution_hubs", "distribution_hubs.csv")
        for row in hub_rows:
            self.hubs[row["hub_id"]] = {
                "hub_id": row["hub_id"],
                "hub_name": row["hub_name"],
                "city": row["city"],
                "state": row["state"],
                "lat": float(row["latitude"]),
                "lon": float(row["longitude"]),
                "daily_capacity_pallets": int(row["daily_capacity_pallets"]),
                "assigned_tractors": int(row["assigned_tractors"]),
                "assigned_trailers": int(row["assigned_trailers"]),
                "assigned_drivers": int(row["assigned_drivers"]),
            }

        # 3. Stores
        store_rows = self.load_table("stores_master", "stores_master.csv")
        for row in store_rows:
            self.stores[row["store_id"]] = {
                "store_id": row["store_id"],
                "primary_hub_id": row["primary_hub_id"],
                "city": row["city"],
                "state": row["state"],
                "lat": float(row["latitude"]),
                "lon": float(row["longitude"]),
                "delivery_window_start": row["delivery_window_start"],
                "delivery_window_end": row["delivery_window_end"],
                "max_trailer_length_ft": int(row["max_trailer_length_ft"]),
                "requires_liftgate": str(row["requires_liftgate"]).lower() in ["true", "1"],
                "avg_unload_time_mins": float(row["avg_unload_time_mins"]),
            }

        # 4. Orders
        self.orders = self.load_table("store_orders_demand", "store_orders_demand.csv")
        for ord_item in self.orders:
            ord_item["chilled_pallets"] = float(ord_item["chilled_pallets"])
            ord_item["frozen_pallets"] = float(ord_item["frozen_pallets"])
            ord_item["ambient_pallets"] = float(ord_item["ambient_pallets"])
            ord_item["total_pallets"] = float(ord_item["total_pallets"])
            ord_item["total_weight_lbs"] = float(ord_item["total_weight_lbs"])

        # 5. Trucks
        truck_rows = self.load_table("trucks_master", "trucks_master.csv")
        for row in truck_rows:
            self.trucks[row["truck_id"]] = {
                "truck_id": row["truck_id"],
                "assigned_hub_id": row["assigned_hub_id"],
                "max_payload_lbs": float(row["max_payload_lbs"]),
                "status": row["status"],
            }

        # 6. Trailers
        trailer_rows = self.load_table("trailers_master", "trailers_master.csv")
        for row in trailer_rows:
            self.trailers[row["trailer_id"]] = {
                "trailer_id": row["trailer_id"],
                "assigned_hub_id": row["assigned_hub_id"],
                "length_ft": int(row["length_ft"]),
                "is_multi_temp": str(row["is_multi_temp"]).lower() in ["true", "1"],
                "max_chilled_pallets": float(row["max_chilled_pallets"]),
                "max_frozen_pallets": float(row["max_frozen_pallets"]),
                "max_ambient_pallets": float(row["max_ambient_pallets"]),
                "total_pallet_capacity": float(row["total_pallet_capacity"]),
                "has_liftgate": str(row["has_liftgate"]).lower() in ["true", "1"],
            }

        # 7. Drivers
        driver_rows = self.load_table("drivers_master", "drivers_master.csv")
        for row in driver_rows:
            self.drivers[row["driver_id"]] = {
                "driver_id": row["driver_id"],
                "assigned_hub_id": row["assigned_hub_id"],
                "assigned_shift": row["assigned_shift"],
                "max_shift_hours": float(row["max_shift_hours"]),
                "hourly_rate": float(row["hourly_rate"]),
            }

        # 8. Suppliers
        supplier_rows = self.load_table("suppliers_master", "suppliers_master.csv")
        for row in supplier_rows:
            self.suppliers[row["supplier_id"]] = {
                "supplier_id": row["supplier_id"],
                "supplier_name": row["supplier_name"],
                "commodity_type": row["commodity_type"],
                "lat": float(row["latitude"]),
                "lon": float(row["longitude"]),
                "preferred_hub_id": row["preferred_hub_id"],
                "pickup_window_start": row["pickup_window_start"],
                "pickup_window_end": row["pickup_window_end"],
                "weekly_supply_capacity_pallets": float(row["weekly_supply_capacity_pallets"]),
            }

        # 9. Distance Matrix
        dist_rows = self.load_table("distance_travel_matrix", "distance_travel_matrix.csv")
        for row in dist_rows:
            key = (row["origin_id"], row["destination_id"])
            self.distance_matrix[key] = {
                "miles": float(row["driving_distance_miles"]),
                "normal_mins": float(row["normal_drive_time_mins"]),
                "peak_mins": float(row["peak_traffic_drive_time_mins"]),
                "toll_usd": float(row["toll_cost_usd"]),
            }

        print(f"Data load complete: {len(self.hubs)} Hubs, {len(self.stores)} Stores, {len(self.orders)} Orders, {len(self.distance_matrix)} Distance links.")

    def get_distance_and_time(self, origin, destination, is_peak=False):
        if origin == destination:
            return 0.0, 0.0, 0.0
        key = (origin, destination)
        if key in self.distance_matrix:
            item = self.distance_matrix[key]
            drive_time = item["peak_mins"] if is_peak else item["normal_mins"]
            return item["miles"], drive_time, item["toll_usd"]
        
        # Approximate if link missing using lat/long euclidean / haul estimation
        lat1, lon1 = self._get_lat_lon(origin)
        lat2, lon2 = self._get_lat_lon(destination)
        if lat1 and lat2:
            import math
            # Haversine approx in miles
            dlat = math.radians(lat2 - lat1)
            dlon = math.radians(lon2 - lon1)
            a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
            c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
            miles = 3958.8 * c * 1.25 # 1.25 winding factor
            mins = (miles / 45.0) * 60.0
            return miles, mins, 0.0
        
        return 100.0, 120.0, 0.0

    def _get_lat_lon(self, loc_id):
        if loc_id in self.hubs:
            return self.hubs[loc_id]["lat"], self.hubs[loc_id]["lon"]
        if loc_id in self.stores:
            return self.stores[loc_id]["lat"], self.stores[loc_id]["lon"]
        if loc_id in self.suppliers:
            return self.suppliers[loc_id]["lat"], self.suppliers[loc_id]["lon"]
        return None, None

if __name__ == "__main__":
    loader = DataLoader(use_bigquery=True)
