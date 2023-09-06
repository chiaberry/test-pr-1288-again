ALTER TABLE moped_proj_milestones ADD COLUMN completion_percentage integer;
ALTER TABLE moped_proj_milestones ADD COLUMN milestone_status text;
ALTER TABLE moped_proj_milestones ADD COLUMN milestone_privacy boolean;
ALTER TABLE moped_proj_milestones ADD COLUMN milestone_priority integer;
ALTER TABLE moped_proj_milestones ADD COLUMN milestone_date_type text;
ALTER TABLE moped_proj_milestones ADD COLUMN milestone_start date;
ALTER TABLE moped_proj_milestones ADD COLUMN milestone_related_phase_id int;
ALTER TABLE moped_proj_milestones ADD COLUMN is_current_milestone boolean;
ALTER TABLE moped_proj_milestones ADD COLUMN started_by_user_id integer;
ALTER TABLE moped_proj_milestones ADD COLUMN completed_by_user_id integer;
ALTER TABLE moped_proj_milestones RENAME COLUMN description to milestone_description;
ALTER TABLE moped_proj_milestones RENAME COLUMN end_date to milestone_end;
ALTER TABLE moped_proj_milestones RENAME COLUMN end_date_estimate to milestone_estimate;
