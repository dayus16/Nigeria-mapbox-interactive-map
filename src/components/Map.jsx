import React, { useEffect, useRef, useState } from "react";
import * as mapboxgl from "mapbox-gl/esm";
import "mapbox-gl/dist/mapbox-gl.css";
import { FaRoad, FaCarSide, FaWalking } from "react-icons/fa";
import nigeriaCities from "../data/nigeriaCities";

const Map = () => {
  const mapRef = useRef();
  const mapContainerRef = useRef();
  const accessToken = import.meta.env.VITE_MAPBOX_ACCESSTOKEN;

  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tripInfo, setTripInfo] = useState(null);

  useEffect(() => {
    mapRef.current = new mapboxgl.Map({
      accessToken: accessToken,
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      zoom: 5,
      center: [8.6753, 9.082],
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl(), "top-left");

    mapRef.current.on("load", () => {
      nigeriaCities.forEach((city) => {
        const markerEl = document.createElement("div");

        markerEl.style.cssText = `
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #7C3A1E;
          border: 2px solid white;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        `;

        const marker = new mapboxgl.Marker({
          element: markerEl,
        })
          .setLngLat(city.coordinates)
          .setPopup(new mapboxgl.Popup().setText(city.name))
          .addTo(mapRef.current);

        markerEl.addEventListener("click", () => {
          addStop(city);
        });
      });
    });

    return () => {
      mapRef.current.remove();
    };
  }, []);

  const addStop = (city) => {
    setStops((prev) => {
      const alreadyAdded = prev.find((s) => s.name === city.name);

      if (alreadyAdded) {
        alert(`${city.name} is already in your trip`);
        return prev;
      }

      return [...prev, city];
    });
  };

  const removeStop = (i) => {
    const updateStops = stops.filter((_, stop) => stop !== i);

    setStops(updateStops);
  };

  useEffect(() => {
    if (stops.length < 2) return;

    const calculateRoute = async () => {
      setLoading(true);

      const waypoints = stops
        .map((stop) => stop.coordinates.join(","))
        .join(";");

      try {
        const res = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${waypoints}?geometries=geojson&access_token=${accessToken}`,
        );

        const data = await res.json();

        console.log("Route data:", data);

        const route = data.routes[0];

        const distance = (route.distance / 1000).toFixed(0);

        const time = (route.duration / 3600).toFixed(2);

        setTripInfo({
          distance,
          time,
        });

        if (mapRef.current.getSource("route")) {
          mapRef.current.removeLayer("route-line");
          mapRef.current.removeSource("route");
        }

        mapRef.current.addSource("route", {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: route.geometry,
          },
        });

        mapRef.current.addLayer({
          id: "route-line",
          type: "line",
          source: "route",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#7C3A1E",
            "line-width": 5,
            "line-opacity": 0.9,
          },
        });
      } catch (err) {
        console.error("Route Error:", err);
      }

      setLoading(false);
    };

    calculateRoute();
  }, [stops]);

  const clearAllTrips = () => {
    setStops([]);
    setTripInfo(null);

    if (mapRef.current.getSource("route")) {
      mapRef.current.removeLayer("route-line");
      mapRef.current.removeSource("route");
    }
  };

  return (
    <div className="w-full">
      {/* HEADER */}
      <header className="bg-[#7c3a1e]">
        <div
          className="
            flex
            flex-col
            gap-5
            p-4
            sm:p-5
            lg:flex-row
            lg:items-center
            lg:justify-between
          "
        >
          {/* LOGO */}
          <div className="flex items-center gap-3">
            <div className="bg-[#d0cac93b] p-3 sm:p-4 rounded-lg shrink-0">
              <FaRoad size={22} className="sm:w-6 sm:h-6" />
            </div>

            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-200">
                NigeriaRoadTrip
              </h1>

              <small className="text-gray-300 text-xs sm:text-sm">
                Plan your journey across Nigeria
              </small>
            </div>
          </div>

          {/* STATS */}
          <div
            className="
              flex
              items-center
              justify-between
              sm:justify-center
              gap-4
              sm:gap-8
              lg:gap-7
            "
          >
            {/* STOPS */}
            <div className="text-center">
              <h1 className="text-base sm:text-lg font-bold text-gray-200">
                {stops.length}
              </h1>

              <small className="text-gray-300 text-xs">Stops</small>
            </div>

            {/* DISTANCE */}
            <div className="text-center">
              <h1 className="text-base sm:text-lg font-bold text-gray-200">
                {tripInfo ? `${tripInfo.distance}km` : "0km"}
              </h1>

              <small className="text-gray-300 text-xs">Total distance</small>
            </div>

            {/* TIME */}
            <div className="text-center">
              <h1 className="text-base sm:text-lg font-bold text-gray-200">
                {tripInfo ? `~${tripInfo.time}hrs` : "0hr"}
              </h1>

              <small className="text-gray-300 text-xs">Est. time</small>
            </div>
          </div>

          {/* TRANSPORT OPTIONS */}
          <div
            className="
              flex
              items-center
              justify-center
              gap-2
              sm:gap-3
            "
          >
            <button
              className="
                flex
                items-center
                justify-center
                gap-2
                border
                border-gray-300
                rounded-lg
                bg-[#d0cac93b]
                py-2
                px-4
                sm:px-5
                cursor-pointer
                text-sm
                sm:text-base
              "
            >
              <FaCarSide />
              <p>Drive</p>
            </button>

            <button
              className="
                flex
                items-center
                justify-center
                gap-2
                border
                border-gray-300
                rounded-lg
                py-2
                px-4
                sm:px-5
                cursor-pointer
                text-sm
                sm:text-base
              "
            >
              <FaWalking />
              <p>Walk</p>
            </button>
          </div>
        </div>
      </header>

      {/* MAP + SIDEBAR */}
      <div className="flex flex-col md:flex-row">
        {/* MAP */}
        <div
          className="
            w-full
            md:w-[65%]
            lg:w-[70%]
          "
          id="map"
          ref={mapContainerRef}
          style={{
            height: "70vh",
          }}
        ></div>

        {/* TRIP PLANNER */}
        <div
          className="
            w-full
            md:w-[35%]
            lg:w-[30%]
            overflow-y-auto
            p-4
            sm:p-5
            max-h-[70vh]
            md:h-[70vh]
          "
        >
          <h1 className="text-xl text-gray-200 font-semibold">Trip Planner</h1>

          {/* EMPTY STATE */}
          {stops.length === 0 && (
            <div>
              <small className="text-gray-400 text-sm">
                Click cities on the map to add them to your trip
              </small>
            </div>
          )}

          {/* LOADING */}
          {loading && (
            <p className="text-gray-400 text-sm mt-3 text-center">
              Calculating route...
            </p>
          )}

          {/* TRIP INFO */}
          {tripInfo && (
            <div className="bg-[#fdf0e8] rounded-lg p-3 mt-4">
              <div className="flex justify-between gap-4">
                <p className="text-sm text-[#442316]">From</p>

                <p className="text-sm text-[#442316] text-right">
                  {stops[0].name}
                </p>
              </div>

              <div className="flex justify-between gap-4 mt-2">
                <p className="text-sm text-[#442316]">To</p>

                <p className="text-sm text-[#442316] text-right">
                  {stops[stops.length - 1].name}
                </p>
              </div>

              <div className="flex justify-between gap-4 mt-2">
                <p className="text-sm text-[#442316]">Total Distance</p>

                <p className="text-sm text-[#442316] text-right">
                  {tripInfo.distance} km
                </p>
              </div>

              <div className="flex justify-between gap-4 mt-2">
                <p className="text-sm text-[#442316]">Estimated Time</p>

                <p className="text-sm text-[#442316] text-right">
                  ~{tripInfo.time} hours
                </p>
              </div>
            </div>
          )}

          {/* STOPS */}
          {stops.map((stop, i) => (
            <div
              key={stop.name}
              className="
                flex
                justify-between
                items-center
                gap-3
                mt-4
                border
                border-gray-600
                bg-[#262624]
                rounded-lg
                p-3
              "
            >
              {/* STOP INFO */}
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="
                    bg-amber-800
                    rounded-full
                    h-9
                    w-9
                    min-w-9
                    flex
                    justify-center
                    items-center
                  "
                >
                  <p>{i + 1}</p>
                </div>

                <div className="min-w-0">
                  <h1 className="text-base sm:text-lg text-gray-200 font-semibold truncate">
                    {stop.name}
                  </h1>

                  <p className="text-gray-400 text-xs">
                    {i === 0
                      ? "Starting point"
                      : i === stops.length - 1
                        ? "Final destination"
                        : stop.state}
                  </p>

                  <h3 className="text-gray-300 text-sm truncate">
                    {stop.state}
                  </h3>
                </div>
              </div>

              {/* REMOVE */}
              <button
                className="
                  text-red-400
                  text-xs
                  shrink-0
                  hover:text-red-300
                "
                onClick={() => removeStop(i)}
              >
                Remove
              </button>
            </div>
          ))}

          {/* CLEAR ALL */}
          {stops.length > 0 && (
            <button
              onClick={clearAllTrips}
              className="
                w-full
                bg-amber-800
                rounded-lg
                py-2
                px-4
                mt-4
                hover:bg-amber-700
                duration-300
                transition-all
                ease-in-out
                text-base
                sm:text-lg
                font-semibold
              "
            >
              Clear all Stops
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Map;
