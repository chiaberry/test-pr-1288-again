import React from "react";
import { Box, Grid, Link, Typography } from "@material-ui/core";

import ProjectSummaryLabel from "./ProjectSummaryLabel";

import { OpenInNew } from "@material-ui/icons";

/**
 * ProjectSummaryWorkOrders Component
 * @param {Number} projectId - The id of the current project being viewed
 * @param {Object} data - The data object from the GraphQL query
 * @param {function} refetch - The refetch function from apollo
 * @param {Object} classes - The shared style settings
 * @param {function} snackbarHandle - The function to show the snackbar
 * @returns {JSX.Element}
 * @constructor
 */
const ProjectSummaryWorkOrders = ({
  project,
  refetch,
  classes,
  snackbarHandle,
}) => {
  const knackProjectURL = project?.knack_project_id
    ? `https://atd.knack.com/amd#work-orders/?view_713_filters=%7B%22match%22%3A%22and%22%2C%22rules%22%3A%5B%7B%22field%22%3A%22field_4133%22%2C%22operator%22%3A%22is%22%2C%22value%22%3A%22${project.knack_project_id}%22%7D%5D%7D`
    : "";

  return knackProjectURL ? (
    <Grid item xs={12} className={classes.fieldGridItem}>
      <Typography className={classes.fieldLabel}>Work orders</Typography>
      <Box
        display="flex"
        justifyContent="flex-start"
        className={classes.fieldBox}
      >
        <ProjectSummaryLabel
          className={classes.fieldLabelLink}
          text={
            <Link
              className={classes.fieldLabelText}
              href={knackProjectURL}
              target={"_blank"}
            >
              {"View in Data Tracker"}
              <OpenInNew className={classes.linkIcon} />
            </Link>
          }
          classes={classes}
          spanClassName={classes.fieldLabelTextSpanNoBorder}
        />
      </Box>
    </Grid>
  ) : (
    <Grid item xs={12} className={classes.fieldGridItem} />
  );
};

export default ProjectSummaryWorkOrders;
