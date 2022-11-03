import React from "react";
import { useQuery } from "@apollo/client";
import { Controller, useForm } from "react-hook-form";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Grid,
  TextField,
} from "@material-ui/core";
import { CheckCircle } from "@material-ui/icons";
import { Autocomplete } from "@material-ui/lab";
import { makeStyles } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import { GET_COMPONENTS_FORM_OPTIONS } from "src/queries/components";
import {
  makeRandomComponentId,
  useComponentOptions,
  useSubcomponentOptions,
} from "./utils";

const useStyles = makeStyles((theme) => ({
  dialogTitle: {
    color: theme.palette.text.primary,
    fontFamily: theme.typography.fontFamily,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
}));

const initialFormValues = {
  component: {},
  subcomponents: [],
  description: "",
};

const ControlledAutocomplete = ({
  id,
  disabled = false,
  options,
  name,
  control,
  label,
  autoFocus = false,
  multiple = false,
}) => (
  <Controller
    id={id}
    name={name}
    control={control}
    render={({ onChange, value, ref }) => (
      <Autocomplete
        options={options}
        multiple={multiple}
        disabled={disabled}
        getOptionLabel={(option) => option?.label || ""}
        getOptionSelected={(option, value) => option?.value === value?.value}
        value={value}
        renderInput={(params) => (
          <TextField
            {...params}
            inputRef={ref}
            size="small"
            label={label}
            variant="outlined"
            autoFocus={autoFocus}
          />
        )}
        onChange={(_event, option) => onChange(option)}
      />
    )}
  />
);

const ComponentEditModal = ({
  showDialog,
  setShowDialog,
  setDraftComponent,
  setLinkMode,
  setIsEditingComponent,
}) => {
  const classes = useStyles();

  const { register, handleSubmit, control, reset, watch } = useForm({
    defaultValues: initialFormValues,
  });

  // Get and format component and subcomponent options
  const { data: optionsData, loading: areOptionsLoading } = useQuery(
    GET_COMPONENTS_FORM_OPTIONS
  );
  const componentOptions = useComponentOptions(optionsData);
  const { component } = watch();
  const subcomponentOptions = useSubcomponentOptions(component);

  const onSave = (formData) => {
    const {
      component: {
        data: {
          component_id,
          component_name,
          component_subtype,
          line_representation,
          feature_layer: { internal_table },
        },
      },
      subcomponents,
      description,
    } = formData;

    // TODO: Create helper to pass formData and create component data payload
    // TODO: Add DB view to get fields per table per feature
    // TODO: If it is a drawn feature, we need to insert in drawn tables

    const newComponent = {
      _id: makeRandomComponentId(),
      component_id,
      component_name,
      component_subtype,
      line_representation,
      internal_table,
      moped_subcomponents: subcomponents,
      description,
      label: component_name,
      features: [],
    };

    const linkMode = newComponent.line_representation ? "lines" : "points";

    setDraftComponent(newComponent);
    setLinkMode(linkMode);
    // switch to components tab
    setShowDialog(false);
  };

  const onClose = () => {
    setLinkMode(null);
    setDraftComponent(null);
    setIsEditingComponent(false);
    setShowDialog(false);
    reset(initialFormValues);
  };

  return (
    <Dialog open={showDialog} onClose={onClose} fullWidth>
      <DialogTitle disableTypography className={classes.dialogTitle}>
        <h3>New component</h3>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit(onSave)}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ControlledAutocomplete
                id="component"
                label="Component Type"
                options={areOptionsLoading ? [] : componentOptions}
                name="component"
                control={control}
                autoFocus
              />
            </Grid>
            <Grid item xs={12}>
              {/* Disabled unless there are subcomponents for the chosen component */}
              <ControlledAutocomplete
                id="subcomponents"
                label="Subcomponents"
                multiple
                disabled={subcomponentOptions.length === 0}
                options={subcomponentOptions}
                name="subcomponents"
                control={control}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                inputRef={register}
                fullWidth
                size="small"
                name="description"
                id="description"
                label={"Description"}
                InputLabelProps={{
                  shrink: true,
                }}
                variant="outlined"
                multiline
                minRows={4}
              />
            </Grid>
          </Grid>
          <Grid container spacing={4} display="flex" justifyContent="flex-end">
            <Grid item style={{ margin: 5 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<CheckCircle />}
                type="submit"
              >
                Continue
              </Button>
            </Grid>
          </Grid>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ComponentEditModal;
