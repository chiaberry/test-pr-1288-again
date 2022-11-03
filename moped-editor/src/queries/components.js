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
      feature_layer_id
      moped_subcomponents(order_by: { subcomponent_name: asc }) {
        subcomponent_id
        subcomponent_name
      }
    }
  }
`;

export const ADD_PROJECT_COMPONENT = gql`
  mutation AddProjectComonent($object: moped_proj_components_insert_input!) {
    insert_moped_proj_components_one(object: $object) {
      component_id
      description
      interim_project_component_id
      is_deleted
      name
      project_component_id
      project_id
      moped_proj_components_subcomponents
    }
  }
`;

const object = {
  description: "",
  is_deleted: false,
  component_id: 10,
  project_id: 10,
  moped_proj_components_subcomponents: {
    data: {
      subcomponent_id: 10,
    },
  },
};
