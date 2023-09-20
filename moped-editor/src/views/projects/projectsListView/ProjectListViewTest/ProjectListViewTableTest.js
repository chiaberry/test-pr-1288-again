import React, { useState, useEffect } from "react";
import { NavLink as RouterLink, useLocation } from "react-router-dom";

import { Box, Card, CircularProgress, Container, Paper } from "@mui/material";

import makeStyles from "@mui/styles/makeStyles";
import typography from "../../../../theme/typography";

import GridTableToolbar from "src/components/GridTable/GridTableToolbar";
import GridTableSearch from "src/components/GridTable/GridTableSearch";
import Pagination from "./Pagination";
import ApolloErrorHandler from "src/components/ApolloErrorHandler";
import ProjectStatusBadge from "../../projectView/ProjectStatusBadge";
import ExternalLink from "src/components/ExternalLink";
import RenderSignalLink from "../../signalProjectTable/RenderSignalLink";

import MaterialTable, { MTableBody, MTableHeader } from "@material-table/core";
import { filterProjectTeamMembers as renderProjectTeamMembers } from "../helpers.js";
import { getSearchValue } from "src/utils/gridTableHelpers";
import { formatDateType, formatTimeStampTZType } from "src/utils/dateAndTime";
import parse from "html-react-parser";
import { useGetProjectListView } from "./dataProvider/useGetProjectListView";
import { useGetProjectListViewWithLibrary } from "./dataProvider/useGetProjectListViewWithLibrary";

/**
 * GridTable Style
 */
const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    "& .MuiTableCell-head:nth-of-type(2)": {
      left: "0px",
      position: "sticky",
    },
  },
  paper: {
    width: "100%",
    marginBottom: theme.spacing(1),
  },
  table: {
    minWidth: 750,
  },
  tableCell: {
    "text-transform": "capitalize",
    "white-space": "pre-wrap",
  },
  noResults: {
    paddingTop: "25px",
    paddingBottom: "16px",
  },
  colorPrimary: {
    color: theme.palette.primary.main,
  },
}));

/**
 * Default column display (if no config in local storage)
 */
const DEFAULT_HIDDEN_COLS = {
  project_id: false,
  project_name: false,
  current_phase: false,
  project_team_members: true,
  project_lead: false,
  project_sponsor: false,
  project_partner: true,
  ecapris_subproject_id: false,
  updated_at: false,
  project_feature: true, // signal_ids
  task_order: true,
  type_name: true,
  funding_source_name: true,
  project_note: true,
  construction_start_date: false,
  completion_end_date: false,
  project_inspector: true,
  project_designer: true,
  contractors: true,
  contract_numbers: true,
  project_tags: false,
  added_by: true,
  public_process_status: true,
  interim_project_id: true,
};

/**
 * Keeps localStorage column config in sync with UI interactions
 * @param {Object} column - the MT column config with the `field` prop - aka the column name
 * @param {Bool} hidden - the hidden state of the column
 */
const handleColumnChange = ({ field }, hidden) => {
  let storedConfig = JSON.parse(localStorage.getItem("mopedColumnConfig"));
  storedConfig = { ...storedConfig, [field]: hidden };
  localStorage.setItem("mopedColumnConfig", JSON.stringify(storedConfig));
};

/**
 * GridTable Search Capability plus Material Table
 * @param {Object} query - The GraphQL query configuration
 * @param {String} searchTerm - The initial term
 * @return {JSX.Element}
 * @constructor
 */
const ProjectsListViewTableTest = ({ query, searchTerm }) => {
  const classes = useStyles();

  /**
   * The default sorting properties applied to the table.
   * This overrides MaterialTable props and determines how
   * the table is sorted when the page loads. Must remain consistent
   * with the sorting order passed in from ProjectsListViewQueryConf.
   * @property {string} column - The column name in graphql to sort by
   * @property {integer} columnId - The column id in graphql to sort by
   * @property {string} order - Either "asc" or "desc" or ""
   */
  const defaultSortingProperties = {
    column: "updated_at",
    columnId: 8,
    order: "desc",
  };

  /**
   * Stores the column name and the order to order by
   * @type {Object} sort
   * @function setSort - Sets the state of sort
   * @default {defaultSortingProperties}
   */
  const [sort, setSort] = useState(defaultSortingProperties);

  /**
   * Stores the string to search for and the column to search against
   * @type {Object} search
   * @property {string} value - The string to be searched for
   * @property {string} column - The name of the column to search against
   * @function setSearch - Sets the state of search
   * @default {{value: "", column: ""}}
   */
  const [search, setSearch] = useState({
    value: searchTerm ?? "",
    column: "",
  });

  // anchor element for advanced search popper in GridTableSearch to "attach" to
  // State is handled here so we can listen for changes in a useeffect in this component
  const [advancedSearchAnchor, setAdvancedSearchAnchor] = useState(null);

  // create URLSearchParams from url
  const filterQuery = new URLSearchParams(useLocation().search);

  /**
   * if filter exists in url, decodes base64 string and returns as object
   * Used to initialize filter state
   * @return Object if valid JSON otherwise false
   */
  const getFilterQuery = () => {
    if (Array.from(filterQuery).length > 0) {
      try {
        return JSON.parse(atob(filterQuery.get("filter")));
      } catch {
        return false;
      }
    }
    return false;
  };

  /**
   * Stores objects storing a random id, column, operator, and value.
   * @type {Object} filters
   * @function setFilter - Sets the state of filters
   * @default {if filter in url, use those params, otherwise {}}
   */
  const [filters, setFilter] = useState(getFilterQuery() || {});

  const [hiddenColumns, setHiddenColumns] = useState(
    JSON.parse(localStorage.getItem("mopedColumnConfig")) ?? DEFAULT_HIDDEN_COLS
  );

  /**
   * Query Management
   */
  // Manage the ORDER BY clause of our query
  query.setOrder(sort.column, sort.order);

  // Resets the value of "where" "and" "or" to empty
  query.cleanWhere();

  // If we have a search value in state, initiate search
  // GridTableSearchBar in GridTableSearch updates search value
  if (search.value && search.value !== "") {
    /**
     * Iterate through all column keys, if they are searchable
     * add the to the Or list.
     */
    Object.keys(query.config.columns)
      .filter((column) => query.config.columns[column]?.searchable)
      .forEach((column) => {
        const { operator, quoted, envelope } =
          query.config.columns[column].search;
        const searchValue = getSearchValue(query, column, search.value);
        const graphqlSearchValue = quoted
          ? `"${envelope.replace("{VALUE}", searchValue)}"`
          : searchValue;

        query.setOr(column, `${operator}: ${graphqlSearchValue}`);
      });
  }

  // For each filter added to state, add a where clause in GraphQL
  // Advanced Search
  Object.keys(filters).forEach((filter) => {
    let { envelope, field, gqlOperator, value, type, specialNullValue } =
      filters[filter];

    // If we have no operator, then there is nothing we can do.
    if (field === null || gqlOperator === null) {
      return;
    }

    if (gqlOperator.includes("is_null")) {
      // Some fields when empty are not null but rather an empty string or "None"
      if (specialNullValue) {
        gqlOperator = envelope === "true" ? "_eq" : "_neq";
        value = specialNullValue;
      } else {
        value = envelope;
      }
    } else {
      if (value !== null) {
        // If there is an envelope, insert value in envelope.
        value = envelope ? envelope.replace("{VALUE}", value) : value;

        // If it is a number or boolean, it does not need quotation marks
        // Otherwise, add quotation marks for the query to identify as string
        value = type in ["number", "boolean"] ? value : `"${value}"`;
      } else {
        // We don't have a value
        return;
      }
    }
    query.setWhere(field, `${gqlOperator}: ${value}`);
  });

  /**
   * Returns a ProjectStatusBadge component based on the status and phase of project
   * @param {string} phase - A project's current phase
   * @param {number} statusId - Project's status id
   * @return {JSX.Element}
   */
  const buildStatusBadge = ({ phaseName, phaseKey }) => (
    <ProjectStatusBadge phaseName={phaseName} phaseKey={phaseKey} condensed />
  );
  // Data Management
  // const { data, loading, error } = useQuery(
  //   query.gql,
  //   query.config.options.useQuery
  // );

  const columns = [
    {
      title: "ID",
      field: "project_id",
      hidden: hiddenColumns["project_id"],
    },
    {
      title: "Name",
      field: "project_name",
      hidden: hiddenColumns["project_name"],
      render: (entry) => (
        <RouterLink
          to={`/moped/projects/${entry.project_id}`}
          state={{
            filters: Object.keys(filters).length
              ? btoa(JSON.stringify(filters))
              : false,
          }}
          className={classes.colorPrimary}
        >
          {entry.project_name}
        </RouterLink>
      ),
      cellStyle: {
        position: "sticky",
        left: 0,
        backgroundColor: "white",
        minWidth: "20rem",
        zIndex: 1,
      },
    },
    {
      title: "Status",
      field: "current_phase",
      hidden: hiddenColumns["current_phase"],
      render: (entry) =>
        buildStatusBadge({
          phaseName: entry.current_phase,
          phaseKey: entry.current_phase_key,
        }),
    },
    {
      title: "Team",
      field: "project_team_members",
      hidden: hiddenColumns["project_team_members"],
      cellStyle: { whiteSpace: "noWrap" },
      render: (entry) =>
        renderProjectTeamMembers(
          entry.project_team_members,
          "projectsListView"
        ),
    },
    {
      title: "Lead",
      field: "project_lead",
      hidden: hiddenColumns["project_lead"],
      editable: "never",
      cellStyle: { whiteSpace: "noWrap" },
      render: (entry) =>
        entry.project_lead === null ? "-" : entry.project_lead,
    },
    {
      title: "Sponsor",
      field: "project_sponsor",
      hidden: hiddenColumns["project_sponsor"],
      editable: "never",
      cellStyle: { whiteSpace: "noWrap" },
      render: (entry) =>
        entry.project_sponsor === "None" ? "-" : entry.project_sponsor,
    },
    {
      title: "Partners",
      field: "project_partner",
      hidden: hiddenColumns["project_partner"],
      emptyValue: "-",
      cellStyle: { whiteSpace: "noWrap" },
      render: (entry) => {
        return entry.project_partner.split(",").map((partner) => (
          <span key={partner} style={{ display: "block" }}>
            {partner}
          </span>
        ));
      },
    },
    {
      title: "eCAPRIS ID",
      field: "ecapris_subproject_id",
      hidden: hiddenColumns["ecapris_subproject_id"],
      render: (entry) => (
        <ExternalLink
          text={entry.ecapris_subproject_id}
          url={`https://ecapris.austintexas.gov/index.cfm?fuseaction=subprojects.subprojectData&SUBPROJECT_ID=${entry.ecapris_subproject_id}`}
        />
      ),
    },
    {
      title: "Modified",
      field: "updated_at",
      hidden: hiddenColumns["updated_at"],
      render: (entry) => formatTimeStampTZType(entry.updated_at),
    },
    {
      title: "Signal IDs",
      field: "project_feature",
      hidden: hiddenColumns["project_feature"],
      sorting: false,
      render: (entry) => {
        if (!entry?.project_feature) {
          return "-";
        } else {
          const signals = entry.project_feature.filter(
            (signal) => signal.signal_id && signal.knack_id
          );
          return <RenderSignalLink signals={signals} />;
        }
      },
    },
    {
      title: "Task order",
      field: "task_order",
      hidden: hiddenColumns["task_order"],
      cellStyle: { whiteSpace: "noWrap" },
      emptyValue: "-",
      render: (entry) => {
        // Empty value won't work in some cases where task_order is an empty array.
        if (entry?.task_order.length < 1) {
          return "-";
        }
        // Render values as a comma seperated string
        return entry.task_order.map((taskOrder) => (
          <span key={taskOrder.task_order} style={{ display: "block" }}>
            {taskOrder.display_name}
          </span>
        ));
      },
    },
    {
      title: "Type",
      field: "type_name",
      hidden: hiddenColumns["type_name"],
      emptyValue: "-",
      cellStyle: { whiteSpace: "noWrap" },
      render: (entry) => {
        return entry.type_name.split(",").map((type_name) => (
          <span key={type_name} style={{ display: "block" }}>
            {type_name}
          </span>
        ));
      },
    },
    {
      title: "Funding",
      field: "funding_source_name",
      hidden: hiddenColumns["funding_source_name"],
      emptyValue: "-",
      cellStyle: { whiteSpace: "noWrap" },
      render: (entry) => {
        return entry.funding_source_name
          .split(",")
          .map((funding_source_name, i) => (
            <span key={i} style={{ display: "block" }}>
              {funding_source_name}
            </span>
          ));
      },
    },
    {
      title: "Status update",
      field: "project_note",
      hidden: hiddenColumns["project_note"],
      emptyValue: "-",
      cellStyle: { maxWidth: "30rem" },
      render: (entry) => parse(String(entry.project_note)),
    },
    {
      title: "Construction start",
      field: "construction_start_date",
      hidden: hiddenColumns["construction_start_date"],
      emptyValue: "-",
      render: (entry) => formatDateType(entry.construction_start_date),
    },
    {
      title: "Completion date",
      field: "completion_end_date",
      hidden: hiddenColumns["completion_end_date"],
      emptyValue: "-",
      render: (entry) => formatDateType(entry.completion_end_date),
    },
    {
      title: "Designer",
      field: "project_designer",
      hidden: hiddenColumns["project_designer"],
      emptyValue: "-",
    },
    {
      title: "Inspector",
      field: "project_inspector",
      hidden: hiddenColumns["project_inspector"],
      emptyValue: "-",
    },
    {
      title: "Contractors",
      field: "contractors",
      hidden: hiddenColumns["contractors"],
      emptyValue: "-",
      cellStyle: { whiteSpace: "noWrap" },
      render: (entry) => {
        return entry.contractors.split(",").map((contractor, i) => (
          <span key={i} style={{ display: "block" }}>
            {contractor}
          </span>
        ));
      },
    },
    {
      title: "Contract numbers",
      field: "contract_numbers",
      hidden: hiddenColumns["contract_numbers"],
      emptyValue: "-",
      cellStyle: { whiteSpace: "noWrap" },
      render: (entry) => {
        return entry.contract_numbers.split(",").map((contractNumber, i) => (
          <span key={i} style={{ display: "block" }}>
            {contractNumber}
          </span>
        ));
      },
    },
    {
      title: "Tags",
      field: "project_tags",
      hidden: hiddenColumns["project_tags"],
      cellStyle: { whiteSpace: "noWrap" },
      emptyValue: "-",
      render: (entry) => {
        return entry.project_tags.split(",").map((tag) => (
          <span key={tag} style={{ display: "block" }}>
            {tag}
          </span>
        ));
      },
    },
    {
      title: "Created by",
      field: "added_by",
      hidden: hiddenColumns["added_by"],
      emptyValue: "-",
    },
    {
      title: "Public process status",
      field: "public_process_status",
      hidden: hiddenColumns["public_process_status"],
      emptyValue: "-",
    },
    {
      title: "Interim MPD (Access) ID",
      field: "interim_project_id",
      hidden: hiddenColumns["interim_project_id"],
      emptyValue: "-",
    },
  ];

  const columnsToReturn = columns.map((column) => column.field);

  // const {
  //   data,
  //   loading,
  //   error,
  //   setQueryLimit,
  //   setQueryOffset,
  //   queryLimit,
  //   queryOffset,
  // } = useGetProjectListView({
  //   columnsToReturn,
  //   hiddenColumns,
  // });

  const {
    data,
    loading,
    error,
    setQueryLimit,
    setQueryOffset,
    queryLimit,
    queryOffset,
  } = useGetProjectListViewWithLibrary({ columnsToReturn, hiddenColumns });

  /**
   * Handles the header click for sorting asc/desc.
   * @param {int} columnId
   * @param {string} newOrderDirection
   * Note: this is a GridTable function that we are using to override a Material Table sorting function
   * Their function call uses two variables, columnId and newOrderDirection. We only need the columnId
   **/
  const handleTableHeaderClick = (columnId, newOrderDirection) => {
    // Before anything, let's clear all current conditions
    query.clearOrderBy();
    const columnName = columns[columnId]?.field;

    // Resets pagination to 0 when user clicks a header to display most relevant results
    setQueryOffset(0);
    // setPagination({
    //   limit: query.limit,
    //   offset: query.offset,
    //   page: 0,
    // });

    if (sort.column === columnName) {
      // If the current sortColumn is the same as the new
      // then invert values and repeat sort on column
      setSort({
        order: sort.order === "desc" ? "asc" : "desc",
        column: columnName,
        columnId: columnId,
      });
    } else if (sort.column !== columnName) {
      // Sort different column in same order as previous column
      setSort({
        order: sort.order,
        column: columnName,
        columnId: columnId,
      });
    }
  };

  /*
   * Store column configution before data change triggers page refresh
   * or opening advanced search dropdown triggers page refresh
   */
  useEffect(() => {
    const storedConfig = JSON.parse(localStorage.getItem("mopedColumnConfig"));
    if (storedConfig) {
      setHiddenColumns(storedConfig);
    }
  }, [data, advancedSearchAnchor]);

  return (
    <ApolloErrorHandler error={error}>
      <Container maxWidth={false} className={classes.root}>
        {/*Toolbar Space*/}
        <GridTableToolbar>
          <GridTableSearch
            parentData={data}
            query={query}
            searchState={{
              searchParameters: search,
              setSearchParameters: setSearch,
            }}
            filterState={{
              filterParameters: filters,
              setFilterParameters: setFilter,
            }}
            filterQuery={filterQuery}
            advancedSearchAnchor={advancedSearchAnchor}
            setAdvancedSearchAnchor={setAdvancedSearchAnchor}
          />
        </GridTableToolbar>
        {/*Main Table Body*/}
        <Paper className={classes.paper}>
          <Box mt={3}>
            {loading ? (
              <CircularProgress />
            ) : data && data["project_list_view"] ? (
              <Card className={classes.root}>
                <MaterialTable
                  onChangeColumnHidden={handleColumnChange}
                  data={data["project_list_view"]}
                  columns={columns}
                  title=""
                  options={{
                    search: false,
                    rowStyle: {
                      fontFamily: typography.fontFamily,
                      fontSize: "14px",
                    },
                    // pageSize: Math.min(queryLimit, data[query.table].length),
                    headerStyle: {
                      // material table header row has a zIndex of 10, which
                      // is conflicting with the search/filter dropdown
                      zIndex: 1,
                      whiteSpace: "nowrap",
                    },
                    columnsButton: true,
                    idSynonym: "project_id",
                  }}
                  components={{
                    Pagination: (props) => (
                      <Pagination
                        data={data}
                        recordCount={
                          data["project_list_view_aggregate"].aggregate.count
                        }
                        queryLimit={queryLimit}
                        setQueryLimit={setQueryLimit}
                        queryOffset={queryOffset}
                        setQueryOffset={setQueryOffset}
                        rowsPerPageOptions={[250, 1000]}
                      />
                    ),
                    Header: (props) => (
                      <MTableHeader
                        {...props}
                        onOrderChange={handleTableHeaderClick}
                        orderBy={sort.columnId}
                        orderDirection={sort.order}
                      />
                    ),
                    Body: (props) => {
                      // see PR #639 https://github.com/cityofaustin/atd-moped/pull/639 for context
                      // we have configured MT to use local data but are technically using remote data
                      // this results in inconsistencies with how MT displays filtered data
                      const indexedData = data["project_list_view"].map(
                        (row, index) => ({
                          tableData: { id: index, uuid: row.project_id },
                          ...row,
                        })
                      );
                      return (
                        <MTableBody
                          {...props}
                          renderData={indexedData}
                          pageSize={indexedData.length}
                        />
                      );
                    },
                  }}
                />
              </Card>
            ) : (
              <span>{error ? error : "Could not fetch data"}</span>
            )}
          </Box>
        </Paper>
      </Container>
    </ApolloErrorHandler>
  );
};

export default ProjectsListViewTableTest;
