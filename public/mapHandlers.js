let map;
let currentLocation = null;

async function initMap() {
    await google.maps.importLibrary("marker");

    map = new google.maps.Map(document.getElementById('map-container'), {
        center: { lat: 20.773, lng: -156.01 },
        zoom: 12,
        mapId: '4f505fee87ba6a0b', // Replace with your actual map ID
    });

    map.addListener('click', (event) => {
        const coordinates = { lat: event.latLng.lat(), lng: event.latLng.lng() };
        currentLocation = { lat: coordinates.lat, lon: coordinates.lng };
        loadSightings();
    });

    // Attempt to get the user's current location
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
                // Fallback center if user denies location access or there's an error
                const fallbackCenter = { lat: 20.773, lng: -156.01 };
                map.setCenter(fallbackCenter);
                map.setZoom(12);
            }
        );
    } else {
        console.error('Geolocation is not supported by this browser.');
        // Fallback center if geolocation is not supported
        const fallbackCenter = { lat: 20.773, lng: -156.01 };
        map.setCenter(fallbackCenter);
        map.setZoom(12);
    }
}

function addUserLocationMarker(coordinates) {
    class PulsatingMarker extends google.maps.OverlayView {
        constructor(position) {
            super();
            this.position = position;
            this.div = null;
        }

        onAdd() {
            this.div = document.createElement('div');
            this.div.className = 'pulsating-marker';
            const panes = this.getPanes();
            panes.overlayLayer.appendChild(this.div);
        }

        draw() {
            const overlayProjection = this.getProjection();
            const position = overlayProjection.fromLatLngToDivPixel(this.position);
            const div = this.div;
            if (div) {
                div.style.left = position.x + 'px';
                div.style.top = position.y + 'px';
            }
        }

        onRemove() {
            if (this.div) {
                this.div.parentNode.removeChild(this.div);
                this.div = null;
            }
        }
    }

    const marker = new PulsatingMarker(new google.maps.LatLng(coordinates.lat, coordinates.lng));
    marker.setMap(map);
}

function addSightingMarker(coordinates) {
    const markerElement = document.createElement('div');
    markerElement.className = 'custom-marker';
    markerElement.innerHTML = '🐊';

    new google.maps.marker.AdvancedMarkerElement({
        position: coordinates,
        map: map,
        content: markerElement
    });
}

function centerMap(lat, lon) {
    const coordinates = { lat, lng: lon };
    map.setCenter(coordinates);
    map.setZoom(13);
    addUserLocationMarker(coordinates);
    hideElement(sightingsList);
    showElement(mapContainer);
}
