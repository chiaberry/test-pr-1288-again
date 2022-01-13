import React, { useState } from "react";
import {
  Box,
  Grid,
  Icon,
  Link,
  TextField,
  Typography,
} from "@material-ui/core";

import ProjectSummaryLabel from "./ProjectSummaryLabel";

import {
  PROJECT_UPDATE_ECAPRIS_SUBPROJECT_ID,
  PROJECT_CLEAR_ECAPRIS_SUBPROJECT_ID,
} from "../../../../queries/project";
import { useMutation } from "@apollo/client";
import { OpenInNew } from "@material-ui/icons";

/**
 * ProjectSummaryProjectECapris Component
 * @param {Number} projectId - The id of the current project being viewed
 * @param {Object} data - The data object from the GraphQL query
 * @param {function} refetch - The refetch function from apollo
 * @param {Object} classes - The shared style settings
 * @param {function} snackbarHandle - The function to show the snackbar
 * @returns {JSX.Element}
 * @constructor
 */
const ProjectSummaryProjectECapris = ({
  projectId,
  data,
  refetch,
  classes,
  snackbarHandle,
}) => {
  const originalECaprisValue =
    data?.moped_project?.[0]?.ecapris_subproject_id ?? null;

  const [editMode, setEditMode] = useState(false);
  const [eCapris, setECapris] = useState(originalECaprisValue);

  const [updateProjectECapris] = useMutation(
    PROJECT_UPDATE_ECAPRIS_SUBPROJECT_ID
  );

  const [clearProjectECapris] = useMutation(
    PROJECT_CLEAR_ECAPRIS_SUBPROJECT_ID
  );

  const isValidNumber = num => /^-{0,1}\d*\.{0,1}\d+$/.test(num);
  /**
   * Resets the project website to original value
   */
  const handleProjectECaprisClose = () => {
    setECapris(originalECaprisValue);
    setEditMode(false);
  };

  /**
   * Saves the new project website...
   */
  const handleProjectECaprisSave = () => {
    const isEmpty = (eCapris ?? "").length === 0;
    const validNumber = isValidNumber(eCapris);

    if (!isEmpty && !validNumber) {
      snackbarHandle(
        true,
        `Invalid eCapris value: ${eCapris} must be numeric.`,
        "error"
      );
      return;
    }

    (isEmpty
      ? clearProjectECapris({
          variables: {
            projectId: projectId,
          },
        })
      : updateProjectECapris({
          variables: {
            projectId: projectId,
            eCapris: Number(eCapris),
            capitallyFunded: validNumber,
          },
        })
    )
      .then(() => {
        setEditMode(false);
        refetch();
        snackbarHandle(
          true,
          "Project eCAPRIS Subproject ID updated!",
          "success"
        );
      })
      .catch(err => {
        snackbarHandle(
          true,
          "Failed to update eCAPRIS Subproject ID: " + String(err),
          "error"
        );
        handleProjectECaprisClose();
      });

    setEditMode(false);
  };

  /**
   * Updates the state of website
   * @param {Object} e - Event object
   */
  const handleProjectECaprisChange = e => {
    setECapris(e.target.value);
  };

  return (
    <Grid item xs={12} className={classes.fieldGridItem}>
      <Typography className={classes.fieldLabel}>
        eCAPRIS Subproject ID
      </Typography>
      <Box
        display="flex"
        justifyContent="flex-start"
        className={classes.fieldBox}
      >
        {editMode && (
          <>
            <TextField
              fullWidth
              id="moped-project-website"
              label={null}
              onChange={handleProjectECaprisChange}
              value={eCapris}
            />
            <Icon
              className={classes.editIconConfirm}
              onClick={handleProjectECaprisSave}
            >
              check
            </Icon>
            <Icon
              className={classes.editIconConfirm}
              onClick={handleProjectECaprisClose}
            >
              close
            </Icon>
          </>
        )}
        {!editMode && (
          <ProjectSummaryLabel
            text={
              (isValidNumber(eCapris) && (
                <Link
                  href={`https://ecapris.austintexas.gov/index.cfm?fuseaction=subprojects.subprojectData&SUBPROJECT_ID=${eCapris}`}
                  target={"_blank"}
                >
                  {eCapris} <OpenInNew className={classes.linkIcon} />
                </Link>
              )) ||
              "None"
            }
            classes={classes}
            onClickEdit={() => setEditMode(true)}
          />
        )}
      </Box>
    </Grid>
  );
};

export default ProjectSummaryProjectECapris;
