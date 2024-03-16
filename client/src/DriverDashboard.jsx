import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { UserContext } from "./UserContext";

export default function DriverDashboard() {
  const [name, setName] = useState("");
  const [locationShared, setLocationShared] = useState(false);
  const [intervalId, setIntervalId] = useState(null);
  const [driverId, setDriverId] = useState("");
  
  const { username, id, role } = useContext(UserContext);

  // const driverId = "DID1001";

  const shareLocation = () => {
    if (!locationShared) {
      startLocationSharing();
    } else {
      stopLocationSharing();
    }
  };

  const stopLocationSharing = () => {
    console.log("Stopped");
    setLocationShared(false);
    clearInterval(intervalId);
  };

  const startLocationSharing = () => {
    const id = setInterval(getCurrentLocation, 10000);
    setIntervalId(id);
    setLocationShared(true);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          axios
            .post("/driver-dashboard/location", {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              name: username,
              driverId: driverId,
            })
            .then((response) => {
              console.log("Data sent successfully ...");
              console.log(response.message);
            })
            .catch((error) => {
              console.error("Error occurred while sending data:", error);
            });
        },
        (error) => {
          console.error("Error occurred while getting location:", error);
        }
      );
    } else {
      console.log("Browser does not support geolocation API...");
    }
  };

  // useEffect(() => {
  //   return () => {
  //     clearInterval(intervalId);
  //   };
  // }, [intervalId]);

  useEffect(() => {
    // Fetch the driver ID when the component mounts
    axios.get("/driver-dashboard")
      .then((response) => {
        console.log(response.data);
        setDriverId(response.data.driverId);
      })
      .catch((error) => {
        console.error("Error fetching driver ID:", error);
      });

    return () => {
      clearInterval(intervalId);
    };
  }, [intervalId]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h2 className="text-2xl mb-4">Driver ID {driverId}</h2>
      <div>
        <button
          className={`px-4 py-2 rounded ${
            locationShared
              ? "bg-green-500 hover:bg-green-600"
              : "bg-blue-500 hover:bg-blue-600"
          } text-white`}
          onClick={shareLocation}
        >
          {locationShared ? "Location Shared" : "Share My Location"}
        </button>
      </div>
    </div>
  );
}
