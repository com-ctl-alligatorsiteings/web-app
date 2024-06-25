function viewFullScreen(url) {
    const fullScreenModal = document.createElement('div');
    fullScreenModal.classList.add('full-screen-modal');
    fullScreenModal.innerHTML = `
        <span class="close" onclick="document.body.removeChild(this.parentNode)">←</span>
        <img src="${url}" class="full-screen-image">
    `;
    document.body.appendChild(fullScreenModal);
}

function getUserIP() {
    return fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(data => data.ip)
        .catch(error => {
            console.error('Error getting IP address:', error);
            return 'UNKNOWN_IP';
        });
}

function openInGoogleMaps(lat, lng) {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    window.open(url, '_blank');
}

function openInAppleMaps(lat, lng) {
    const url = `http://maps.apple.com/?q=${lat},${lng}`;
    window.open(url, '_blank');
}

function checkNearbySightings(userLocation) {
    db.collection('sightings').get().then(querySnapshot => {
        querySnapshot.forEach(doc => {
            const sighting = doc.data();
            const distance = getDistance(userLocation, [sighting.latitude, sighting.longitude]);
            const notificationKey = `${sighting.latitude},${sighting.longitude}`;
            const currentTime = Date.now();
            const twentyFourHours = 24 * 60 * 60 * 1000;

            if (distance <= notificationRadius && (!notificationTimestamps[notificationKey] || (currentTime - notificationTimestamps[notificationKey]) > twentyFourHours)) {
                notificationTimestamps[notificationKey] = currentTime;
                alert('New sighting nearby!');
            }
        });
    });
}

function getDistance(loc1, loc2) {
    const [lat1, lon1] = loc1;
    const [lat2, lon2] = loc2;
    const R = 3958.8; // Radius of the Earth in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in miles
}

window.addEventListener('beforeunload', function(event) {
    if (settingsChanged) {
        event.preventDefault();
        event.returnValue = 'You have unsaved settings. Do you want to leave without saving?';
    }
});
