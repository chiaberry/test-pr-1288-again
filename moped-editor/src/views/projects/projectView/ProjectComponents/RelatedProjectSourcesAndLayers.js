import { Source, Layer } from "react-map-gl";
import { MAP_STYLES } from "./mapStyleSettings";
import { useFeatureTypes } from "./utils/map";

/**
 * Component that renders feature collection of related project component features
 * All layers are set to show below basemap street labels using beforeId = "street-labels"
 * @param {Object} featureCollection - GeoJSON feature collection with all project features
 * @param {Boolean} shouldShowRelatedProjects - should we show related projects
 * @returns JSX.Element
 */
const RelatedProjectSourcesAndLayers = ({
  featureCollection,
  shouldShowRelatedProjects,
  clickedComponent,
}) => {
  const projectLines = useFeatureTypes(featureCollection, "line");
  const projectPoints = useFeatureTypes(featureCollection, "point");

  const shouldShowNonMutedFeatures =
    shouldShowRelatedProjects && !clickedComponent;
  const shouldShowMutedFeatures =
    shouldShowRelatedProjects && !!clickedComponent;

  return (
    <>
      <Source
        id="related-project-lines"
        type="geojson"
        data={projectLines}
        promoteId="id"
      >
        <Layer
          beforeId="street-labels"
          {...{
            ...MAP_STYLES["related-project-lines"].layerProps,
            layout: {
              ...MAP_STYLES["related-project-lines"].layerProps.layout,
              visibility: shouldShowNonMutedFeatures ? "visible" : "none",
            },
          }}
        />
        <Layer
          beforeId="street-labels"
          id="related-lines-muted"
          {...{
            ...MAP_STYLES["project-lines-muted"].layerProps,
            layout: {
              ...MAP_STYLES["project-lines-muted"].layerProps.layout,
              visibility: shouldShowMutedFeatures ? "visible" : "none",
            },
          }}
        />
      </Source>

      <Source
        id="related-project-points"
        type="geojson"
        data={projectPoints}
        promoteId="id"
      >
        <Layer
          beforeId="street-labels"
          {...{
            ...MAP_STYLES["related-project-points"].layerProps,
            layout: {
              ...MAP_STYLES["related-project-points"].layerProps.layout,
              visibility: shouldShowNonMutedFeatures ? "visible" : "none",
            },
          }}
        />
        <Layer
          beforeId="street-labels"
          id="related-points-muted"
          {...{
            ...MAP_STYLES["project-points-muted"].layerProps,
            layout: {
              visibility: shouldShowMutedFeatures ? "visible" : "none",
            },
          }}
        />
      </Source>
    </>
  );
};

export default RelatedProjectSourcesAndLayers;
