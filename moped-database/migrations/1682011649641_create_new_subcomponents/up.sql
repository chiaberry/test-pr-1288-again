INSERT INTO moped_subcomponents (subcomponent_name) values
    ('Continuous flow intersection'),
    ('Curb extension'),
    ('Detection - Bicycle'),
    ('Vehicle lane reconfiguration'),
    ('Protected intersection - Full'),
    ('Protected intersection - Full - Shared use'),
    ('Protected intersection - Partial'),
    ('Radius tightening'),
    ('Slip lane removal'),
    ('Smart right'),
    ('Intersection square-up'),
    ('Transit corner modification'),
    ('Bicycle accommodations at PHB'),
    ('Bicycle signal (standard signal + bicycle signal sign)'),
    ('Bicycle signal face (experiment)'),
    ('Bicycle signal face (interim approval)'),
    ('Detection - Vehicle'),
    ('Leading bicycle interval'),
    ('Pedestrian signal head and pushbuttons'),
    ('Protected left turn phase'),
    ('Bikeway direction - Two-way'),
    ('Station design - Curbside with Bike Lane Bypass'),
    ('Station design - Floating with Bike Lane'),
    ('Station design - Island with Bike Lane Behind'),
    ('Station design - Shared with Bike Lane in Front'),
    ('Station design - Step-out with Shared Landing'),
    ('Station design - With SUP Behind'),
    ('Station design - With SUP in Front'),
    ('Bus stop consolidation'),
    ('Bus stop maintenance'),
    ('Bus stop modification'),
    ('Timing adjustment');

-- add enhanced bus stop component
INSERT INTO moped_components (component_name, component_subtype, line_representation, feature_layer_id)
        values('Transit', 'Bus Stop - Enhanced', FALSE, 5);

-- fix misc component capitaliation issues
UPDATE moped_components set component_subtype = 'Bus Stop' where component_subtype = 'Bus stop';
UPDATE moped_components set component_name = 'Bike Lane' where component_name = 'Bike lane';

-- rename APS subcomponent
UPDATE moped_subcomponents set subcomponent_name = 'Accessible pedestrian signal (APS)' where subcomponent_name = 'Audible push button';
