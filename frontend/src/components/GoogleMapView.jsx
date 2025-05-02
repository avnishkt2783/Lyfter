import React, { useEffect, useRef, useState } from "react";

const GoogleMapView = () => {
  const mapRef = useRef(null);
  const [startLocation, setStartLocation] = useState("Current Location");
  const [destination, setDestination] = useState("");
  const [map, setMap] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);
  const [useCurrentLocation, setUseCurrentLocation] = useState(true);
  const [startCoords, setStartCoords] = useState(null);
  const [selectingPointType, setSelectingPointType] = useState(null);
  const selectingPointRef = useRef(null);
  const [startMarker, setStartMarker] = useState(null);
  const [endMarker, setEndMarker] = useState(null);

  const [currentLocationMarker, setCurrentLocationMarker] = useState(null);

  const ICONS = {
    start: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
    end: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
  };

  const loadGoogleMapsScript = () => {
    return new Promise((resolve, reject) => {
      if (window.google) return resolve();

      const script = document.createElement("script");
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  useEffect(() => {
    loadGoogleMapsScript()
      .then(() => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const origin = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            setStartCoords(origin);

            const mapInstance = new window.google.maps.Map(mapRef.current, {
              zoom: 14,
              center: origin,
            });

            const renderer = new window.google.maps.DirectionsRenderer();
            renderer.setMap(mapInstance);
            setMap(mapInstance);
            setDirectionsRenderer(renderer);

            // Set current location marker
            const currentLocationMarker = new window.google.maps.Marker({
              position: origin,
              map: mapInstance,
              label: "You",
            });
            setCurrentLocationMarker(currentLocationMarker);

            mapInstance.addListener("click", (e) => {
              const selectedType = selectingPointRef.current;
              if (!selectedType) return;

              const geocoder = new window.google.maps.Geocoder();
              geocoder.geocode({ location: e.latLng }, (results, status) => {
                if (status === "OK" && results[0]) {
                  const address = results[0].formatted_address;

                  if (selectedType === "start") {
                    setStartLocation(address);
                    setUseCurrentLocation(false);
                    setStartCoords(e.latLng);
                  } else if (selectedType === "end") {
                    setDestination(address);
                  }

                  // Remove and place marker based on type
                  const markerOptions = {
                    position: e.latLng,
                    map: mapInstance,
                    icon: ICONS[selectedType],
                    label: selectedType === "start" ? "A" : "B",
                  };

                  if (selectedType === "start") {
                    if (startMarker) startMarker.setMap(null);
                    const marker = new window.google.maps.Marker(markerOptions);
                    setStartMarker(marker);
                  } else if (selectedType === "end") {
                    if (endMarker) endMarker.setMap(null);
                    const marker = new window.google.maps.Marker(markerOptions);
                    setEndMarker(marker);
                  }

                  setSelectingPointType(null);
                  selectingPointRef.current = null;
                } else {
                  alert("Failed to get address from map click.");
                }
              });
            });

            // Setup Autocomplete for start and destination input
            const startInput = document.getElementById("start-location");
            const destinationInput = document.getElementById(
              "destination-location"
            );

            const startAutocomplete =
              new window.google.maps.places.Autocomplete(startInput);
            const destinationAutocomplete =
              new window.google.maps.places.Autocomplete(destinationInput);

            startAutocomplete.addListener("place_changed", () => {
              const place = startAutocomplete.getPlace();
              if (place.geometry) {
                setStartCoords(place.geometry.location);
                setStartLocation(place.formatted_address);
              }
            });

            destinationAutocomplete.addListener("place_changed", () => {
              const place = destinationAutocomplete.getPlace();
              if (place.geometry) {
                setDestination(place.formatted_address);
              }
            });
          },
          (error) => {
            console.error("Geolocation error:", error);
            alert("Failed to get current location.");
          }
        );
      })
      .catch(() => {
        alert("Failed to load Google Maps script.");
      });
  }, []);

  const handleDirections = () => {
    if (!map || !destination || !directionsRenderer) return;

    if (startMarker) {
      startMarker.setMap(null);
      setStartMarker(null);
    }
    if (endMarker) {
      endMarker.setMap(null);
      setEndMarker(null);
    }

    const directionsService = new window.google.maps.DirectionsService();
    directionsRenderer.setDirections({ routes: [] });

    const geocodeAndRoute = (origin) => {
      directionsService.route(
        {
          origin,
          destination,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (response, status) => {
          if (status === "OK") {
            directionsRenderer.setDirections(response);
          } else {
            alert("Directions failed: " + status);
          }
        }
      );
    };

    if (useCurrentLocation && startCoords) {
      geocodeAndRoute(startCoords);
    } else {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: startLocation }, (results, status) => {
        if (status === "OK") {
          geocodeAndRoute(results[0].geometry.location);
        } else {
          alert("Geocoding failed: " + status);
        }
      });
    }
  };

  const handleClearMap = () => {
    if (directionsRenderer) {
      directionsRenderer.setDirections({ routes: [] });
    }

    if (startMarker) {
      startMarker.setMap(null);
      setStartMarker(null);
    }
    if (endMarker) {
      endMarker.setMap(null);
      setEndMarker(null);
    }

    // if (!useCurrentLocation && currentLocationMarker) {
    //   currentLocationMarker.setMap(null);
    // }

    setStartLocation("Current Location");
    setDestination("");
    setUseCurrentLocation(true);
    setStartCoords(null);
  };

  const handleSelectFromMap = (type) => {
    setSelectingPointType(type);
    selectingPointRef.current = type;
    // alert(`Click on the map to set the ${type} location`);
  };

  const handleUseCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const origin = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setStartCoords(origin);
        setUseCurrentLocation(true);
        setStartLocation("Current Location");

        // Remove previous "A" marker if exists and update current location
        if (currentLocationMarker) {
          currentLocationMarker.setPosition(origin);
        }

        if (startMarker) {
          startMarker.setMap(null);
          setStartMarker(null);
        }
        if (endMarker) {
          endMarker.setMap(null);
          setEndMarker(null);
        }
      },
      (error) => {
        alert("Failed to get current location.");
        console.error(error);
      }
    );
  };

  return (
    <div>
      <h3>Plan Your Route</h3>

      <div>
        <label>Start Location:</label>
        <input
          id="start-location"
          type="text"
          value={startLocation}
          onChange={(e) => {
            setStartLocation(e.target.value);
            setUseCurrentLocation(false);
          }}
          placeholder="Enter start location"
          style={{ padding: "10px", width: "300px", marginRight: "10px" }}
        />
        <button onClick={handleUseCurrentLocation}>Use Current Location</button>
        <button onClick={() => handleSelectFromMap("start")}>
          Show on Map
        </button>
      </div>

      <div>
        <label>Destination:</label>
        <input
          id="destination-location"
          type="text"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="Enter destination"
          style={{ padding: "10px", width: "300px", marginRight: "10px" }}
        />
        <button onClick={() => handleSelectFromMap("end")}>Show on Map</button>
      </div>

      <button onClick={handleDirections} style={{ marginTop: "20px" }}>
        Show Directions
      </button>

      <button
        onClick={handleClearMap}
        style={{ marginTop: "10px", marginLeft: "10px" }}
      >
        Clear Directions
      </button>

      <div ref={mapRef} style={{ height: "500px", marginTop: "20px" }}></div>
    </div>
  );
};

export default GoogleMapView;