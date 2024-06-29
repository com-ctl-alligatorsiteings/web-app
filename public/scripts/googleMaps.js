(function(g) {
    var h, a, k, p = "The Google Maps JavaScript API", c = "google", l = "importLibrary", q = "__ib__", m = document, b = window;
    b = b[c] || (b[c] = {});
    var d = b.maps || (b.maps = {}), r = new Set, e = new URLSearchParams, u = () => h || (h = new Promise(async (f, n) => {
      await (a = m.createElement("script"));
      e.set("libraries", [...r] + "");
      for (k in g) e.set(k.replace(/[A-Z]/g, t => "_" + t[0].toLowerCase()), g[k]);
      e.set("callback", c + ".maps." + q);
      a.src = `https://maps.${c}apis.com/maps/api/js?` + e;
      d[q] = f;
      a.onerror = () => h = n(Error(p + " could not load."));
      a.nonce = m.querySelector("script[nonce]")?.nonce || "";
      m.head.append(a);
    }));
    d[l] ? console.warn(p + " only loads once. Ignoring:", g) : d[l] = (f, ...n) => r.add(f) && u().then(() => d[l](f, ...n));
})({
    key: "AIzaSyDz4oi1qr71g5KNJRwdvlpfvWIWKbMktT4",
    v: "weekly",
    // Add other bootstrap parameters as needed, using camel case.
});

window.initMap = function() {
    const map = new google.maps.Map(document.getElementById('map-container'), {
        center: { lat: 0, lng: 0 },
        zoom: 2,
    });

    let userMarker = null;

    function updateUserLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };

                map.setCenter(pos);

                if (userMarker) {
                    userMarker.setPosition(pos);
                } else {
                    userMarker = new google.maps.Marker({
                        position: pos,
                        map: map,
                        title: 'Your Location',
                        icon: {
                            path: google.maps.SymbolPath.CIRCLE,
                            scale: 10,
                            fillColor: '#00f',
                            fillOpacity: 0.4,
                            strokeWeight: 0,
                        },
                        zIndex: 999,
                    });

                    const circle = new google.maps.Circle({
                        map: map,
                        radius: 100, // in meters
                        fillColor: '#00f',
                        fillOpacity: 0.2,
                        strokeColor: '#00f',
                        strokeOpacity: 0.6,
                        strokeWeight: 1,
                    });
                    circle.bindTo('center', userMarker, 'position');
                }
            }, () => {
                console.error('Error getting location.');
            });
        } else {
            console.error('Browser doesn\'t support Geolocation');
        }
    }

    // Update the user's location every 10 seconds
    updateUserLocation();
    setInterval(updateUserLocation, 10000);
};
