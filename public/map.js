import { googleMapsApiKey } from './config.js';
import { loadSightings, loadNearbySightings } from './sightings.js';

export let map;
export let currentLocation = null;

export function initMap() {
    map = new google.maps.Map(document.getElementById('map-container'), {
        center: { lat: 20.773, lng: -156.01 },
        zoom: 12,
        mapId: 'YOUR_MAP_ID', // Replace with your actual map ID
    });

    map.addListener('click', (event) => {
        const coordinates = { lat: event.latLng.lat(), lng: event.latLng.lng() };
        currentLocation = { lat: coordinates.lat, lon: coordinates.lng };
        loadSightings();
    });

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const coordinates = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                map.setCenter(coordinates);
                map.setZoom(13);
                addUserLocationMarker(coordinates);
                loadNearbySightings();
                currentLocation = coordinates;
            },
            error => {
                console.error('Error getting location: ', error);
                const fallbackCenter = { lat: 20.773, lng: -156.01 };
                map.setCenter(fallbackCenter);
                map.setZoom(12);
            }
        );
    } else {
        console.error('Geolocation is not supported by this browser.');
        const fallbackCenter = { lat: 20.773, lng: -156.01 };
        map.setCenter(fallbackCenter);
        map.setZoom(12);
    }
}

export function addUserLocationMarker(coordinates) {
    const markerElement = document.createElement('div');
    markerElement.className = 'pulsating-marker';

    new google.maps.marker.AdvancedMarkerElement({
        position: coordinates,
        map: map,
        content: markerElement
    });
}

export function addSightingMarker(coordinates) {
    const markerElement = document.createElement('div');
    markerElement.className = 'custom-marker';
    markerElement.innerHTML = '🐊';

    new google.maps.marker.AdvancedMarkerElement({
        position: coordinates,
        map: map,
        content: markerElement
    });
}

export function centerMap(lat, lon) {
    const coordinates = { lat, lng: lon };
    map.setCenter(coordinates);
    map.setZoom(13);
    addUserLocationMarker(coordinates);
    hideElement(sightingsList);
    showElement(mapContainer);
}
