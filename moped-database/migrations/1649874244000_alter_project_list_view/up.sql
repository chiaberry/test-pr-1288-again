drop view project_list_view;

CREATE VIEW public.project_list_view AS
 SELECT mp.project_uuid,
    mp.project_id,
    mp.project_name,
    mp.project_description,
    mp.project_description_public,
    mp.ecapris_subproject_id,
    mp.project_importance,
    mp.project_order,
    mp.current_status,
    mp.timeline_id,
    mp.current_phase,
    mp.end_date,
    mp.project_length,
    mp.fiscal_year,
    mp.capitally_funded,
    mp.project_priority,
    mp.date_added,
    mp.added_by,
    mp.is_retired,
    mp.milestone_id,
    mp.task_order,
    COALESCE(mp.status_id, 0) AS status_id,
    string_agg(DISTINCT concat(mu.first_name, ' ', mu.last_name, ':', mpr.project_role_name), ','::text) AS project_team_members,
    mp.updated_at,
    me.entity_name AS project_sponsor,
    string_agg(DISTINCT me2.entity_name, ', '::text) AS project_partner,
        CASE
            WHEN ((mp.status_id = 0) OR (mp.status_id IS NULL)) THEN NULL::text
            WHEN (mp.status_id = 1) THEN mp.current_phase
            ELSE mp.current_status
        END AS status_name
   FROM ((((((public.moped_project mp
     LEFT JOIN public.moped_proj_personnel mpp ON (((mp.project_id = mpp.project_id) AND (mpp.status_id = 1))))
     LEFT JOIN public.moped_users mu ON ((mpp.user_id = mu.user_id)))
     LEFT JOIN public.moped_project_roles mpr ON ((mpp.role_id = mpr.project_role_id)))
     LEFT JOIN public.moped_entity me ON ((me.entity_id = mp.project_sponsor)))
     LEFT JOIN public.moped_proj_partners mpp2 ON (((mp.project_id = mpp2.project_id) AND (mpp2.status_id = 1))))
     LEFT JOIN public.moped_entity me2 ON ((mpp2.entity_id = me2.entity_id)))
  GROUP BY mp.project_uuid, mp.project_id, mp.project_name, mp.project_description, mp.project_description_public, mp.ecapris_subproject_id, mp.project_importance, mp.project_order, mp.current_status, mp.timeline_id, mp.current_phase, mp.end_date, mp.project_length, mp.fiscal_year, mp.capitally_funded, mp.project_priority, mp.date_added, mp.added_by, mp.is_retired, mp.milestone_id, mp.status_id, me.entity_name, mp.updated_at, mp.task_order;
