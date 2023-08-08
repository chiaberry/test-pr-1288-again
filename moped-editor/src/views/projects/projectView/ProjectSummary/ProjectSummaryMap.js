import React, { useCallback, useState } from "react";
import MapGL from "react-map-gl";
import { Box } from "@mui/material";
import ProjectSummaryMapFallback from "./ProjectSummaryMapFallback";
import BaseMapSourceAndLayers from "../ProjectComponents/BaseMapSourceAndLayers";
import BasemapSpeedDial from "../ProjectComponents/BasemapSpeedDial";
import ProjectSourcesAndLayers from "../ProjectComponents/ProjectSourcesAndLayers";
import RelatedProjectSourcesAndLayers from "../ProjectComponents/RelatedProjectSourcesAndLayers";
import {
  basemaps,
  mapParameters,
  initialViewState,
} from "../ProjectComponents/mapSettings";
import { useZoomToExistingComponents } from "../ProjectComponents/utils/map";
import { useAllComponentsFeatureCollection } from "../ProjectComponents/utils/makeFeatureCollections";
import { useProjectComponents } from "../ProjectComponents/utils/useProjectComponents";
import { useHavePlaceholderLayersLoaded } from "../ProjectComponents/utils/useWatchForPlaceholderLayers";
import { useMapRef } from "../ProjectComponents/utils/useMapRef";
import "mapbox-gl/dist/mapbox-gl.css";

const ProjectSummaryMap = ({ data }) => {
  const [mapRef, mapRefState] = useMapRef();
  const [basemapKey, setBasemapKey] = useState("streets");

  const { projectComponents, childComponents } = useProjectComponents(data);

  const projectComponentsFeatureCollection =
    useAllComponentsFeatureCollection(projectComponents);
  const childComponentsFeatureCollection =
    useAllComponentsFeatureCollection(childComponents);
  const projectAndChildComponentsFeatureCollection =
    useAllComponentsFeatureCollection([
      ...projectComponents,
      ...childComponents,
    ]);

  useZoomToExistingComponents(
    mapRefState,
    projectAndChildComponentsFeatureCollection,
    true
  );

  const areThereComponentFeatures =
    projectComponentsFeatureCollection.features.length > 0 ||
    childComponentsFeatureCollection.features.length > 0;

  const { checkIfMapHasPlaceHolderLayers, hasPlaceHolderLayers } =
    useHavePlaceholderLayersLoaded(mapRefState);

  return (
    <Box>
      {areThereComponentFeatures ? (
        <MapGL
          ref={mapRef}
          initialViewState={initialViewState}
          style={{ width: "100%", height: "60vh" }}
          mapStyle={basemaps.streets.mapStyle}
          {...mapParameters}
          cooperativeGestures={true}
          onLoad={checkIfMapHasPlaceHolderLayers}
        >
          <BasemapSpeedDial
            basemapKey={basemapKey}
            setBasemapKey={setBasemapKey}
          />
          <BaseMapSourceAndLayers basemapKey={basemapKey} />
          {hasPlaceHolderLayers && (
            <>
              <ProjectSourcesAndLayers
                isCreatingComponent={false}
                isEditingComponent={false}
                isDrawing={false}
                linkMode={null}
                clickedComponent={null}
                projectComponentsFeatureCollection={
                  projectComponentsFeatureCollection
                }
                draftEditComponent={null}
              />
              <RelatedProjectSourcesAndLayers
                isCreatingComponent={false}
                isEditingComponent={false}
                featureCollection={childComponentsFeatureCollection}
                shouldShowRelatedProjects={true}
                clickedComponent={null}
              />
            </>
          )}
        </MapGL>
      ) : (
        <ProjectSummaryMapFallback />
      )}
    </Box>
  );
};

export default ProjectSummaryMap;
