import { useState } from "react";
import { useQuery, gql } from "@apollo/client";
import { ProjectActivityLogTableMaps } from "../views/projects/projectView/ProjectActivityLogTableMaps";
import { INITIAL_QUERY } from "../queries/placeholder";

/**
 * Takes an array of table names and uses ProjectActivityLogTableMaps to create a query for lookup tables
 * @param {array} tableNames - Names of table with field that requires a lookup
 * @return {query} A GraphQL query document parsed by gql.
 */
export const buildLookupQuery = tableNames => {
  const noLookupsObject = {
    areLookups: false,
    query: INITIAL_QUERY,
  };

  if (!tableNames || tableNames.length === 0) return noLookupsObject;

  const tablesMap = {};

  const lookupQueries = tableNames.map(tableName => {
    const fields = ProjectActivityLogTableMaps[tableName].fields;

    const lookupFields = Object.entries(fields).reduce(
      (acc, [primaryFieldName, fieldConfig]) => {
        return fieldConfig.hasOwnProperty("lookup")
          ? [...acc, { ...fieldConfig.lookup, primaryFieldName }]
          : [...acc];
      },
      []
    );

    // We need the field name from the original table here
    const tableQueries = lookupFields.map(field => {
      const { table, fieldLabel, fieldValues, primaryFieldName } = field;

      const fieldValuesAliasesAndFieldNames = fieldValues
        .map((fieldValue, i) => `value${i}: ${fieldValue}`)
        .join(" ");

      tablesMap[table] = tableName;

      // Alias table name as primary table field name and return foreign key and value
      return `
      ${primaryFieldName}: ${table} {
        key: ${fieldLabel}
        ${fieldValuesAliasesAndFieldNames}
      }
      `;
    });

    return tableQueries;
  });

  const flatLookupQueries = lookupQueries.flat();

  if (flatLookupQueries.length === 0) return noLookupsObject;

  const lookupQueriesString = flatLookupQueries.join(" ");

  const LOOKUPS_QUERY = gql`
    query RetrieveLookupValues { 
      ${lookupQueriesString} 
    }
  `;

  return { areLookups: true, query: LOOKUPS_QUERY, tablesMap };
};

/**
 * Take activity log response and return unique table names for lookup in project's log
 * @param {object} response - GraphQL response containing project record types (table names)
 * @param {string} lookupDataKey - The key in the response whose values is the lookup data
 * @return {array} Array of unique table names for log data lookups
 */
export const getActivityLogTableNames = (response, lookupDataKey) => {
  const lookupTableData = response?.[lookupDataKey];

  // would this length ever be more than one??
  if (!lookupTableData || lookupTableData.length === 0) return null;

  const tableNames = lookupTableData.map(record => record.record_type);

  return tableNames;
};

