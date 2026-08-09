import os
import json
import csv
import subprocess

PROJECT_ID = "vertexsearch-447722"
DATASET_ID = "transport_optimization"

def export_routes_to_bigquery(json_report_path="optimized_routes_report.json"):
    if not os.path.exists(json_report_path):
        print(f"Report file {json_report_path} not found.")
        return

    with open(json_report_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    routes = data.get("routes", [])
    print(f"Exporting {len(routes)} optimized routes to BigQuery ({PROJECT_ID}:{DATASET_ID})...")

    routes_csv_path = "optimized_routes.csv"
    schedules_csv_path = "hub_dispatch_schedules.csv"

    # 1. Prepare optimized_routes.csv
    with open(routes_csv_path, mode="w", encoding="utf-8", newline="") as f:
        writer = csv.writer(f)
        writer.writerow([
            "route_id", "hub_id", "truck_id", "trailer_id", "driver_id",
            "dispatch_time", "total_stops", "has_backhaul"
        ])

        for r in routes:
            stops = r.get("stops", [])
            has_backhaul = any(st.get("type") == "supplier" for st in stops)
            writer.writerow([
                r.get("route_id"),
                r.get("hub_id"),
                r.get("truck_id"),
                r.get("trailer_id"),
                r.get("driver_id"),
                r.get("dispatch_time_str"),
                len(stops),
                has_backhaul
            ])

    # 2. Prepare hub_dispatch_schedules.csv
    with open(schedules_csv_path, mode="w", encoding="utf-8", newline="") as f:
        writer = csv.writer(f)
        writer.writerow([
            "schedule_id", "route_id", "hub_id", "stop_sequence",
            "stop_type", "location_id"
        ])

        sch_idx = 1
        for r in routes:
            route_id = r.get("route_id")
            hub_id = r.get("hub_id")
            stops = r.get("stops", [])
            
            for seq, st in enumerate(stops, start=1):
                writer.writerow([
                    f"SCH-{sch_idx:05d}",
                    route_id,
                    hub_id,
                    seq,
                    st.get("type"),
                    st.get("id")
                ])
                sch_idx += 1

    # Load into BigQuery
    for csv_file, table_name in [(routes_csv_path, "optimized_routes"), (schedules_csv_path, "hub_dispatch_schedules")]:
        table_ref = f"{PROJECT_ID}:{DATASET_ID}.{table_name}"
        cmd = [
            "bq", "load",
            "--replace=true",
            "--autodetect",
            "--source_format=CSV",
            "--skip_leading_rows=1",
            table_ref,
            csv_file
        ]
        print(f"Loading BigQuery table {table_ref}...")
        res = subprocess.run(cmd, capture_output=True, text=True)
        if res.returncode == 0:
            print(f"Success: BigQuery table '{table_name}' updated!")
        else:
            print(f"Error loading '{table_name}': {res.stderr}")

if __name__ == "__main__":
    export_routes_to_bigquery()
