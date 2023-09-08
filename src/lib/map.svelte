<script>
  import "ol/ol.css";

  import Map from "ol/Map";
  import View from "ol/View";
  import TileLayer from "ol/layer/Tile";
  import OSM from "ol/source/OSM";
  import XYZ from "ol/source/XYZ";
  import { defaults as defaultControls } from "ol/control";

  import MyCustomControl from "./ol-custom-control";

  let viewDiv = "map";
  let map = null;

  const view = new View({
    center: [0, 0],
    zoom: 1,
  });

  const mapLayers = [
    new TileLayer({
      source: new OSM(),
    }),
    new TileLayer({
      source: new XYZ({
        url: "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
        attributions: "Google",
      }),
    }),
  ];
  let mapLayerIndex = 0;

  // Hide all layers except the first one
  mapLayers.forEach((layer, index) => {
    if (index > 0) layer.setVisible(false);
  });

  const switchLayer = () => {
    mapLayers[mapLayerIndex].setVisible(false);
    mapLayerIndex++;
    if (mapLayerIndex === mapLayers.length) mapLayerIndex = 0;
    mapLayers[mapLayerIndex].setVisible(true);
  };

  const setupMap = (node, _id) => {
    map = new Map({
      target: _id,
      layers: mapLayers,
      view: view,
      controls: defaultControls().extend([new MyCustomControl()]),
    });

    return {
      destroy() {
        if (map) {
          map.setTarget(null);
          map = null;
        }
      },
    };
  };
</script>

<div id={viewDiv} class="map" use:setupMap={viewDiv} />

<div id="footer">
  <div id="controls">
    <button type="button" on:click={switchLayer}>Switch maps</button>
  </div>
</div>

<style>
  :global(.my-custom-control) {
    top: 65px;
    left: 0.5em;
  }

  .map {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 50px;
  }
  #footer {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    height: 40px;
    display: flex;
  }
  #controls {
    padding-left: 2em;
    padding-right: 2em;
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
  }
</style>
