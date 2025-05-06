import React, { useEffect, useRef, useState, useContext } from "react";
import { darkMapStyle, lightMapStyle } from "../utils/MapStyles";
import { ThemeContext, useTheme } from "../ThemeContext";

const GoogleMapView = () => {
  const mapRef = useRef(null);

  const [startLocation, setStartLocation] = useState(
    () => localStorage.getItem("startLocation") || ""
  );
  const [destination, setDestination] = useState(
    () => localStorage.getItem("destination") || ""
  );

  const [map, setMap] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);
  const [useCurrentLocation, setUseCurrentLocation] = useState(true);
  const [startCoords, setStartCoords] = useState(null);
  const [selectingPointType, setSelectingPointType] = useState(null);
  const selectingPointRef = useRef(null);
  const [startMarker, setStartMarker] = useState(null);
  const [endMarker, setEndMarker] = useState(null);
  const startMarkerRef = useRef(null);
  const endMarkerRef = useRef(null);

  const [currentLocationMarker, setCurrentLocationMarker] = useState(null);

  const { theme } = useContext(ThemeContext);

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
        const initializeMap = (origin) => {
          // navigator.geolocation.getCurrentPosition(
          //   (position) => {
          // const origin = {
          //   lat: position.coords.latitude,
          //   lng: position.coords.longitude,
          // };
          // setStartCoords(origin);

          const mapInstance = new window.google.maps.Map(mapRef.current, {
            zoom: 14,
            center: origin,
            styles: theme === "dark" ? darkMapStyle : lightMapStyle,
            streetViewControl: false,
            fullscreenControl: false,
            mapTypeControl: true,
            zoomControl: false,
            scaleControl: true,
          });

          const renderer = new window.google.maps.DirectionsRenderer();
          renderer.setMap(mapInstance);
          setMap(mapInstance);
          setDirectionsRenderer(renderer);

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

                const markerOptions = {
                  position: e.latLng,
                  map: mapInstance,
                  icon: ICONS[selectedType],
                  label: selectedType === "start" ? "A" : "B",
                };

                if (selectedType === "start") {
                  setStartLocation(address);
                  localStorage.setItem("startLocation", address);

                  var startLocationCoordinatesA = {
                    lat: e.latLng.lat(),
                    lng: e.latLng.lng(),
                  };

                  localStorage.setItem(
                    "startLocationCoordinatesA",
                    JSON.stringify(startLocationCoordinatesA)
                  );
                  // const storedCoords = JSON.parse(localStorage.getItem("startLocationCoordinatesA"));
                  // console.log(storedCoords.lng + " OBJECKTTTTT startLocationCoordinatesA");

                  setUseCurrentLocation(false);
                  setStartCoords(e.latLng);

                  if (startMarkerRef.current) {
                    startMarkerRef.current.setMap(null);
                  }

                  const marker = new window.google.maps.Marker(markerOptions);
                  startMarkerRef.current = marker;
                  setStartMarker(marker);
                } else if (selectedType === "end") {
                  if (!localStorage.getItem("startLocation")) {
                    alert("Chose or Mark the Start Location first!");
                  } else {
                    setDestination(address);
                    localStorage.setItem("destination", address);

                    var destinationCoordinatesB = {
                      lat: e.latLng.lat(),
                      lng: e.latLng.lng(),
                    };

                    localStorage.setItem(
                      "destinationCoordinatesB",
                      JSON.stringify(destinationCoordinatesB)
                    );

                    if (endMarkerRef.current) {
                      endMarkerRef.current.setMap(null);
                    }

                    const marker = new window.google.maps.Marker(markerOptions);
                    endMarkerRef.current = marker;
                    setEndMarker(marker);
                  }
                }
              } else {
                alert("Failed to get address from map click.");
              }
            });
          });

          const startInput = document.getElementById("start-location");
          const destinationInput = document.getElementById(
            "destination-location"
          );

          const startAutocomplete = new window.google.maps.places.Autocomplete(
            startInput
          );
          const destinationAutocomplete =
            new window.google.maps.places.Autocomplete(destinationInput);

          startAutocomplete.addListener("place_changed", () => {
            const place = startAutocomplete.getPlace();
            if (place.geometry) {
              setStartCoords(place.geometry.location);
              setStartLocation(place.formatted_address);
              setUseCurrentLocation(false);
              localStorage.setItem("startLocation", place.formatted_address);

              var startLocationCoordinatesA = {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
              };

              localStorage.setItem(
                "startLocationCoordinatesA",
                JSON.stringify(startLocationCoordinatesA)
              );
            }
          });

          destinationAutocomplete.addListener("place_changed", () => {
            const place = destinationAutocomplete.getPlace();
            if (place.geometry) {
              setDestination(place.formatted_address);
              localStorage.setItem("destination", place.formatted_address);

              var destinationCoordinatesB = {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
              };

              localStorage.setItem(
                "destinationCoordinatesB",
                JSON.stringify(destinationCoordinatesB)
              );
            }
          });

          if (startLocation === "Current Location") {
            setStartCoords(origin);
          }
        };

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const origin = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };

            initializeMap(origin);
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

  useEffect(() => {
    if (map) {
      map.setOptions({
        styles: theme === "dark" ? darkMapStyle : lightMapStyle,
      });
    }
  }, [theme, map]);

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
            const route = response.routes[0];
            const path = route.overview_path.map((coord) => ({
              lat: coord.lat(),
              lng: coord.lng(),
            }));
            localStorage.setItem("routePath", JSON.stringify(path));

            //DO NOT DELETE ... ⚠️⚠️⚠️
            // Optional: Save full steps
            // const steps = route.legs[0].steps.map(step => ({
            //   instruction: step.instructions,
            //   distance: step.distance.text,
            //   duration: step.duration.text,
            //   start_location: {
            //     lat: step.start_location.lat(),
            //     lng: step.start_location.lng(),
            //   },
            //   end_location: {
            //     lat: step.end_location.lat(),
            //     lng: step.end_location.lng(),
            //   },
            // }));
            // localStorage.setItem("routeSteps", JSON.stringify(steps));
          } else {
            console.error("Directions failed:", status);
          }
        }
      );
    };
    if (useCurrentLocation && startCoords) {
      geocodeAndRoute(startCoords);
    } else {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: startLocation }, (results, status) => {
        console.log(useCurrentLocation);
        console.log(startCoords);
        console.log(status);
        if (status === "OK") {
          geocodeAndRoute(results[0].geometry.location);
        } else {
          console.log(useCurrentLocation);
          console.log(startCoords);
          console.log(status);
          console.error("Geocoding failed:", status);
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

    localStorage.removeItem("startLocation");
    localStorage.removeItem("destination");
    localStorage.removeItem("startLocationCoordinatesA");
    localStorage.removeItem("destinationCoordinatesB");
    setStartLocation("");
    setDestination("");
    setUseCurrentLocation(false);
    setStartCoords(null);
  };

  const handleSelectFromMap = (type) => {
    if (type === "start" && startMarkerRef.current) {
      startMarkerRef.current.setMap(null);
      startMarkerRef.current = null;
      setStartMarker(null);
    }

    if (type === "end" && endMarker) {
      endMarker.setMap(null);
      setEndMarker(null);
    }

    setSelectingPointType(type);
    selectingPointRef.current = type;
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
        localStorage.setItem("startLocation", "Current Location");
        var startLocationCoordinatesA = {
          lat: origin.lat,
          lng: origin.lng,
        };

        localStorage.setItem(
          "startLocationCoordinatesA",
          JSON.stringify(startLocationCoordinatesA)
        );

        if (currentLocationMarker) {
          currentLocationMarker.setPosition(origin);
        }

        if (startMarker) {
          startMarker.setMap(null);
          setStartMarker(null);
        }
      },
      (error) => {
        alert("Failed to get current location.");
        console.error(error);
      }
    );
  };

  useEffect(() => {
    if (map && directionsRenderer) {
      handleDirections();
    }
  }, [startLocation, destination, map, directionsRenderer, useCurrentLocation]);

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
