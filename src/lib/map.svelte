<script lang="ts">
  import "ol/ol.css";

  import Map from "ol/Map";
  import View from "ol/View";
  import TileLayer from "ol/layer/Tile";
  import VectorLayer from "ol/layer/Vector";
  import VectorSource from "ol/source/Vector";
  import GeoJSON from "ol/format/GeoJSON";
  import { Style, Icon } from "ol/style";
  import OSM from "ol/source/OSM";
  import XYZ from "ol/source/XYZ";
  import { defaults as defaultControls } from "ol/control";

  import MyCustomControl from "./ol-custom-control";
  import { onMount } from "svelte";
  import Point from "ol/geom/Point";
  import { fromLonLat, toLonLat } from "ol/proj";
  import Feature from "ol/Feature";

  // ────────────────────────────────────────────────
  //  Map set-up
  // ────────────────────────────────────────────────
  const view = new View({
    center: [0, 0],
    zoom: 1,
  });

  /* Moving “restroom” symbol */
  const startingCoords = [-11.2082, 46.8139];      // lon, lat
  const restroomFeature = new Feature({
    geometry: new Point(fromLonLat(startingCoords)),
    name: "Moving Restroom",
  });

  const restroomsLayer = new VectorLayer({
    source: new VectorSource({ features: [restroomFeature] }),
    style: new Style({
      image: new Icon({
        src: "/static/gas-tank-droplet.svg",
        scale: 0.8,
        anchor: [0.5, 1],
      }),
    }),
    updateWhileAnimating: true,     // re-render during kinetic
    updateWhileInteracting: true,   // re-render while user drags
  });

  /* Base-layer carousel */
  const baseLayers = [
    new TileLayer({ source: new OSM() }),
    new TileLayer({
      source: new XYZ({
        url: "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
        attributions: "Google",
      }),
    }),
  ];
  let visibleIndex = 0;
  baseLayers.forEach((l, i) => i && l.setVisible(false));

  function switchLayer() {
    baseLayers[visibleIndex].setVisible(false);
    visibleIndex = (visibleIndex + 1) % baseLayers.length;
    baseLayers[visibleIndex].setVisible(true);
  }

  /* Map instance */
  let map: Map;

  function setupMap(node: HTMLElement, id: string) {
    map = new Map({
      target: id,
      // renderer: "webgpu",                // ✨  WebGPU instead of the default canvas
      layers: [...baseLayers, restroomsLayer],
      view,
      controls: defaultControls().extend([new MyCustomControl()]),
    });

    /* ------------------------------------------------
       Animation: run inside OL’s own render loop
       ------------------------------------------------*/
    let last = 0;
    map.on("postrender", (ev) => {
      const now = ev.frameState.time;        // ms since page load
      // if (!last) return;
      const dt = (now - last) / 1000;        // seconds since last frame      
      console.log(dt)
      if (dt >= 1/30) {
        // shift 30 m west per second ≈ 0.0004° lon
        const geom = restroomFeature.getGeometry() as Point;
        const coord = toLonLat(geom.getCoordinates());
        coord[0] -= 0.04 * dt;
        geom.setCoordinates(fromLonLat(coord));

        // tell OL we changed something and schedule next frame
        restroomsLayer.changed();
        last = now;
      }
      map.render();
    });

    return {
      destroy() {
        map?.setTarget(null);
        map = undefined;
      },
    };
  }
</script>

<!-- HTML markup -->
<div id="map" class="map" use:setupMap={"map"} />

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
    top: 0; left: 0; right: 0; bottom: 50px;
  }
  #footer {
    position: fixed;
    left: 0; right: 0; bottom: 0;
    height: 40px; display: flex;
  }
  #controls {
    padding: 0 2em;
    display: flex; align-items: center;
  }
</style>
