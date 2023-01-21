import React from "react";
import { Box, Typography, makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  entryText: {
    padding: "0 0 0 .5rem",
  },
  boldText: {
    fontWeight: 600,
  },
}));

const ProjectActivityEntry = ({
  changeIcon,
  changeDescription,
  changeValue,
  changeText,
}) => {
  const classes = useStyles();

  if (changeText) {
    return (
      <Box display="flex" p={0}>
        <Box p={0}>{changeIcon}</Box>
        <Box p={0} flexGrow={1}>
          <Typography variant="body2" className={classes.entryText}>
            {changeText.map((changeObject) => (
              <span className={classes[changeObject.style]}>
                {changeObject.text}
              </span>
            ))}
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box display="flex" p={0}>
      <Box p={0}>{changeIcon}</Box>
      <Box p={0} flexGrow={1}>
        <Typography variant="body2" className={classes.entryText}>
          {changeDescription}
          {!!changeValue && (
            <span className={classes.boldText}>{changeValue}</span>
          )}
        </Typography>
      </Box>
    </Box>
  );
};

export default ProjectActivityEntry;
