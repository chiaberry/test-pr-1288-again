alter table "public"."moped_entity" rename column "workgroup_name" to "entity_name";


INSERT INTO "public"."moped_entity"(entity_id, entity_name, organization_id, department_id, workgroup_id)
VALUES 
    --(1, 'COA ATD', 1, 1, null),
       (2, 'COA ATD Active Transportation & Street Design', 1, 1, 1),
       (3, 'COA ATD Arterial Management', 1, 1, 2),
       (4, 'COA ATD Development Review', 1, 1, 16),
       (5, 'COA ATD Right of Way', 1, 1, 11),
       (6, 'COA ATD Signs & Markings', 1, 1, 12),
       (7, 'COA ATD Systems Development', 1, 1, 14),
       (8, 'COA ATD Transportation Engineering', 1, 1, 15),
       (9, 'COA ATD Speed Management', 1, 1, 15),
       (10, 'COA ATD Project Delivery', 1, 1, NULL),
       (11, 'COA ATD Intersection Safety', 1, 1, NULL),
       (12, 'COA ATD Traffic Impact Analysis Fiscal', 1, 1, 15),
       (13, 'COA ATD Transit Enhancement', 1, 1, 15),
       (14, 'COA Aviation', 1, 6, NULL),
       (15, 'COA Corridor', 1, 2, NULL),
       (16, 'COA Development Services', 1, 10, NULL),
       (17, 'COA Economic Development', 1, 7, NULL),
       (18, 'COA Parks & Recreation', 1, 8, NULL),
       (19, 'COA Housing & Planning', 1, 5, NULL),
       (20, 'COA PWD', 1, 3, NULL),
       (21, 'COA PWD Neighborhood Partnering', 1, 3, 18),
       (22, 'COA PWD Sidewalks & Special Projects', 1, 3, 22),
       (23, 'COA PWD Safe Routes to School', 1, 3, 20),
       (24, 'COA PWD Urban Trails', 1, 3, 19),
       (25, 'COA Watershed', 1, 9, NULL),
       (26, 'Capital Metro Transportation Authority', 2, NULL, NULL),
       (27, 'Central Texas Regional Mobility Authority', 3, NULL, NULL),
       (28, 'State of Texas', 4, NULL, NULL),
       (29, 'City of Sunset Valley', 5, NULL, NULL),
       (30, 'Travis County', 6, NULL, NULL),
       (31, 'Texas Department of Transportation', 7, NULL, NULL),
       (32, 'Williamson County', 8, NULL, NULL),
       (33, 'Private Developer', 9, NULL, NULL),
       (34, 'Private Partner', 10, NULL, NULL),
       (35, 'Private Partner - Hill Country Conservancy', 11, NULL, NULL),
       (36, 'Private Partner - Mueller Foundation', 12, NULL, NULL);

INSERT INTO "public"."moped_entity"(entity_id, entity_name, organization_id, department_id, workgroup_id)
  VALUES (1, 'COA ATD', 1, 1, null)
  ON CONFLICT ON CONSTRAINT moped_entities_entity_id_key
    DO UPDATE SET 
        entity_name =  EXCLUDED.entity_name, 
        organization_id =  EXCLUDED.organization_id, 
        department_id =  EXCLUDED.department_id, 
        workgroup_id =  EXCLUDED.workgroup_id;

