alter table "public"."moped_proj_components_subcomponents" add column "status_id" int4;
alter table "public"."moped_proj_components_subcomponents" alter column "status_id" drop not null;
alter table "public"."moped_proj_components_subcomponents" alter column "status_id" set default 0;
