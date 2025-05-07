import { useEffect, useState } from "react";

type Reservation = {
  id: string;
  scooterId: number;
  userEmail: string;
  status: string;
  startTime: string;
};

const MesReservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const userEmail = localStorage.getItem("userEmail");

  useEffect(() => {
    fetch("http://localhost:3000/reservations")
      .then((res) => res.json())
      .then((data) =>
        setReservations(
          data.filter((r: Reservation) => r.userEmail === userEmail)
        )
      );
  }, []);

  const handleStripePayment = async (reservationId: string) => {
    const res = await fetch("http://localhost:4242/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reservationId,
        amount: 3, // en euro ou autre unité simulée
      }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Mes Réservations</h1>
      {reservations.length === 0 ? (
        <p>Aucune réservation trouvée.</p>
      ) : (
        reservations.map((r) => (
          <div
            key={r.id}
            className="border p-4 rounded mb-4 shadow-sm bg-white"
          >
            <p>
              <strong>Trottinette ID:</strong> {r.scooterId}
            </p>
            <p>
              <strong>Statut:</strong> {r.status}
            </p>
            <p>
              <strong>Date de début:</strong> {r.startTime}
            </p>
            {r.status === "non-payer" && (
              <button
                onClick={() => handleStripePayment(r.id)}
                className="mt-2 px-4 py-2 bg-green-600 text-white rounded cursor-pointer"
              >
                Payer
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default MesReservations;
