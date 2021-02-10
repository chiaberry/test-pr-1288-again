import { gql } from "@apollo/client";

export const PROJECT_NAME = gql`
  query ProjectName($projectId: Int) {
    moped_project(where: { project_id: { _eq: $projectId } }) {
      project_name
    }
  }
`;

export const SUMMARY_QUERY = gql`
  query ProjectSummary($projectId: Int) {
    moped_project(where: { project_id: { _eq: $projectId } }) {
      project_name
      project_description
      start_date
      current_phase
      current_status
      capitally_funded
      eCapris_id
      fiscal_year
      project_priority
      project_extent_ids
      project_extent_geojson
    }
  }
`;

export const TEAM_QUERY = gql`
  query TeamSummary($projectId: Int) {
    moped_proj_personnel(where: { project_id: { _eq: $projectId } }) {
      user_id
      role_id
      notes
      join_date
      allocation
      status
      project_id
      project_personnel_user_id
      project_personnel_id
      role_order
      date_added
      added_by
    }
    moped_workgroup {
      workgroup_id
      workgroup_name
    }
    moped_project_roles {
      project_role_id
      project_role_name
    }
    moped_users(
      order_by: { last_name: asc }
      where: { status_id: { _eq: 1 } }
    ) {
      first_name
      last_name
      workgroup_id
      user_id
    }
  }
`;

export const ADD_PROJECT_PERSONNEL = gql`
  mutation AddProjectPersonnel(
    $objects: [moped_proj_personnel_insert_input!]!
  ) {
    insert_moped_proj_personnel(objects: $objects) {
      affected_rows
    }
  }
`;

export const UPDATE_PROJECT_PERSONNEL = gql`
  mutation UpdateProjectPersonnel(
    $user_id: Int
    $notes: String
    $project_id: Int
    $join_date: date
    $allocation: Int
    $status: String
    $project_personnel_user_id: Int
    $project_personnel_id: Int!
    $role_order: Int
    $date_added: timestamptz
    $added_by: Int
    $role_id: Int
  ) {
    update_moped_proj_personnel_by_pk(
      pk_columns: { project_personnel_id: $project_personnel_id }
      _set: {
        user_id: $user_id
        notes: $notes
        project_id: $project_id
        join_date: $join_date
        allocation: $allocation
        status: $status
        project_personnel_user_id: $project_personnel_user_id
        project_personnel_id: $project_personnel_id
        role_order: $role_order
        date_added: $date_added
        added_by: $added_by
        role_id: $role_id
      }
    ) {
      user_id
      role_id
      notes
    }
  }
`;

export const TIMELINE_QUERY = gql`
  query TeamTimeline($projectId: Int) {
    moped_phases {
      phase_id
      phase_name
    }
    moped_proj_phases(where: { project_id: { _eq: $projectId } }) {
      phase_name
      project_phase_id
      is_current_phase
      project_id
      phase_start
      phase_end
    }
  }
`;

export const UPDATE_PROJECT_PHASES_MUTATION = gql`
  mutation ProjectPhasesMutation(
    $is_current_phase: Boolean
    $phase_start: date = null
    $phase_end: date = null
    $project_phase_id: Int!
    $phase_name: String!
  ) {
    update_moped_proj_phases_by_pk(
      pk_columns: { project_phase_id: $project_phase_id }
      _set: {
        is_current_phase: $is_current_phase
        phase_start: $phase_start
        phase_end: $phase_end
        phase_name: $phase_name
      }
    ) {
      project_id
      project_phase_id
      phase_name
      phase_start
      phase_end
      is_current_phase
    }
  }
`;

export const DELETE_PROJECT_PHASE = gql`
  mutation DeleteProjectPhase($project_phase_id: Int!) {
    delete_moped_proj_phases_by_pk(project_phase_id: $project_phase_id) {
      project_phase_id
    }
  }
`;

export const ADD_PROJECT_PHASE = gql`
  mutation AddProjectPhase($objects: [moped_proj_phases_insert_input!]!) {
    insert_moped_proj_phases(objects: $objects) {
      returning {
        phase_name
        phase_start
        phase_end
        project_phase_id
        is_current_phase
        project_id
        completion_percentage
        completed
      }
    }
  }
`;

export const UPDATE_PROJECT_EXTENT = gql`
  mutation UpdateProjectExtent(
    $projectId: Int
    $editLayerIds: jsonb
    $editFeatureCollection: jsonb
  ) {
    update_moped_project(
      where: { project_id: { _eq: $projectId } }
      _set: {
        project_extent_geojson: $editFeatureCollection
        project_extent_ids: $editLayerIds
      }
    ) {
      affected_rows
    }
  }
`;

export const PROJECT_ACTIVITY_LOG = gql`
  query getMopedProjectChanges($projectId: Int!) {
    moped_activity_log(where: { record_project_id: { _eq: $projectId } }) {
      activity_id
      created_at
      record_project_id
      record_type
      description
      operation_type
      moped_user {
        first_name
        last_name
        user_id
      }
    }
  }
`;

export const PROJECT_ACTIVITY_LOG_DETAILS = gql`
  query getMopedProjectChanges($activityId: uuid!) {
    moped_activity_log(where: { activity_id: { _eq: $activityId } }) {
      activity_id
      created_at
      record_project_id
      record_type
      record_data
      description
      operation_type
      moped_user {
        first_name
        last_name
        user_id
      }
    }
  }
`;
