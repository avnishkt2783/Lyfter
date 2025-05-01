import React, { useEffect, useRef, useState } from "react";

const GoogleMapView = () => {
  const mapRef = useRef(null);
  const [destination, setDestination] = useState("");
  const [startLocation, setStartLocation] = useState(""); // Start location
  const [useCurrentLocation, setUseCurrentLocation] = useState(false); // Toggle for current location or not
  const [map, setMap] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);

  const loadGoogleMapsScript = () => {
    return new Promise((resolve, reject) => {
      if (window.google) {
        resolve(); // Already loaded
        return;
      }

      const script = document.createElement("script");
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
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

            const mapInstance = new window.google.maps.Map(mapRef.current, {
              zoom: 14,
              center: origin,
            });

            new window.google.maps.Marker({
              position: origin,
              map: mapInstance,
              label: "You",
            });

            const renderer = new window.google.maps.DirectionsRenderer();
            renderer.setMap(mapInstance);

            setMap(mapInstance);
            setDirectionsRenderer(renderer);
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

    const directionsService = new window.google.maps.DirectionsService();
    let origin;

    // Clear previous directions
    directionsRenderer.setDirections({ routes: [] });

    if (useCurrentLocation) {
      // Get current location for origin
      navigator.geolocation.getCurrentPosition((position) => {
        origin = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

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
              alert("Directions failed due to: " + status);
            }
          }
        );
      });
    } else {
      // Use manually entered start location
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: startLocation }, (results, status) => {
        if (status === "OK") {
          origin = results[0].geometry.location;

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
                alert("Directions failed due to: " + status);
              }
            }
          );
        } else {
          alert("Geocode failed: " + status);
        }
      });
    }
  };

  return (
    <div>
      <h3>Enter your route</h3>

      {/* Start location input */}
      <div>
        <label>Start Location:</label>
        <input
          type="text"
          value={startLocation}
          onChange={(e) => {
            setStartLocation(e.target.value);
            setUseCurrentLocation(false); // Reset current location flag when typing manually
          }}
          placeholder="Enter start location"
          style={{ padding: "10px", width: "300px", marginRight: "10px" }}
        />
        {/* Button to allow user to use current location */}
        <button
          onClick={() => {
            setUseCurrentLocation(true);
            setStartLocation(""); // Clear the start location text when using current location
          }}
        >
          Use Current Location
        </button>
      </div>

      {/* End location input */}
      <div>
        <label>End Location:</label>
        <input
          type="text"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="Enter destination"
          style={{ padding: "10px", width: "300px", marginRight: "10px" }}
        />
      </div>

      <button onClick={handleDirections} style={{ marginTop: "20px" }}>
        Show Directions
      </button>

      <div ref={mapRef} style={{ height: "500px", marginTop: "20px" }}></div>
    </div>
  );
};

export default GoogleMapView;
