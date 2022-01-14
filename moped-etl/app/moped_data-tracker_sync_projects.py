#!/usr/bin/env python

import re
import os
import pprint
import knackpy
from process.request import run_query
from process.logging import getLogger

logger = getLogger("moped-knack-sync")
pp = pprint.PrettyPrinter(indent=4)

logger.debug("Syncing Moped Project Data to Data Tracker")

KNACK_DATA_TRACKER_APP_ID = os.getenv("KNACK_DATA_TRACKER_APP_ID")
KNACK_DATA_TRACKER_API_KEY = os.getenv("KNACK_DATA_TRACKER_API_KEY")
KNACK_DATA_TRACKER_VIEW = os.getenv("KNACK_DATA_TRACKER_VIEW")
KNACK_DATA_TRACKER_PROJECT_OBJECT = os.getenv("KNACK_DATA_TRACKER_PROJECT_OBJECT")

KNACK_OBJECT_PROJECT_ID = os.getenv("KNACK_OBJECT_PROJECT_ID")
KNACK_OBJECT_PROJECT_NAME = os.getenv("KNACK_OBJECT_PROJECT_NAME")
KNACK_OBJECT_CURRENT_STATUS = os.getenv("KNACK_OBJECT_CURRENT_STATUS")

# Define mapping between column names and knack column fields
knack_object_keys = {
    "project_id": KNACK_OBJECT_PROJECT_ID,
    "project_name": KNACK_OBJECT_PROJECT_NAME,
    "current_status": KNACK_OBJECT_CURRENT_STATUS,
}

get_all_synchronized_projects = """
query get_all_projects {
  moped_project(where: {knack_project_id: {_is_null: false}}) {
    project_id
    project_name
    current_status
    knack_project_id
    moped_proj_features 
      {
        feature_id
        location
      }
  }
}
"""

# Build a set of signal IDs connected to a knack projet record
def build_signal_set_from_knack_record(record):
    signals = set()
    if record['Signals']: # KnackPy will have None in place if there are no signals
        for signal in record['Signals']:
            signals.add(signal['id'])
    return signals

# Build a set of signals IDs associated to a moped project
def build_signal_set_from_moped_record(record):
    signals = set()
    for feature in record['moped_proj_features']:
        signals.add(feature['location']['properties']['id'])
    return signals


# Get Moped's current state of synchronized projects
moped_data = run_query(get_all_synchronized_projects)
#logger.debug(moped_data)

# Use KnackPy to pull the current state of records in Data Tracker
app = knackpy.App(app_id=KNACK_DATA_TRACKER_APP_ID, api_key=KNACK_DATA_TRACKER_API_KEY)

knack_query_filter = {
    "match": "and",
    "rules": [
        {"field": KNACK_OBJECT_PROJECT_ID, "operator": "is not blank"},
    ],
}

records = app.get(
    "view_" + KNACK_DATA_TRACKER_VIEW, filters=knack_query_filter, generate=1
)
knack_records = {}
for record in records:
    if not record[KNACK_OBJECT_PROJECT_ID]:
        continue
    knack_records[record[KNACK_OBJECT_PROJECT_ID]] = record
#logger.debug(knack_records)

# Iterate over projects, checking for data mismatches, indicating a needed update
for moped_project in moped_data["data"]["moped_project"]:
    update_needed = False
    knack_data = dict(knack_records[moped_project["project_id"]])
    knack_signals = build_signal_set_from_knack_record(knack_records[moped_project["project_id"]])
    #print(knack_signals)

    moped_signals = build_signal_set_from_moped_record(moped_project)
    #print(moped_signals)

    for key in knack_object_keys:
        if (
            not moped_project[key]
            == knack_records[moped_project["project_id"]][knack_object_keys[key]]
        ):
            update_needed = True
            knack_data[knack_object_keys[key]] = moped_project[key]

    if update_needed:
        logger.debug(
            f"""Need to update knack for Moped project {moped_project["project_id"]}"""
        )
        app.record(
            method="update",
            data=knack_data,
            obj="object_" + KNACK_DATA_TRACKER_PROJECT_OBJECT,
        )
    else:
        logger.debug(
            f"""No update needed for Moped project {moped_project["project_id"]}"""
        )
