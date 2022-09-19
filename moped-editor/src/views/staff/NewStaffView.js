import React from "react";
import StaffForm from "./StaffForm";
import { useNavigate } from "react-router-dom";
import { useUserApi } from "./helpers";
import * as yup from "yup";

import {
  Box,
  Container,
  Card,
  CardHeader,
  CardContent,
  Divider,
} from "@material-ui/core";
import Page from "src/components/Page";

export const initialFormValues = {
  first_name: "",
  last_name: "",
  title: "",
  email: "",
  password: "",
  workgroup: "",
  workgroup_id: "",
  roles: ["moped-viewer"],
};

const validationSchema = yup.object().shape({
  first_name: yup.string().required(),
  last_name: yup.string().required(),
  title: yup.string().required(),
  workgroup: yup.string().required(),
  workgroup_id: yup.string().required(),
  email: yup.string().required().email().lowercase(),
  password: yup.string().when("roles", {
    is: (val) => val !== "non-moped-user",
    then: yup.string().required(),
  }),
  roles: yup.string().required(),
});

const NewStaffView = () => {
  let navigate = useNavigate();

  const { loading, requestApi, error, setError, setLoading } = useUserApi();

  /**
   * Submit create user request
   * @param {Object} data - The data returned from user form to submit to the Moped API
   */
  const onFormSubmit = (data) => {
    // Navigate to user table on successful add/edit
    const callback = () => navigate("/moped/staff");

    console.log(data);

    // TODO: If roles === "non-moped-user":
    // 1. Use new add user mutation to add them to moped_users table
    // 2. Do not use the Moped API
    // 3. Down the line - create register user route and button to convert
    //    from non-Moped user to Moped user (that can log in & is in Cognito and DynamoDB)

    // requestApi({
    //   method: "post",
    //   path: "/users/",
    //   payload: data,
    //   callback,
    // });
  };

  return (
    <Page title="Staff">
      <Container maxWidth={false}>
        <Box mt={3}>
          <Card>
            <CardHeader title="Add User" />
            <Divider />
            <CardContent>
              <StaffForm
                initialFormValues={initialFormValues}
                onFormSubmit={onFormSubmit}
                userApiErrors={error}
                setUserApiError={setError}
                isUserApiLoading={loading}
                setIsUserApiLoading={setLoading}
                showUpdateUserStatusButtons={false}
                showFormResetButton={true}
                validationSchema={validationSchema}
              />
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Page>
  );
};

export default NewStaffView;
