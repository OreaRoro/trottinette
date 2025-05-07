import { useEffect, useState } from "react";

type Reservation = {
  id: string;
  scooterId: number;
  userEmail: string;
  status: "reserved" | "paid" | "cancelled";
  startTime: string;
};

type Scooter = {
  id: number;
  status: "available" | "reserved" | "unavailable";
};

const Admin = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [scooters, setScooters] = useState<Scooter[]>([]);

  useEffect(() => {
    fetch("http://localhost:3000/reservations")
      .then((res) => res.json())
      .then((data) => setReservations(data));
  }, []);

  useEffect(() => {
    fetch("http://localhost:3000/scooters")
      .then((res) => res.json())
      .then((data) => setScooters(data));
  }, []);

  const handleCancel = async (reservationId: string, scooterId: number) => {
    await fetch(`http://localhost:3000/reservations/${reservationId}`, {
      method: "DELETE",
    });

    await fetch(`http://localhost:3000/scooters/${scooterId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "available" }),
    });

    setReservations(reservations.filter((r) => r.id !== reservationId));
  };

  const handleMarkPaid = async (reservationId: string) => {
    await fetch(`http://localhost:3000/reservations/${reservationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "paid" }),
    });

    setReservations((prev) =>
      prev.map((r) => (r.id === reservationId ? { ...r, status: "paid" } : r))
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Gestion des réservations</h1>
      <table className="w-full text-left border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">ID</th>
            <th className="p-2">Trottinette</th>
            <th className="p-2">Utilisateur</th>
            <th className="p-2">Début</th>
            <th className="p-2">Statut</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((r) => (
            <tr key={r.id} className="border-t">
              <td className="p-2">{r.id}</td>
              <td className="p-2">Trottinette #{r.scooterId}</td>
              <td className="p-2">{r.userEmail}</td>
              <td className="p-2">{new Date(r.startTime).toLocaleString()}</td>
              <td className="p-2">{r.status}</td>
              <td className="p-2 space-x-2">
                {r.status === "reserved" && (
                  <button
                    className="bg-green-500 text-white text-sm px-2 py-1 rounded"
                    onClick={() => handleMarkPaid(r.id)}
                  >
                    Marquer payée
                  </button>
                )}
                <button
                  className="bg-red-500 text-white text-sm px-2 py-1 rounded cursor-pointer"
                  onClick={() => handleCancel(r.id, r.scooterId)}
                >
                  Annuler
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Admin;
