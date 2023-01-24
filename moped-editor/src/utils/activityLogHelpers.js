import { formatProjectActivity } from "./activityLogFormatters/mopedProjectActivity";
import { formatTagsActivity } from "./activityLogFormatters/mopedTagsActivity";
import { formatFundingActivity } from "./activityLogFormatters/mopedFundingActivity";
import { formatPartnersActivity } from "./activityLogFormatters/mopedPartnersActivity";

export const formatActivityLogEntry = (change, lookupData) => {
  const changeDescription = "Project was updated";
  const changeValue = "";
  const changeIcon = (
    <span className="material-symbols-outlined">summarize</span>
  );

  switch (change.record_type) {
    case "moped_project":
      // if the user is changing the public process status id field,
      // provide the publicProcessStatusList lookup object
      if (change?.description[0]?.field === "public_process_status_id") {
        return formatProjectActivity(
          change,
          lookupData.publicProcessStatusList
        );
      }
      // otherwise, provide the entityList lookup object
      else {
        return formatProjectActivity(change, lookupData.entityList);
      }
    case "moped_proj_tags":
      return formatTagsActivity(change, lookupData.tagList);
    case "moped_proj_funding":
      return formatFundingActivity(change, lookupData.fundingSources, lookupData.fundingPrograms);
    case "moped_proj_partners":
      return formatPartnersActivity(change, lookupData.entityList);
    default:
      return { changeIcon, changeDescription, changeValue };
  }
};
