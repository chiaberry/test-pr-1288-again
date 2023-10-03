import { useMemo } from "react";
import { gql } from "apollo-boost";

export const useGetProjectListView = ({
  columnsToReturn,
  queryLimit,
  queryOffset,
  orderByColumn,
  orderByDirection,
  searchWhereString,
  advancedSearchWhereString,
}) => {
  const query = useMemo(() => {
    return gql`{
        project_list_view (
            limit: ${queryLimit}
            offset: ${queryOffset}
            order_by: {${orderByColumn}: ${orderByDirection}}
            where: { 
              ${advancedSearchWhereString ? advancedSearchWhereString : ""}
              ${searchWhereString ? `_or: [${searchWhereString}]` : ""} 
            }
        ) {
            ${columnsToReturn.join("\n")}
        },
        project_list_view_aggregate (
          where: { 
            ${advancedSearchWhereString ? advancedSearchWhereString : ""}
            ${searchWhereString ? `_or: [${searchWhereString}]` : ""} 
          }
        ) {
          aggregate {
            count
          }
        }
      }`;
  }, [
    queryLimit,
    queryOffset,
    columnsToReturn,
    orderByColumn,
    orderByDirection,
    searchWhereString,
    advancedSearchWhereString,
  ]);

  return {
    query,
  };
};
