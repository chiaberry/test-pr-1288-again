ALTER TABLE moped_city_fiscal_years ADD COLUMN id integer;
ALTER TABLE moped_city_fiscal_years DROP CONSTRAINT moped_city_fiscal_years_pkey;
UPDATE moped_city_fiscal_years set id = fiscal_year_value::integer - 2015 where 1 = 1;
ALTER TABLE moped_city_fiscal_years ALTER COLUMN id SET NOT NULL;
CREATE SEQUENCE city_fiscal_years_id_seq AS INT INCREMENT BY 1 START WITH 7 OWNED BY moped_city_fiscal_years.id;
ALTER TABLE moped_city_fiscal_years ALTER COLUMN id SET default nextval('city_fiscal_years_id_seq');
ALTER TABLE moped_city_fiscal_years ADD CONSTRAINT moped_city_fiscal_years_pkey PRIMARY KEY (id);

-- ✅ This is the form of a working, tested INSERT
-- insert into moped_city_fiscal_years (fiscal_year_value, fiscal_year_start_date, fiscal_year_end_date, active_fy) values ('2038', null, null, true);

ALTER TABLE moped_phases DROP CONSTRAINT moped_phases_phase_id_key;
DROP SEQUENCE IF EXISTS moped_phases_phase_id_seq; -- There is an existing, unused sequence. Just drop it and recreate.
CREATE SEQUENCE moped_phases_phase_id_seq AS INT INCREMENT BY 1 START WITH 13 OWNED BY moped_phases.phase_id;
ALTER TABLE moped_phases ALTER COLUMN phase_id SET default nextval('moped_phases_phase_id_seq');

-- ✅ This is the form of a working, tested INSERT
-- insert into moped_phases (phase_name, phase_description, phase_order, phase_average_length, required_phase)  values ('a name', 'a description', 0, 1, true);