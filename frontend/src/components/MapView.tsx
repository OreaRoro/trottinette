import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { type LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { toast } from "react-toastify";

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface Scooter {
  id: number;
  position: LatLngExpression; // position sous forme de tableau [latitude, longitude]
  status: string;
  batery: string;
}

const scooterIcon = L.icon({
  iconUrl: "/icons/scooter.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const MapView: React.FC = () => {
  const [userPos, setUserPos] = useState<LatLngExpression | null>(null);
  const [scooters, setScooters] = useState<Scooter[]>([]);
  const [selectedScooter, setSelectedScooter] = useState<Scooter | null>(null);
  const scooterPositions = useRef<Map<number, LatLngExpression>>(new Map());

  const randomizeScooterPositions = (
    scooters: Scooter[],
    userLocation: LatLngExpression
  ): Scooter[] => {
    const [lat, lng] = userLocation as [number, number];

    return scooters.map((scooter) => {
      const offsetLat = (Math.random() - 0.5) * 0.02;
      const offsetLng = (Math.random() - 0.5) * 0.02;
      return {
        ...scooter,
        position: [lat + offsetLat, lng + offsetLng],
      };
    });
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation: LatLngExpression = [
          position.coords.latitude,
          position.coords.longitude,
        ];
        setUserPos(userLocation);

        fetch("http://localhost:3000/scooters")
          .then((res) => res.json())
          .then((data) => {
            const randomized = data.map((scooter: { id: number }) => {
              let pos = scooterPositions.current.get(scooter.id);

              if (!pos && userLocation) {
                const offsetLat = (Math.random() - 0.5) * 0.02;
                const offsetLng = (Math.random() - 0.5) * 0.02;
                pos = [
                  (userLocation[0] as number) + offsetLat,
                  (userLocation[1] as number) + offsetLng,
                ];
                scooterPositions.current.set(scooter.id, pos);
              }

              return { ...scooter, position: pos ?? [0, 0] };
            });

            setScooters([]);
            randomized.forEach((scooter: Scooter, i: number) => {
              setTimeout(() => {
                setScooters((prev) => {
                  if (prev.some((s) => s.id === scooter.id)) return prev;
                  return [...prev, scooter];
                });
              }, i * 100);
            });
          });
      },
      (error) => {
        console.error("Erreur de géolocalisation :", error.message);
        alert("Impossible de récupérer votre position.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  const handleReserve = async () => {
    if (!selectedScooter) return;

    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) return alert("Vous devez être connecté");

    await fetch("http://localhost:3000/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scooterId: selectedScooter.id,
        userEmail,
        status: "non-payer",
        startTime: new Date().toISOString(),
      }),
    });

    await fetch(`http://localhost:3000/scooters/${selectedScooter.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "reserved" }),
    });

    toast(`Trottinette #${selectedScooter.id} réservée avec succès!`);
    setSelectedScooter(null);

    const updated = await fetch("http://localhost:3000/scooters").then((res) =>
      res.json()
    );

    const scootersWithOldPositions = updated.map((scooter: { id: number }) => {
      let pos = scooterPositions.current.get(scooter.id);

      if (!pos && userPos) {
        const [lat, lng] = userPos as [number, number];
        const offsetLat = (Math.random() - 0.5) * 0.02;
        const offsetLng = (Math.random() - 0.5) * 0.02;
        pos = [lat + offsetLat, lng + offsetLng];
        scooterPositions.current.set(scooter.id, pos);
      }

      return { ...scooter, position: pos ?? [0, 0] };
    });

    setScooters(scootersWithOldPositions);
  };

  if (!userPos)
    return <p className="text-center mt-10">Localisation en cours...</p>;

  return (
    <div className="relative flex-1 min-h-[400px] md:min-h-[600px] h-full z-0 p-5">
      <MapContainer
        center={userPos}
        zoom={15}
        className="w-full h-full animate-fade-in"
        scrollWheelZoom
      >
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <Marker position={userPos}>
          <Popup>Vous êtes ici</Popup>
        </Marker>

        {scooters
          .filter((scooter) => scooter.status === "available")
          .map((scooter) => (
            <Marker
              key={scooter.id}
              position={scooter.position}
              icon={scooterIcon}
              eventHandlers={{
                click: () => {
                  setSelectedScooter(scooter);
                },
              }}
            >
              <Popup>
                <div className="text-center">
                  <h2 className="font-semibold">Trottinette #{scooter.id}</h2>
                  <p>Statut : Disponible</p>
                  <p>Charge : {scooter.batery}</p>
                  <button
                    className="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
                    onClick={handleReserve}
                  >
                    Réserver
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
};

export default MapView;
