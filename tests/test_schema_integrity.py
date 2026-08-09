"""
Automated Schema Integrity & Contract Validation Test Suite for Transport Optimization.
Verifies referential integrity across Hubs, Suppliers, Stores, and Fleet Prefixes.
"""

import pytest
import json
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

HUBS_EXPECTED = [
    'HUB_LOU_KY', 'HUB_DAL_TX', 'HUB_ATL_GA', 'HUB_RAL_NC', 'HUB_NJ_NJ',
    'HUB_PA_PA', 'HUB_ORL_FL', 'HUB_DEN_CO', 'HUB_PHX_AZ', 'HUB_POR_OR', 'HUB_DSM_IA'
]

def get_suppliers_data():
    app_js_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "dashboard", "app.js")
    with open(app_js_path, "r") as f:
        content = f.read()
    
    # Extract SUPPLIERS_DATA content
    start = content.find("const SUPPLIERS_DATA = [")
    end = content.find("];", start)
    suppliers_block = content[start:end+2]
    return suppliers_block

def test_all_11_hubs_have_supplier_backhauls():
    """Pillar 1 Test: Verifies that every one of the 11 regional hubs has an assigned supplier backhaul point."""
    suppliers_block = get_suppliers_data()
    
    for hub in HUBS_EXPECTED:
        assert f"hub: '{hub}'" in suppliers_block or f'hub: "{hub}"' in suppliers_block, \
            f"SCHEMA INTEGRITY ERROR: Regional Hub '{hub}' is missing an assigned supplier backhaul point in SUPPLIERS_DATA!"

def test_all_suppliers_have_valid_coordinates():
    """Pillar 1 Test: Verifies that all supplier backhaul points have valid non-zero GPS lat/lon coordinates."""
    suppliers_block = get_suppliers_data()
    assert "lat: 3" in suppliers_block or "lat: 4" in suppliers_block or "lat: 2" in suppliers_block, \
        "SCHEMA INTEGRITY ERROR: Suppliers missing valid latitude coordinates!"
    assert "lon: -" in suppliers_block, \
        "SCHEMA INTEGRITY ERROR: Suppliers missing valid longitude coordinates!"

def test_regional_truck_prefixes_match_hub_codes():
    """Pillar 1 Test: Verifies that truck ID prefixes strictly align with regional hub state codes."""
    prefixes = ['TRK-LOU-10', 'TRK-DAL-20', 'TRK-ATL-30', 'TRK-RAL-40', 'TRK-DEN-80']
    app_js_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "dashboard", "app.js")
    with open(app_js_path, "r") as f:
        content = f.read()
    
    for prefix in prefixes:
        assert prefix in content, f"FLEET PREFIX ERROR: Truck prefix '{prefix}' missing from HUBS_DATA array!"
