import { useState, useEffect } from "react";
import {
  GoogleMap,
  useLoadScript,
  Circle,
  DirectionsRenderer,
  Marker,
  MarkerClusterer
} from "@react-google-maps/api";
import {
  geocodeByPlaceId,
  getLatLng,
} from "react-google-places-autocomplete";
import "./App.css";

function App() {

  const { isLoaded } = useLoadScript({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAP_KEY,
    libraries: ["places"],
  });

  const [markers, setMarkers] = useState([]);
  const [directions, setDirections] = useState();
  const [yourPosition, setYourPosition] = useState();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setYourPosition(
        {
          id: lat,
          name: "Your position",
          position: { lat: lat, lng: lng },
        })
      });
    }
  }, []);

  const onMapLoad = (map) => {
    let request = { location: yourPosition.position, radius: 2000, types: 'atm' }
    const service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, searchPlacesResult);
  };

  const searchPlacesResult = (results, status) => {
    // Kiểm tra xem kết quả có thành công không
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      // Duyệt mảng kết quả
      for (var i = 0; i < results.length; i++) {
        let place = results[i];
        searchDetail(place);
      }
    }
  }

  // lấy thông tin chi tiết
  const searchDetail = async (place) => {
    console.log("searchDetail");
    const results = await geocodeByPlaceId(place.place_id);
    latLng(results[0], place.name);
  }

  // lấy tạo độ 
  const latLng = (result, name) => {
    const position = getLatLng(result);
    position.then(res => {
      setMarkers((val) => [...val,
      {
        id: result.place_id,
        name: name,
        position: res,
      }])
    })
  }

  const fetchDirections = (marker) => {
    if (!marker) return;

    console.log("marfetchDirectionsker", marker);
    const service = new google.maps.DirectionsService();
    service.route(
      {
        origin: yourPosition.position,
        destination: marker.position,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK" && result) {
          setDirections(result);
        }
      }
    );
  };

  console.log("yourPosition", yourPosition);
  return (
    <div className="container">
      <h1 className="text-center">Vite + React | Google Map Markers</h1>
      <div style={{ height: "90vh", width: "100%" }}>
        {isLoaded ? (
          <GoogleMap
            center={yourPosition.position}
            zoom={15}
            onClick={() => setActiveMarker(null)}
            mapContainerStyle={{ width: "100%", height: "90vh" }}
            onLoad={(map) => onMapLoad(map)}
          >
            {directions && (
            <DirectionsRenderer
              directions={directions}
              options={{
                polylineOptions: {
                  zIndex: 50,
                  strokeColor: "#1976D2",
                  strokeWeight: 5,
                },
              }}
            />
          )}

            <Marker
              key={yourPosition.id}
              position={yourPosition.position} 
            />

            
              <MarkerClusterer>
                {(clusterer) =>
                  markers.map((marker) => (
                    <Marker
                      key={marker.id}
                      position={marker.position}
                      clusterer={clusterer}
                      onClick={() => {
                        fetchDirections(marker);
                      }}
                    />
                  ))
                }
              </MarkerClusterer>
            <Circle center={yourPosition.position} radius={2000} options={circle} />
          </GoogleMap>
        ) : null}
      </div>
    </div>
  );
}

const circle = {
  zIndex: 3,
  fillOpacity: 0.05,
  strokeColor: "blue",
  fillColor: "blue"
};

export default App;