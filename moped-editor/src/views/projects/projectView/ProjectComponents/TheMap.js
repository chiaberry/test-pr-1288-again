import { useState, useMemo } from "react";
import MapGL from "react-map-gl";
import { cloneDeep } from "lodash";
import FeaturePopup from "./FeaturePopup";
import GeocoderControl from "src/components/Maps/GeocoderControl";
import BasemapSpeedDial from "./BasemapSpeedDial";
import ComponentDrawTools from "./ComponentDrawTools";
import { basemaps, mapParameters, initialViewState } from "./mapSettings";
import { useFeatureTypes } from "./utils";
import { useAgolFeatures, findFeatureInAgolGeojsonFeatures } from "./agolUtils";
import {
  BaseMapSourceAndLayers,
  interactiveLayerIds,
  useComponentFeatureCollection,
  ProjectComponentsSourcesAndLayers,
} from "./mapUtils";
import "mapbox-gl/dist/mapbox-gl.css";
import { isDrawnFeature, makeCapturedFromLayerFeature } from "./featureUtils";

// See https://github.com/visgl/react-map-gl/issues/1266#issuecomment-753686953
import mapboxgl from "mapbox-gl";
mapboxgl.workerClass =
  // eslint-disable-next-line import/no-webpack-loader-syntax
  require("worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker").default;

// returns geojson of features across all components
const useProjectFeatures = (components) =>
  useMemo(() => {
    const allComponentfeatures = [];
    components.forEach((component) =>
      allComponentfeatures.push(component.features)
    );

    return {
      type: "FeatureCollection",
      features: allComponentfeatures.flat(),
    };
  }, [components]);

const useDraftComponentFeatures = (draftComponent) =>
  useMemo(() => {
    return {
      type: "FeatureCollection",
      features: draftComponent?.features || [],
    };
  }, [draftComponent]);

export default function TheMap({
  setHoveredOnMapFeature,
  hoveredOnMapFeature,
  components,
  isEditingComponent,
  draftComponent,
  setDraftComponent,
  mapRef,
  clickedProjectFeature,
  setClickedProjectFeature,
  clickedComponent,
  setClickedComponent,
  linkMode,
  setIsFetchingFeatures,
}) {
  const [cursor, setCursor] = useState("grab");

  const [bounds, setBounds] = useState();
  const [basemapKey, setBasemapKey] = useState("streets");
  const [isDrawing, setIsDrawing] = useState(false);
  const projectFeatures = useProjectFeatures(components);

  const draftComponentFeatures = useDraftComponentFeatures(draftComponent);
  const draftLayerId = `draft-component-${linkMode}`;

  const componentFeatureCollection =
    useComponentFeatureCollection(clickedComponent);

  const currentZoom = mapRef?.current?.getZoom();
  const { ctnLinesGeojson, ctnPointsGeojson } = useAgolFeatures(
    linkMode,
    setIsFetchingFeatures,
    currentZoom,
    bounds
  );

  const projectLines = useFeatureTypes(projectFeatures, "line");
  const projectPoints = useFeatureTypes(projectFeatures, "point");

  const onMouseEnter = (e) => {
    // hover states conflict! the first feature to reach hover state wins
    // so set point radii and line widths accordingly
    setCursor("pointer");

    e.features.forEach((feature) => {
      if (feature.layer.id.includes("project")) {
        // it's a project feature, so add to the hover tracking for sidebar interaction
        setHoveredOnMapFeature(feature);
      }
      // mapRef.current?.setFeatureState(feature, { hover: true });
    });
  };

  const onMouseLeave = (e) => {
    setCursor("grab");
    setHoveredOnMapFeature(null);
    // e.features.forEach((feature) => {
    //   mapRef.current?.setFeatureState(feature, { hover: false });
    //   // setHoveredOnMapFeatureId(null);
    // });
  };

  const onClick = (e) => {
    if (e.features.length === 0) {
      // clear clickedComponent if map is clicked elsewhere
      if (clickedComponent) {
        setClickedComponent(null);
      }
      return;
    }

    /* If not editing, handle click on project feature */
    if (!isEditingComponent) {
      const clickedProjectFeature = e.features.find((feature) =>
        feature.layer.id.includes("project")
      );
      if (!clickedProjectFeature) {
        return;
      }
      setClickedProjectFeature(clickedProjectFeature);
      return;
    }

    /* We're editing, so handle add/remove draft component feature */
    const newDraftComponent = cloneDeep(draftComponent);
    const clickedDraftComponentFeature = e.features.find(
      (feature) => feature.layer.id === draftLayerId
    );

    // If we clicked a drawn feature, we don't need to capture from the CTN layers
    if (isDrawnFeature(clickedDraftComponentFeature)) return;

    if (clickedDraftComponentFeature) {
      // remove project feature, ignore underlying CTN features
      const filteredFeatures = draftComponent.features.filter((compFeature) => {
        return !(
          compFeature.properties.id ===
            clickedDraftComponentFeature.properties.id &&
          compFeature.properties._layerId ===
            clickedDraftComponentFeature.properties._layerId
        );
      });
      newDraftComponent.features = filteredFeatures;
      setDraftComponent(newDraftComponent);
      return;
    }

    // if multiple features are clicked, we ignore all but one
    const clickedFeature = e.features[0];
    const featureFromAgolGeojson = findFeatureInAgolGeojsonFeatures(
      clickedFeature,
      linkMode,
      ctnLinesGeojson,
      ctnPointsGeojson
    );

    const newFeature = makeCapturedFromLayerFeature(
      featureFromAgolGeojson,
      clickedFeature,
      ctnLinesGeojson
    );

    newDraftComponent.features.push(newFeature);
    setDraftComponent(newDraftComponent);
    // setHoveredOnMapFeatureId(newFeature.properties.id);
  };

  const onMoveEnd = (e) => {
    const newBounds = mapRef.current.getBounds().toArray();
    setBounds(newBounds.flat());
  };

  // This is a temporary to get data into the map sources
  const data = {
    draftComponentFeatures,
    ctnLinesGeojson,
    ctnPointsGeojson,
    projectLines,
    projectPoints,
  };

  return (
    <MapGL
      ref={mapRef}
      initialViewState={initialViewState}
      interactiveLayerIds={interactiveLayerIds}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onMoveEnd={onMoveEnd}
      onClick={onClick}
      boxZoom={false}
      cursor={cursor}
      mapStyle={basemaps[basemapKey].mapStyle}
      {...mapParameters}
    >
      <BasemapSpeedDial basemapKey={basemapKey} setBasemapKey={setBasemapKey} />
      <GeocoderControl position="top-left" marker={false} />
      <ComponentDrawTools
        setDraftComponent={setDraftComponent}
        linkMode={linkMode}
        setCursor={setCursor}
        setIsDrawing={setIsDrawing}
      />
      <BaseMapSourceAndLayers basemapKey={basemapKey} />
      <ProjectComponentsSourcesAndLayers
        data={data}
        isEditingComponent={isEditingComponent}
        isDrawing={isDrawing}
        linkMode={linkMode}
        draftLayerId={draftLayerId}
        clickedComponent={clickedComponent}
        componentFeatureCollection={componentFeatureCollection}
      />
      <FeaturePopup
        onClose={() => setClickedProjectFeature(null)}
        feature={clickedProjectFeature}
        components={components}
        setClickedComponent={setClickedComponent}
      />
    </MapGL>
  );
}
