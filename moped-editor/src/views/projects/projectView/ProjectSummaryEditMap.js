import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import NewProjectMap from "../newProjectView/NewProjectMap";
import {
  AppBar,
  Button,
  IconButton,
  Dialog,
  makeStyles,
  Toolbar,
  Typography,
  Slide,
  CircularProgress,
} from "@material-ui/core";
import { Close as CloseIcon } from "@material-ui/icons";
import { UPDATE_PROJECT_EXTENT } from "../../../queries/project";

const useStyles = makeStyles(theme => ({
  appBar: {
    position: "relative",
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
  },
}));

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const ProjectSummaryMap = ({
  projectId,
  selectedLayerIds,
  projectExtentGeoJSON,
  isEditing,
  setIsEditing,
}) => {
  const classes = useStyles();
  const [updateProjectExtent, { data, loading, error }] = useMutation(
    UPDATE_PROJECT_EXTENT
  );
  const [editLayerIds, setEditLayerIds] = useState(selectedLayerIds);
  const [editFeatureCollection, setEditFeatureCollection] = useState(
    projectExtentGeoJSON
  );

  const handleClose = () => {
    setIsEditing(false);
  };

  const handleSave = () => {
    updateProjectExtent({
      variables: { projectId, editLayerIds, editFeatureCollection },
    });
    // TODO: Close full screen dialog on success
    // TODO: Handle error in mutation
  };

  return (
    <Dialog
      fullScreen
      open={isEditing}
      onClose={handleClose}
      TransitionComponent={Transition}
    >
      <AppBar className={classes.appBar}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleClose}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            Edit Map
          </Typography>
          {!loading ? (
            <Button autoFocus color="inherit" onClick={handleSave}>
              save
            </Button>
          ) : (
            <CircularProgress />
          )}
        </Toolbar>
      </AppBar>
      <NewProjectMap
        selectedLayerIds={editLayerIds}
        setSelectedLayerIds={setEditLayerIds}
        featureCollection={editFeatureCollection}
        setFeatureCollection={setEditFeatureCollection}
      />
    </Dialog>
  );
};

export default ProjectSummaryMap;
