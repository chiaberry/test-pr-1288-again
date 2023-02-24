import { useMemo, useEffect } from "react";
import { Autocomplete } from "@material-ui/lab";
import { Controller } from "react-hook-form";
import { Icon, makeStyles, TextField } from "@material-ui/core";
import { featureSignalsRecordToKnackSignalRecord } from "src/utils/signalComponentHelpers";
import {
  RoomOutlined as RoomOutlinedIcon,
  Timeline as TimelineIcon,
} from "@material-ui/icons";

/**
 * Not all component type records have a value in the subtype column but let's concatenate them if they do
 * @param {string} component_name The name of the component
 * @param {string} component_subtype The name value in the component_subtype column of the component record
 * @returns {string}
 */
export const makeComponentLabel = ({ component_name, component_subtype }) => {
  return component_subtype
    ? `${component_name} - ${component_subtype}`
    : `${component_name}`;
};

/**
 * Take the moped_components records data response and create options for a MUI autocomplete
 * @param {Object} data Data returned with moped_components records
 * @returns {Array} The options with value, label, and full data object to produce the subcomponents options
 */
export const useComponentOptions = (data) =>
  useMemo(() => {
    if (!data) return [];

    const options = data.moped_components.map((comp) => ({
      value: comp.component_id,
      label: makeComponentLabel(comp),
      data: comp,
    }));

    return options;
  }, [data]);

/**
 * Take the data nested in the chosen moped_components option and produce a list of subcomponents options (if there are some)
 * for a MUI autocomplete
 * @param {Object} component Data stored in the currently selected component record
 * @returns {Array} The options with value and label
 */
export const useSubcomponentOptions = (component) =>
  useMemo(() => {
    const subcomponents = component?.data?.moped_subcomponents;

    if (!subcomponents) return [];

    const options = subcomponents.map((subComp) => ({
      value: subComp.subcomponent_id,
      label: subComp.subcomponent_name,
    }));

    return options;
  }, [component]);

/**
 * Take the moped_phases records data response and create options for a MUI autocomplete
 * @param {Object} data Data returned with moped_phases records
 * @returns {Array} The options with value, label, and full data object to produce the phases options
 */
export const usePhaseOptions = (data) =>
  useMemo(() => {
    if (!data) return [];

    const options = data.moped_phases.map((phase) => ({
      value: phase.phase_id,
      label: phase.phase_name,
      data: phase,
    }));

    return options;
  }, [data]);

/**
 * Take the moped_subphases records data response and create options for a MUI autocomplete
 * @param {Object} data Data returned with moped_subphases records
 * @returns {Array} The options with value, label, and full data object to produce the phases options
 */
export const useSubphaseOptions = (subphases) =>
  useMemo(() => {
    if (!subphases) return [];

    const options = subphases.map((subphase) => ({
      value: subphase.subphase_id,
      label: subphase.subphase_name,
      data: subphase,
    }));

    return options;
  }, [subphases]);

export const useInitialValuesOnAttributesEdit = (
  initialFormValues,
  setValue,
  componentOptions,
  subcomponentOptions,
  phaseOptions,
  subphaseOptions,
  areSignalOptionsLoaded
) => {
  // Set the selected component after the component options are loaded
  useEffect(() => {
    if (!initialFormValues) return;
    if (componentOptions.length === 0) return;

    setValue("component", {
      value: initialFormValues.component.component_id,
      label: componentOptions.find(
        (option) => option.value === initialFormValues.component.component_id
      ).label,
      data: {
        // Include component subcomponents and metadata about the internal_table needed for the form
        ...initialFormValues.component.moped_components,
      },
    });
  }, [componentOptions, initialFormValues, setValue]);

  // Set the selected signal if this is a signal component
  useEffect(() => {
    if (!initialFormValues) return;
    const internalTable =
      initialFormValues.component?.moped_components?.feature_layer
        ?.internal_table;
    const isSignalComponent = internalTable === "feature_signals";
    if (!isSignalComponent) return;
    if (!areSignalOptionsLoaded) return;

    const componentSignal = initialFormValues.component?.feature_signals?.[0];
    const knackFormatSignalOption =
      featureSignalsRecordToKnackSignalRecord(componentSignal);

    setValue("signal", knackFormatSignalOption);
  }, [initialFormValues, areSignalOptionsLoaded, setValue]);

  // Set the selected subcomponent after the subcomponent options are loaded
  useEffect(() => {
    if (!initialFormValues) return;
    if (subcomponentOptions.length === 0) return;
    if (initialFormValues.subcomponents.length === 0) return;

    const selectedSubcomponents = initialFormValues.subcomponents.map(
      (subcomponent) => ({
        value: subcomponent.subcomponent_id,
        label: subcomponentOptions.find(
          (option) => option.value === subcomponent.subcomponent_id
        ).label,
      })
    );

    setValue("subcomponents", selectedSubcomponents);
  }, [subcomponentOptions, initialFormValues, setValue]);

  // Set the selected phase after the phase options are loaded
  useEffect(() => {
    if (!initialFormValues?.component?.moped_phase) return;
    if (phaseOptions.length === 0) return;

    setValue("phase", {
      value: initialFormValues.component?.moped_phase.phase_id,
      label: phaseOptions.find(
        (option) =>
          option.value === initialFormValues.component?.moped_phase.phase_id
      ).label,
      data: {
        // Include component subcomponents and metadata about the internal_table needed for the form
        ...initialFormValues.component?.moped_phase,
      },
    });
  }, [phaseOptions, initialFormValues, setValue]);

  // Set the selected subphase after the subphase options are loaded
  useEffect(() => {
    if (!initialFormValues?.component?.moped_subphase) return;
    if (subphaseOptions.length === 0) return;

    setValue("subphase", {
      value: initialFormValues.component?.moped_subphase?.subphase_id,
      // if there is no matching subphase (e.g., you changed the phase), return null
      label: subphaseOptions.find(
        (option) =>
          option.value ===
          initialFormValues.component?.moped_subphase.subphase_id
      )?.label,
      data: {
        // Include component subcomponents and metadata about the internal_table needed for the form
        ...initialFormValues.component?.moped_subphase,
      },
    });
  }, [subphaseOptions, initialFormValues, setValue]);

  // Set the description once
  useEffect(() => {
    if (!initialFormValues) return;

    setValue("description", initialFormValues.description);
  }, [initialFormValues, setValue]);
};

const useComponentOptionWithIconStyles = makeStyles((theme) => ({
  iconContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing(1),
    color: theme.palette.primary.main,
  },
}));

/**
 * Renders an option with icon based on the type of geometry (if it exists) and component type label
 * @param {Object} option - Autocomplete option object with label, value, and data about component type
 * @return {JSX.Element}
 */
export const ComponentOptionWithIcon = ({ option }) => {
  const classes = useComponentOptionWithIconStyles();
  const { data: { line_representation = null } = {} } = option;

  return (
    <>
      <span className={classes.iconContainer}>
        {line_representation === true && <TimelineIcon />}
        {line_representation === false && <RoomOutlinedIcon />}
        {/* Fall back to a blank icon to keep labels lined up */}
        {line_representation === null && <Icon />}
      </span>{" "}
      {option.label}
    </>
  );
};

export const ControlledAutocomplete = ({
  id,
  options,
  renderOption,
  name,
  control,
  label,
  autoFocus = false,
  multiple = false,
  disabled,
}) => (
  <Controller
    id={id}
    name={name}
    control={control}
    render={({ onChange, value, ref }) => (
      <Autocomplete
        options={options}
        multiple={multiple}
        getOptionLabel={(option) => option?.label || ""}
        getOptionSelected={(option, value) => option?.value === value?.value}
        renderOption={renderOption}
        value={value}
        disabled={disabled}
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
