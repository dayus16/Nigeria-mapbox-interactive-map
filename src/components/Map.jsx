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
        // create a marker at a coordinate
        const marker = new mapboxgl.Marker({ element: markerEl })
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

  return (
    <div>
      <header className="bg-[#7c3a1e]">
        <div className="flex justify-between items-center p-3">
          <div className="flex items-center gap-3">
            <div className="bg-[#d0cac93b] p-4 rounded-lg">
              <FaRoad size={25} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-200">
                NigeriaRoadTrip
              </h1>
              <small className="text-gray-300">
                Plan your journey across Nigeria
              </small>
            </div>
          </div>
          <div className="flex items-center gap-7">
            <div>
              <h1 className="text-center text-lg font-bold text-gray-200">0</h1>
              <small className="text-gray-300">Stops</small>
            </div>
            <div>
              <h1 className="text-center text-lg font-bold text-gray-200">
                230km
              </h1>
              <small className="text-gray-300">Total distance</small>
            </div>
            <div>
              <h1 className="text-center text-lg font-bold text-gray-200">
                7hrs
              </h1>
              <small className="text-gray-300">Est. time</small>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 border border-gray-300 rounded-lg bg-[#d0cac93b] py-1 px-4 cursor-pointer">
              <FaCarSide />
              <p>Drive</p>
            </div>
            <div className="flex items-center gap-2 border border-gray-300 rounded-lg py-1 px-4 cursor-pointer">
              <FaWalking />
              <p>Walk</p>
            </div>
          </div>
        </div>
      </header>
      <div className="flex">
        <div
          className="w-[70%]"
          id="map"
          ref={mapContainerRef}
          style={{ height: "100vh" }}
        ></div>
        <div className="w-[30%]">
          {stops.map((stop) => (
            <h1>{stop.name}</h1>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Map;
