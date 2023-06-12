import React from "react";
import { MobileDatePicker } from "@mui/x-date-pickers";
import { parseISO, format } from "date-fns";

/**
 * DateFieldEditComponent - renders a Date type Calendar select
 * @param {object} props - Values passed through Material Table `editComponent`
 * @return {JSX.Element}
 * @constructor
 */

const DateFieldEditComponent = ({ onChange, value }) => {
  const handleDateChange = (date) => {
    const newDate = date ? format(date, "yyyy-MM-dd") : null;
    debugger;
    onChange(newDate);
  };

  // the issue is that we want to use the value here but the onChange from the props
  // choose which to override and which to not
  return (
    <MobileDatePicker
      format="MM/dd/yyyy"
      value={value ? parseISO(value) : null}
      onChange={handleDateChange}
      InputProps={{ style: { minWidth: "100px" } }}
      slotProps={{ actionBar: { actions: ["accept", "cancel", "clear"] } }}
    />
  );
};

export default DateFieldEditComponent;
