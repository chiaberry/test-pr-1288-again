ALTER TABLE moped_phases ADD COLUMN phase_key text UNIQUE;
COMMENT ON COLUMN "public"."moped_phases"."phase_key" IS E'Unique machine-readable phase name';
UPDATE moped_phases set phase_key ='unknown' where phase_name = 'Unknown';
UPDATE moped_phases set phase_key ='preliminary_engineering' where phase_name = 'Preliminary engineering';
UPDATE moped_phases set phase_key ='scoping' where phase_name = 'Scoping';
UPDATE moped_phases set phase_key ='preliminary_design' where phase_name = 'Preliminary design';
UPDATE moped_phases set phase_key ='potential' where phase_name = 'Potential';
UPDATE moped_phases set phase_key ='planned' where phase_name = 'Planned';
UPDATE moped_phases set phase_key ='design' where phase_name = 'Design';
UPDATE moped_phases set phase_key ='construction_ready' where phase_name = 'Construction-ready';
UPDATE moped_phases set phase_key ='construction' where phase_name = 'Construction';
UPDATE moped_phases set phase_key ='post_construction' where phase_name = 'Post-construction';
UPDATE moped_phases set phase_key ='complete' where phase_name = 'Complete';
UPDATE moped_phases set phase_key ='bid_award_Execution' where phase_name = 'Bid/Award/Execution';
UPDATE moped_phases set phase_key ='pre_construction' where phase_name = 'Pre-construction';
UPDATE moped_phases set phase_key ='on_hold' where phase_name = 'On hold';
UPDATE moped_phases set phase_key ='canceled' where phase_name = 'Canceled';
ALTER TABLE moped_phases alter COLUMN phase_key set not null;
