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
  geocodeByAddress,
  geocodeByPlaceId,
  getLatLng,
} from "react-google-places-autocomplete";
import "./App.css";
// import { Distance } from "../src/model/Distances";

function App() {

  const { isLoaded } = useLoadScript({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAP_KEY,
    libraries: ["places"],
  });

  const [markers, setMarkers] = useState([]);
  const [directions, setDirections] = useState();
  const [yourPosition, setYourPosition] = useState();
  // const [isShow, setIsShow] = useState(false); 

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
          }
        )
      });
    }
  }, [])

  // get pin 
  const onMapLoad = (map) => {
    // let request = { location: yourPosition.position, radius: 2000, types: 'atm' }
    // const service = new google.maps.places.PlacesService(map);
    // service.nearbySearch(request, searchPlacesResult);
    const address = {
      "addr": ["32 Lê Lợi, Thạch Thang, Q. Hải Châu, Đà Nẵng 550000", "02 Quang Trung, Thạch Thang, Hải Châu, Đà Nẵng 550000, Việt Nam ", "20 Đ Nguyễn Văn Linh, Phước Ninh, Hải Châu, Đà Nẵng 550000, Việt Nam"]
    };
    if(address.addr) {
      for (let i=0; i< address.addr.length; i++) {
        positionDetaiByAddress(address.addr[i]);
      }
    }
  };

  const searchPlacesResult = (results, status) => {
    // Kiểm tra xem kết quả có thành công không
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      // Duyệt mảng kết quả
      for (var i = 0; i < results.length; i++) {
        let place = results[i];
        positionDetaiByPlaceId(place);
      }
    }
  }

  // lấy thông tin chi tiết theo place ID
  const positionDetaiByPlaceId = async (place) => {
    const results = await geocodeByPlaceId(place.place_id);
    coordinates(results[0], place.name);
  }

  // lấy thông tin chi tiết theo address
  const positionDetaiByAddress = async (address) => {
    const results = await geocodeByAddress(address);
    coordinates(results[0]);
  }

  // lấy tạo độ 
  const coordinates = (result) => {
    const position = getLatLng(result);
    position.then(res => {
      setMarkers((val) => [...val,
      {
        id: result.place_id,
        name: result.formatted_address,
        position: res,
      }])
    })
  }
  // điều hướng
  const fetchDirections = (marker) => {
    if (!marker) return;
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
          // setIsShow(true);
        }
      }
    );
  };

  return (
    <div className="container">
      <h1 className="text-center">Vite + React | Google Map Markers</h1>
      {/* {isShow ? <Distance leg={directions.routes[0].legs[0].distance} /> : null} */}
      <div style={{ height: "90vh", width: "100%" }}>
        {isLoaded && yourPosition ? (
          <GoogleMap
            center={yourPosition.position}
            zoom={15}
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

            {yourPosition ? <Marker
              key={yourPosition.id}
              position={yourPosition.position}
              type
            /> : null}

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
                  >
                  </Marker>
                ))
              }
            </MarkerClusterer>
            {yourPosition ? <Circle center={yourPosition.position} radius={2000} options={circle} /> : null}
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