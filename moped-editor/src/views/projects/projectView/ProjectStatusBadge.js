import React from "react";
import { Chip } from "@material-ui/core";

import CancelOutlinedIcon from "@material-ui/icons/CancelOutlined";
import PauseCircleOutlineOutlinedIcon from "@material-ui/icons/PauseCircleOutlineOutlined";
import RemoveCircleOutlineOutlinedIcon from "@material-ui/icons/RemoveCircleOutlineOutlined";
import PlayCircleOutlineOutlinedIcon from "@material-ui/icons/PlayCircleOutlineOutlined";
import CheckCircleOutlineOutlinedIcon from "@material-ui/icons/CheckCircleOutlineOutlined";

import { makeStyles } from "@material-ui/styles";
import clsx from "clsx";

const defaultIcon = PlayCircleOutlineOutlinedIcon;

const getStyle = (theme, phase) => {
  if (theme === null) return null;

  const primary = theme.palette.text.primary;
  const white = theme.palette.common.white;

  const backgroundColors = {
    default: theme.palette.grey[300],
    warning: theme.palette.warning.light,
    success: theme.palette.success.main,
    info: theme.palette.info.dark,
    error: theme.palette.error.main,
  };

  const defaultBackgroundColor = backgroundColors.default;

  const styleMapping = {
    planned: {
      color: white,
      background: backgroundColors.success,
      icon: PlayCircleOutlineOutlinedIcon,
    },
    "preliminary engineering": {
      color: white,
      background: backgroundColors.success,
      icon: PlayCircleOutlineOutlinedIcon,
    },
    scoping: {
      color: white,
      background: backgroundColors.success,
      icon: PlayCircleOutlineOutlinedIcon,
    },
    "preliminary design": {
      color: white,
      background: backgroundColors.success,
      icon: PlayCircleOutlineOutlinedIcon,
    },
    design: {
      color: white,
      background: backgroundColors.success,
      icon: PlayCircleOutlineOutlinedIcon,
    },
    "pre-construction": {
      color: white,
      background: backgroundColors.success,
      icon: PlayCircleOutlineOutlinedIcon,
    },
    "bid/award/execution": {
      color: white,
      background: backgroundColors.success,
      icon: PlayCircleOutlineOutlinedIcon,
    },
    "construction-ready": {
      color: white,
      background: backgroundColors.success,
      icon: PlayCircleOutlineOutlinedIcon,
    },
    construction: {
      color: white,
      background: backgroundColors.success,
      icon: PlayCircleOutlineOutlinedIcon,
    },
    "post-construction": {
      color: white,
      background: backgroundColors.success,
      icon: PlayCircleOutlineOutlinedIcon,
    },
    potential: {
      color: primary,
      background: backgroundColors.warning,
      icon: RemoveCircleOutlineOutlinedIcon,
    },
    canceled: {
      color: white,
      background: backgroundColors.error,
      icon: CancelOutlinedIcon,
    },
    "on hold": {
      color: primary,
      background: backgroundColors.default,
      icon: PauseCircleOutlineOutlinedIcon,
    },
    "on-hold": {
      color: primary,
      background: backgroundColors.default,
      icon: PauseCircleOutlineOutlinedIcon,
    },
    complete: {
      color: white,
      background: backgroundColors.info,
      icon: CheckCircleOutlineOutlinedIcon,
    },
    default: {
      color: primary,
      background: defaultBackgroundColor,
      icon: defaultIcon,
    },
  };

  return styleMapping?.[phase] ?? styleMapping.default;
};

/**
 * Picks the right color based on the status-phase combination
 */
const useFontColorStyles = makeStyles(theme => ({
  root: {
    // Find text color
    color: props => {
      const phase = (props?.phase ?? "").toLowerCase();
      return getStyle(theme, phase).color;
    },
  },
}));

/**
 * Picks the right chip color based on status-phase combination
 */
const useChipStyles = makeStyles(theme => ({
  root: {
    marginLeft: "1rem",
    fontWeight: "500",
    fontSize: "16px",
    borderRadius: "2rem",
    height: "2.5rem",
    padding: ".5rem",

    // Find background color
    backgroundColor: props => {
      const status = props?.status ?? 0;
      const phase = props?.phase ?? "";

      // Phase Value
      const phaseValue = {
        planned: theme.palette.info.dark,
        potential: theme.palette.warning.light,
      };

      return status === 1
        ? Object.keys(phaseValue).includes(phase)
          ? phaseValue[phase]
          : theme.palette.primary.main
        : status === 4
        ? theme.palette.grey[300] // on hold
        : theme.palette.error.main; // cancelled
    },
  },
}));

/**
 * Renders a chip
 * @param {number} status - The status id of the current project
 * @param {string} phase - The current phase name of the project
 * @returns {JSX.Element}
 * @constructor
 */
const ProjectStatusBadge = ({ status, phase }) => {
  /**
   * Bundle style properties object
   */
  const styleProps = {
    status: status,
    phase: phase,
  };

  /**
   * Generate font, chip and icon classes
   */
  const chipClasses = useChipStyles(styleProps);
  const iconClasses = useFontColorStyles(styleProps);

  /**
   * Phase icon mapping to component objects
   */
  const phaseIcons = {
    canceled: CancelOutlinedIcon,
    "on hold": PauseCircleOutlineOutlinedIcon,
    potential: RemoveCircleOutlineOutlinedIcon,
    planned: PlayCircleOutlineOutlinedIcon,
    complete: CheckCircleOutlineOutlinedIcon,
  };

  /**
   * Returns the label given a status-phase combination
   * @param status
   * @param phase
   * @returns {string}
   */
  const getComponentMapName = (status, phase) =>
    status !== 1 ? (status === 4 ? "on hold" : "canceled") : phase;

  /**
   * Create an abstract component pointer
   */
  const ChipIcon = phaseIcons?.[getComponentMapName(status, phase)] ?? null;

  /**
   * Make sure the text in the chip is capital-case
   * @param {string} text - The contents of the chip text
   * @returns {string}
   */
  const capitalCase = text =>
    String(text)
      .charAt(0)
      .toUpperCase() +
    String(text)
      .toLowerCase()
      .substring(1);

  /**
   * Return the object
   */
  return (
    ChipIcon && (
      <Chip
        className={clsx(iconClasses.root, chipClasses.root)}
        icon={<ChipIcon className={iconClasses.root} />}
        label={capitalCase(getComponentMapName(status, phase))}
        color={"default"}
        onDelete={null}
        deleteIcon={null}
      />
    )
  );
};

export default ProjectStatusBadge;
