import { db } from './firebaseConfig.js';
import { addSightingMarker, map, currentLocation } from './map.js';
import { hideElement, showElement } from './ui.js';

export function loadSightings() {
    sightingsList.innerHTML = '';
    db.collection('sightings').get().then(querySnapshot => {
        querySnapshot.forEach(doc => {
            const sighting = doc.data();
            const sightingElement = document.createElement('div');
            sightingElement.classList.add('sighting');
            sightingElement.innerHTML = `
                <div class="sighting-body">
                    <p>${sighting.description}</p>
                    <div class="sighting-media">
                        <img src="${sighting.downloadUrl}" alt="Sighting Image" onclick="viewFullScreen('${sighting.downloadUrl}')">
                    </div>
                </div>
                <div class="sighting-footer">
                    <span class="sighting-location">Location: (${sighting.latitude}, ${sighting.longitude})</span>
                    <span class="sighting-likes">Likes: ${sighting.likes}</span>
                    <span class="sighting-views">Views: ${sighting.views}</span>
                    <button class="like-button" data-id="${doc.id}">Like</button>
                    <button class="map-button" onclick="openInGoogleMaps(${sighting.latitude}, ${sighting.longitude})">Open in Google Maps</button>
                    <button class="map-button" onclick="openInAppleMaps(${sighting.latitude}, ${sighting.longitude})">Open in Apple Maps</button>
                    <button class="map-button" onclick="centerMap(${sighting.latitude}, ${sighting.longitude})">View on Map</button>
                </div>
            `;
            sightingsList.appendChild(sightingElement);

            const likeButton = sightingElement.querySelector('.like-button');
            likeButton.addEventListener('click', () => {
                likeSighting(doc.id);
            });

            addSightingMarker({ lat: sighting.latitude, lng: sighting.longitude });

            updateViewCount(doc.id);
        });
    });
}

export function loadNearbySightings() {
    sightingsList.innerHTML = '';
    const bounds = map.getBounds();
    const minX = bounds.getSouthWest().lng();
    const minY = bounds.getSouthWest().lat();
    const maxX = bounds.getNorthEast().lng();
    const maxY = bounds.getNorthEast().lat();

    db.collection('sightings').get().then(querySnapshot => {
        querySnapshot.forEach(doc => {
            const sighting = doc.data();
            if (sighting.longitude >= minX && sighting.longitude <= maxX && sighting.latitude >= minY && sighting.latitude <= maxY) {
                const sightingElement = document.createElement('div');
                sightingElement.classList.add('sighting');
                sightingElement.innerHTML = `
                    <div class="sighting-body">
                        <p>${sighting.description}</p>
                        <div class="sighting-media">
                            <img src="${sighting.downloadUrl}" alt="Sighting Image" onclick="viewFullScreen('${sighting.downloadUrl}')">
                        </div>
                    </div>
                    <div class="sighting-footer">
                        <span class="sighting-location">Location: (${sighting.latitude}, ${sighting.longitude})</span>
                        <span class="sighting-likes">Likes: ${sighting.likes}</span>
                        <span class="sighting-views">Views: ${sighting.views}</span>
                        <button class="like-button" data-id="${doc.id}">Like</button>
                        <button class="map-button" onclick="openInGoogleMaps(${sighting.latitude}, ${sighting.longitude})">Open in Google Maps</button>
                        <button class="map-button" onclick="openInAppleMaps(${sighting.latitude}, ${sighting.longitude})">Open in Apple Maps</button>
                        <button class="map-button" onclick="centerMap(${sighting.latitude}, ${sighting.longitude})">View on Map</button>
                    </div>
                `;
                sightingsList.appendChild(sightingElement);

                const likeButton = sightingElement.querySelector('.like-button');
                likeButton.addEventListener('click', () => {
                    likeSighting(doc.id);
                });

                addSightingMarker({ lat: sighting.latitude, lng: sighting.longitude });

                updateViewCount(doc.id);
            }
        });
    });
}
