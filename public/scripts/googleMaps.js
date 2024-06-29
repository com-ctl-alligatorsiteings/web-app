import 'ol/ol.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';

// Initialize the map
const map = new Map({
  target: 'map-container',
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
  ],
  view: new View({
    center: fromLonLat([0, 0]), // Coordinates of the map center in EPSG:3857 projection
    zoom: 2, // Initial zoom level
  }),
});

let userMarker = null;
let userCircle = null;

function updateUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const pos = fromLonLat([position.coords.longitude, position.coords.latitude]);

      map.getView().setCenter(pos);

      if (userMarker) {
        userMarker.getGeometry().setCoordinates(pos);
      } else {
        userMarker = new Feature({
          geometry: new Point(pos),
        });

        userMarker.setStyle(
          new Style({
            image: new CircleStyle({
              radius: 10,
              fill: new Fill({
                color: 'rgba(0, 0, 255, 0.4)',
              }),
            }),
          })
        );

        const vectorSource = new VectorSource({
          features: [userMarker],
        });

        const vectorLayer = new VectorLayer({
          source: vectorSource,
        });

        map.addLayer(vectorLayer);

        userCircle = new Feature({
          geometry: new Point(pos),
        });

        userCircle.setStyle(
          new Style({
            stroke: new Stroke({
              color: '#00f',
              width: 1,
            }),
            fill: new Fill({
              color: 'rgba(0, 0, 255, 0.2)',
            }),
          })
        );

        const circleVectorSource = new VectorSource({
          features: [userCircle],
        });

        const circleVectorLayer = new VectorLayer({
          source: circleVectorSource,
        });

        map.addLayer(circleVectorLayer);
      }
    }, () => {
      console.error('Error getting location.');
    });
  } else {
    console.error("Browser doesn't support Geolocation");
  }
}

// Update the user's location every 10 seconds
updateUserLocation();
setInterval(updateUserLocation, 10000);
