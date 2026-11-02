/* ==========================================================================
   Glamour Girl Hair — interactive location map (contact.html)
   --------------------------------------------------------------------------
   Uses Leaflet (loaded from a CDN in contact.html) with OpenStreetMap tiles.
   Features:
     - a marker + popup for each location (Durban and Johannesburg)
     - buttons that fly the map to a location, or show both at once
     - "Find my nearest location": asks the browser for the visitor's position
       (only when they press the button) and works out which location is closer
   If Leaflet cannot load (offline, blocked, etc.) the page falls back to
   plain Google Maps embeds so the visitor still gets a map.
   ========================================================================== */
(function () {
    'use strict';

    var mapEl = document.getElementById('map');
    if (!mapEl) { return; }

    /* the two locations — city-level coordinates (swap in street addresses when you have them) */
    var locations = {
        durban: { name: 'Durban', region: 'KwaZulu-Natal', lat: -29.8587, lng: 31.0218 },
        johannesburg: { name: 'Johannesburg', region: 'Gauteng', lat: -26.2041, lng: 28.0473 }
    };

    var statusEl = document.getElementById('map-status');
    function say(message) { if (statusEl) { statusEl.textContent = message; } }

    /* ---------- fallback: simple Google Maps embeds ---------- */
    function showFallback() {
        mapEl.textContent = '';
        mapEl.classList.add('map-fallback');
        Object.keys(locations).forEach(function (key) {
            var place = locations[key];
            var frame = document.createElement('iframe');
            frame.src = 'https://maps.google.com/maps?q=' + encodeURIComponent(place.name + ', South Africa') + '&output=embed';
            frame.title = 'Map of Glamour Girl Hair in ' + place.name;
            frame.loading = 'lazy';
            frame.referrerPolicy = 'no-referrer-when-downgrade';
            mapEl.appendChild(frame);
        });
        say('The interactive map could not load, so basic maps are shown instead.');
        Array.prototype.forEach.call(document.querySelectorAll('[data-map-focus], #map-show-all, #map-locate'), function (b) {
            b.disabled = true;
        });
    }

    if (typeof L === 'undefined') { showFallback(); return; }

    /* ---------- the interactive map ---------- */
    var map = L.map(mapEl, { scrollWheelZoom: false });   /* wheel-zoom off so the page can still scroll past the map */
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
    }).addTo(map);

    var markers = {};
    var bounds = [];
    Object.keys(locations).forEach(function (key) {
        var place = locations[key];
        var popup = document.createElement('div');
        var title = document.createElement('strong');
        title.textContent = 'Glamour Girl Hair \u2014 ' + place.name;
        var region = document.createElement('div');
        region.textContent = place.region + ', South Africa';
        var directions = document.createElement('a');
        directions.href = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(place.name + ', South Africa');
        directions.target = '_blank';
        directions.rel = 'noopener noreferrer';
        directions.textContent = 'Get directions';
        popup.appendChild(title);
        popup.appendChild(region);
        popup.appendChild(directions);

        markers[key] = L.marker([place.lat, place.lng], { title: place.name, alt: 'Glamour Girl Hair ' + place.name })
            .addTo(map)
            .bindPopup(popup);
        bounds.push([place.lat, place.lng]);
    });

    function showAll() {
        map.fitBounds(bounds, { padding: [40, 40] });
        map.closePopup();
        say('Showing both locations.');
    }

    function focusOn(key) {
        var place = locations[key];
        if (!place) { return; }
        map.flyTo([place.lat, place.lng], 11, { duration: 1.2 });
        markers[key].openPopup();
        say('Showing ' + place.name + '.');
    }

    showAll();

    Array.prototype.forEach.call(document.querySelectorAll('[data-map-focus]'), function (button) {
        button.addEventListener('click', function () { focusOn(button.getAttribute('data-map-focus')); });
    });
    var allButton = document.getElementById('map-show-all');
    if (allButton) { allButton.addEventListener('click', showAll); }

    /* ---------- nearest location (straight-line distance, haversine formula) ---------- */
    function distanceKm(lat1, lng1, lat2, lng2) {
        var toRad = function (deg) { return deg * Math.PI / 180; };
        var dLat = toRad(lat2 - lat1);
        var dLng = toRad(lng2 - lng1);
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    var locateButton = document.getElementById('map-locate');
    if (locateButton) {
        locateButton.addEventListener('click', function () {
            if (!navigator.geolocation) { say('Your browser does not support location finding.'); return; }
            say('Finding your location\u2026');
            navigator.geolocation.getCurrentPosition(function (position) {
                var lat = position.coords.latitude;
                var lng = position.coords.longitude;
                var nearest = null;
                var nearestDistance = Infinity;
                Object.keys(locations).forEach(function (key) {
                    var d = distanceKm(lat, lng, locations[key].lat, locations[key].lng);
                    if (d < nearestDistance) { nearestDistance = d; nearest = key; }
                });
                focusOn(nearest);
                say('Your nearest location is ' + locations[nearest].name + ' (about ' + Math.round(nearestDistance) + ' km away in a straight line).');
            }, function () {
                say('We could not get your location. You can still pick a location with the buttons above.');
            }, { timeout: 10000 });
        });
    }
})();
