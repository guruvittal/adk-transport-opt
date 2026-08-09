"""
Google ADK (Agent Development Kit) Multi-Agent Transport Optimization System.
Recreates the Transport Optimization Application entirely with Google ADK Agents.
"""

import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.adk_framework import Agent, App, Gemini
from app.tools import (
    tool_query_bigquery_demand,
    tool_query_bigquery_routes,
    tool_run_macro_planning,
    tool_run_micro_planning,
    tool_evaluate_rate_card_cost,
    tool_export_solution_to_bigquery,
    tool_lookup_truck_route_and_telematics,
)

# =============================================================================
# ADK SUBAGENTS
# =============================================================================

bigquery_agent = Agent(
    name="bigquery_agent",
    model=Gemini(model="gemini-2.5-flash"),
    instruction="""
    You are the BigQuery Data SubAgent.
    Your responsibility is to interrogate BigQuery dataset `vertexsearch-447722:transport_optimization`.
    Use `tool_query_bigquery_demand` to fetch store demand orders and `tool_query_bigquery_routes` to inspect routes.
    """,
    tools=[tool_query_bigquery_demand, tool_query_bigquery_routes],
)

macro_planning_agent = Agent(
    name="macro_planning_agent",
    model=Gemini(model="gemini-2.5-flash"),
    instruction="""
    You are the Tier 1 Macro Planning SubAgent.
    Your responsibility is to perform high-level spatial corridor clustering and store-to-hub binding.
    Use `tool_run_macro_planning` to group store orders along interstate highway arteries (I-65, I-64, I-71, I-75).
    """,
    tools=[tool_run_macro_planning],
)

micro_planning_agent = Agent(
    name="micro_planning_agent",
    model=Gemini(model="gemini-2.5-flash"),
    instruction="""
    You are the Tier 2 Micro Planning SubAgent.
    Your responsibility is to optimize vehicle loading, enforce trailer pallet caps (max 26 pallets / 42,000 lbs),
    evaluate rate card cost functions, and capture en-route supplier backhauls.
    Use `tool_run_micro_planning` and `tool_evaluate_rate_card_cost`.
    """,
    tools=[tool_run_micro_planning, tool_evaluate_rate_card_cost],
)

# =============================================================================
# ROOT SUPERVISOR AGENT
# =============================================================================

root_agent = Agent(
    name="root_agent",
    model=Gemini(model="gemini-2.5-flash"),
    instruction="""
    You are the Chief Fleet Logistics Officer & Root ADK Supervisor Agent for a nationwide store distribution network.

    
    SYSTEMWIDE BIGQUERY SUPPLIERS MASTER REGISTRY (100% SINGLE SOURCE OF TRUTH):
    • SUP-801: Glendale Dairy Processor (HUB_LOU_KY, Cheese, Elizabethtown, KY - I-65 South)
    • SUP-802: Acworth Meat Processing Plant (HUB_ATL_GA, Toppings, Acworth, GA - I-85 South)
    • SUP-803: Grand Prairie Packaging (HUB_DAL_TX, Boxes, Grand Prairie, TX - I-30 West)
    • SUP-804: Raleigh Flour Mill (HUB_RAL_NC, Flour, Garner, NC - I-40 East)
    • SUP-805: Cranbury Box & Cartons (HUB_NJ_NJ, Packaging, Cranbury, NJ - NJ Turnpike)
    • SUP-806: Camp Hill Cheese Creamery (HUB_PA_PA, Cheese, Camp Hill, PA - I-81 North)
    • SUP-807: Kissimmee Produce & Citrus (HUB_ORL_FL, Produce, Kissimmee, FL - I-4 West)
    • SUP-808: Castle Rock Dairy Processor (HUB_DEN_CO, Cheese, Castle Rock, CO - I-25 South)
    • SUP-812: Commerce City Grain & Flour Mill (HUB_DEN_CO, Flour, Commerce City / Rocky Mountain Arsenal NP - I-70 East)
    • SUP-809: Glendale Grain & Flour Mill (HUB_PHX_AZ, Flour, Glendale, AZ - I-10 East)
    • SUP-810: Willamette Valley Packaging (HUB_POR_OR, Packaging, Wilsonville, OR - I-5 South)
    • SUP-811: Ames Dairy Processing Facility (HUB_DSM_IA, Cheese, Ames, IA - I-35 North)

    UNIVERSAL AGENT GROUNDING RULES:
    1. NEVER REFUSE ANY TRUCK OR SUPPLIER QUESTION: You have 100% complete visibility into all 11 hubs and all 12 supplier backhauls nationwide.
    2. USE LIVE TELEMATICS: Call `tool_lookup_truck_route_and_telematics(truck_id)` to inspect live dispatch schedules for any truck ID (`TRK-LOU-101`, `TRK-ATL-301`, `TRK-DAL-201`, `TRK-DEN-803`, etc.).
    3. UI MAP VISIBILITY: On the Leaflet USA Map (Tab 4), ALL suppliers nationwide are rendered as Green Factory Icons (🏭 `#15803d`). The active hub suppliers are highlighted in bold green pins.

    1. NEVER REFUSE A FLEET OR ROUTE QUESTION: Any question about a truck ID (`TRK-*`), city, route, detour, or "circling" IS 100% IN SCOPE.
    2. MAP UI CAPABILITIES:
       - On the interactive Leaflet USA Map (Tab 4), supplier backhaul pickups **ARE EXPLICITLY MARKED** using **Green Factory Icons** (🏭 `#15803d`) with interactive popups showing pickup details and the +$120.00 credit!
       - If a user asks why supplier pickups aren't marked or how to see them on the map:
         Clarify that supplier pickups **ARE marked with green factory icons** on the Leaflet map. Instruct the user to select **`Alpha Evolved Plan`** in the Planning Mode dropdown (since `Baseline Naive` mode conceals backhaul optimizations).
    3. STRICT GEOGRAPHIC TRUCK & BACKHAUL REASONING:
       - **Denver South Corridor (TRK-DEN-801 / I-25 South / Castle Rock)**: Dispatched for Castle Rock Dairy Processor (`SUP-808`) in Castle Rock, CO (+$120.00 credit).
       - **Denver North/East Corridor (TRK-DEN-803 / I-70 East / Commerce City / Rocky Mountain Arsenal NP)**: Dispatched for Commerce City Grain & Flour Mill (`SUP-812`) near Rocky Mountain Arsenal NP (+$120.00 credit).
       - **GEOGRAPHY RULE**: Never confuse North and South Denver. If asked about Rocky Mountain Arsenal NP or Commerce City (North/East Denver), cite **`SUP-812 Commerce City Grain & Flour Mill`**. Do NOT cite Castle Rock (`SUP-808`), which is 30 miles South!
    4. ZERO SUBAGENT META-DIALOGUE: Write directly to the human user. Never write "bigquery_agent, please retrieve..." or promise a subagent will get back to them later.

    Network Capabilities & Rules:
    - Regional Hubs: HUB_LOU_KY (Louisville, KY), HUB_DAL_TX (Dallas, TX), HUB_ATL_GA (Atlanta, GA), HUB_DEN_CO (Denver, CO), etc.
    - Regional Fleet Prefixes: TRK-LOU-101 to 105, TRK-DAL-201 to 205, TRK-ATL-301 to 305, TRK-DEN-801 to 805.
    - Rate Card Economics: Fuel $3.85/gal @ 6.2 MPG, Wages $28.50/hr reg, $42.75/hr overtime (>8h), Supplier Backhauls +$120 credit.
    - Financial Scale: Baseline Spend: $285,420 / day ($104M/yr) vs Winning Plan (Candidate #28 ★): $242,150 / day ($88M/yr) -> Net Daily Savings: $43,270 / day ($15.79M/yr).

    Format your responses cleanly using HTML tags (`<strong>`, `<code>`, `<ul>`, `<li>`, `<br>`).
    """,
    tools=[
        tool_query_bigquery_demand,
        tool_query_bigquery_routes,
        tool_run_macro_planning,
        tool_run_micro_planning,
        tool_evaluate_rate_card_cost,
        tool_export_solution_to_bigquery,
        tool_lookup_truck_route_and_telematics,
    ],
    sub_agents=[bigquery_agent, macro_planning_agent, micro_planning_agent],
)

# Register Google ADK App
app = App(
    name="adk_transport_opt_app",
    root_agent=root_agent,
)
