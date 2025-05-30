import React, { useEffect, useRef, useState, useContext } from "react";
import { darkMapStyle, lightMapStyle } from "../utils/MapStyles";
import { ThemeContext, useTheme } from "../ThemeContext";
import {
  FaLocationArrow,
  FaMapMarkedAlt,
  FaSearch,
  FaTimes,
} from "react-icons/fa";

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
      const destCoords = JSON.parse(
        localStorage.getItem("destinationCoordinatesB")
      );

      if (!destCoords) {
        console.error("No destination coordinates found in localStorage.");
        return;
      }

      const originLatLng = JSON.parse(
        localStorage.getItem("startLocationCoordinatesA")
      );

      const destinationLatLng = new window.google.maps.LatLng(
        destCoords.lat,
        destCoords.lng
      );

      directionsService.route(
        {
          origin: originLatLng,
          destination: destinationLatLng,
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
        if (status === "OK") {
          geocodeAndRoute(results[0].geometry.location);
        } else {
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
    <div className="container py-4">
      <div className="mb-3 row align-items-center">
        <label
          htmlFor="start-location"
          className="col-sm-2 col-form-label fw-semibold"
        >
          Start Location:
        </label>
        <div className="col-sm-6 mb-2 mb-sm-0">
          <input
            id="start-location"
            type="text"
            className="form-control"
            value={startLocation}
            onChange={(e) => {
              setStartLocation(e.target.value);
              setUseCurrentLocation(false);
            }}
            placeholder="Enter start location"
          />
        </div>
        <div className="col-sm-4 d-flex gap-2">
          <button
            className="btn btn-primary d-flex align-items-center gap-1"
            onClick={handleUseCurrentLocation}
          >
            <FaLocationArrow /> Use My Location
          </button>
          <button
            className="btn btn-secondary d-flex align-items-center gap-1"
            onClick={() => handleSelectFromMap("start")}
          >
            <FaMapMarkedAlt /> Select on Map
          </button>
        </div>
      </div>

      {/* Destination */}
      <div className="mb-3 row align-items-center">
        <label
          htmlFor="destination-location"
          className="col-sm-2 col-form-label fw-semibold"
        >
          Destination:
        </label>
        <div className="col-sm-6 mb-2 mb-sm-0">
          <input
            id="destination-location"
            type="text"
            className="form-control"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Enter destination"
          />
        </div>
        <div className="col-sm-4">
          <button
            className="btn btn-secondary d-flex align-items-center gap-1"
            onClick={() => handleSelectFromMap("end")}
          >
            <FaMapMarkedAlt /> Select on Map
          </button>
        </div>
      </div>

      <div className="d-flex justify-content-center gap-3 mt-4">
        <button
          className="btn btn-success d-flex align-items-center"
          onClick={handleDirections}
        >
          <FaSearch className="me-2" /> Show Directions
        </button>
        <button
          className="btn btn-danger d-flex align-items-center"
          onClick={handleClearMap}
        >
          <FaTimes className="me-2" /> Clear Directions
        </button>
      </div>

      <div
        ref={mapRef}
        className="mt-4 rounded shadow"
        style={{ height: "500px", width: "100%" }}
      ></div>
    </div>
  );
};

export default GoogleMapView;
