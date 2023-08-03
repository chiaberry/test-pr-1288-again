DELETE FROM moped_subcomponents where subcomponent_name = 'Continuous flow intersection';
DELETE FROM moped_subcomponents where subcomponent_name = 'Curb extension';
DELETE FROM moped_subcomponents where subcomponent_name = 'Detection - Bicycle';
DELETE FROM moped_subcomponents where subcomponent_name = 'Vehicle lane reconfiguration';
DELETE FROM moped_subcomponents where subcomponent_name = 'Protected intersection - Full';
DELETE FROM moped_subcomponents where subcomponent_name = 'Protected intersection - Full - Shared use';
DELETE FROM moped_subcomponents where subcomponent_name = 'Protected intersection - partial';
DELETE FROM moped_subcomponents where subcomponent_name = 'Radius tightening';
DELETE FROM moped_subcomponents where subcomponent_name = 'Slip lane removal';
DELETE FROM moped_subcomponents where subcomponent_name = 'Smart right';
DELETE FROM moped_subcomponents where subcomponent_name = 'Intersection square-up';
DELETE FROM moped_subcomponents where subcomponent_name = 'Transit corner modification';
DELETE FROM moped_subcomponents where subcomponent_name = 'Bicycle accommodations at PHB';
DELETE FROM moped_subcomponents where subcomponent_name = 'Bicycle signal (standard signal + bicycle signal sign)';
DELETE FROM moped_subcomponents where subcomponent_name = 'Bicycle signal face (experiment)';
DELETE FROM moped_subcomponents where subcomponent_name = 'Bicycle signal face (interim approval)';
DELETE FROM moped_subcomponents where subcomponent_name = 'Detection - vehicle';
DELETE FROM moped_subcomponents where subcomponent_name = 'Leading bicycle interval';
DELETE FROM moped_subcomponents where subcomponent_name = 'Pedestrian signal head and pushbuttons';
DELETE FROM moped_subcomponents where subcomponent_name = 'Protected left turn phase';
DELETE FROM moped_subcomponents where subcomponent_name = 'Timing adjustment';
DELETE FROM moped_subcomponents where subcomponent_name = 'Bikeway direction - Two-way';
DELETE FROM moped_subcomponents where subcomponent_name = 'Station design - Curbside with Bike Lane Bypass';
DELETE FROM moped_subcomponents where subcomponent_name = 'Station design - Floating with Bike Lane';
DELETE FROM moped_subcomponents where subcomponent_name = 'Station design - Island with Bike Lane Behind';
DELETE FROM moped_subcomponents where subcomponent_name = 'Station design - Shared with Bike Lane in Front';
DELETE FROM moped_subcomponents where subcomponent_name = 'Station design - Step-out with Shared Landing';
DELETE FROM moped_subcomponents where subcomponent_name = 'Station design - With SUP Behind';
DELETE FROM moped_subcomponents where subcomponent_name = 'Station design - With SUP in Front';
DELETE FROM moped_subcomponents where subcomponent_name = 'Bus stop consolidation';
DELETE FROM moped_subcomponents where subcomponent_name = 'Bus stop maintenance';
DELETE FROM moped_subcomponents where subcomponent_name = 'Bus stop modification';

DELETE FROM moped_components where component_name = 'Transit' and component_subtype = 'Bus Stop - Enhanced';

UPDATE moped_subcomponents set subcomponent_name = 'Audible push button' where subcomponent_name = 'Accessible pedestrian signal (APS)';
UPDATE moped_components set component_subtype = 'Bus stop' where component_subtype = 'Bus Stop';
UPDATE moped_components set component_name = 'Bike lane' where component_name = 'Bike Lane';
