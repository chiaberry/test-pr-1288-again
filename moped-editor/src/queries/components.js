import { gql } from "@apollo/client";

export const GET_COMPONENTS_FORM_OPTIONS = gql`
  query GetComponentsFormOptions {
    moped_components(
      order_by: [{ component_name: asc }, { component_subtype: asc }]
      where: { status_id: { _neq: 0 } }
    ) {
      component_id
      component_name
      component_subtype
      line_representation
      feature_layer {
        internal_table
      }
      moped_subcomponents(order_by: { subcomponent_name: asc }) {
        subcomponent_id
        subcomponent_name
      }
    }
  }
`;

export const ADD_PROJECT_COMPONENT = gql`
  mutation AddProjectComponent($object: moped_proj_components_insert_input!) {
    insert_moped_proj_components_one(object: $object) {
      component_id
    }
  }
`;

export const GET_PROJECT_COMPONENTS = gql`
  query GetProjectComponents($projectId: Int!) {
    moped_proj_components(
      where: { project_id: { _eq: $projectId }, is_deleted: { _eq: false } }
    ) {
      project_component_id
      component_id
      description
      moped_components {
        component_name
        component_subtype
        feature_layer {
          internal_table
        }
      }
      moped_proj_components_subcomponents {
        subcomponent_id
      }
      feature_street_segments {
        id
        geometry: geography
        source_layer
      }
      feature_intersections {
        id
        geometry: geography
        source_layer
      }
      feature_signals {
        id
        geometry: geography
        source_layer
      }
    }
    project_geography(
      where: { project_id: { _eq: $projectId }, is_deleted: { _eq: false } }
    ) {
      geometry: geography
      component_id
    }
  }
`;

// Probably can't reuse existing mutation
// Need to come up with how to handle conflicts
// export const UPDATE_PROJECT_COMPONENT = gql``;

// probably can use similar mutation to DELETE_MOPED_COMPONENT
// export const DELETE_PROJECT_COMPONENT = gql``;
