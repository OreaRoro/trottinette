import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { type LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
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
    navigator.geolocation.getCurrentPosition((position) => {
      const userLocation: LatLngExpression = [
        position.coords.latitude,
        position.coords.longitude,
      ];
      setUserPos(userLocation);

      fetch("http://localhost:3000/scooters")
        .then((res) => res.json())
        .then((data) => {
          // Pour chaque trottinette, on déplace légèrement sa position autour de l'utilisateur
          const randomized = randomizeScooterPositions(data, userLocation);
          setScooters([]);
          randomized.forEach((scooter, i) => {
            setTimeout(() => {
              setScooters((prev) => {
                // On évite les doublons
                if (prev.some((s) => s.id === scooter.id)) return prev;
                return [...prev, scooter];
              });
            }, i * 100);
          });
        });
    });
  }, []);

  const handleReserve = async () => {
    if (!selectedScooter) return;

    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) return alert("Vous devez être connecté");

    // Ajouter la réservation
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

    // Mettre à jour la trottinette pour marquer son statut comme réservé
    await fetch(`http://localhost:3000/scooters/${selectedScooter.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "reserved" }),
    });

    // alert(`Trottinette #${selectedScooter.id} réservée !`);
    toast(`Trottinette #${selectedScooter.id} réservée avec succès!`);
    setSelectedScooter(null);

    // Recharger les trottinettes mises à jour
    const updated = await fetch("http://localhost:3000/scooters").then((res) =>
      res.json()
    );
    if (userPos) {
      const randomized = randomizeScooterPositions(updated, userPos);
      setScooters([]);
      randomized.forEach((scooter, i) => {
        setTimeout(() => {
          setScooters((prev) => {
            // On évite les doublons
            if (prev.some((s) => s.id === scooter.id)) return prev;
            return [...prev, scooter];
          });
        }, i * 100);
      });
    } else {
      setScooters(updated);
    }
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
