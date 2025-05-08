import { useEffect, useState } from "react";
import { toast } from "react-toastify";

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

  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) return;

    fetch("http://localhost:3000/reservations")
      .then((res) => res.json())
      .then((data) => {
        const userReservations = data.filter(
          (r: any) => r.userEmail === userEmail && r.status !== "terminé"
        );
        setReservations(userReservations);
      });
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

  const handleCancel = async (reservation: Reservation) => {
    try {
      // Supprimer la réservation
      await fetch(`http://localhost:3000/reservations/${reservation.id}`, {
        method: "DELETE",
      });

      // Remettre le scooter disponible
      await fetch(`http://localhost:3000/scooters/${reservation.scooterId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "available" }),
      });

      toast.success("Réservation annulée !");

      // Optionnel : retirer la réservation de l'affichage
      setReservations((prev) => prev.filter((r) => r.id !== reservation.id));
    } catch (error) {
      console.error("Erreur lors de l'annulation :", error);
      toast.error("Échec de l'annulation.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Mes Réservations</h1>
      {reservations.length === 0 ? (
        <p>Aucune réservation trouvée.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
          {reservations.map((r) => (
            <div
              key={r.id}
              className="p-4 rounded mb-4 shadow-sm bg-white text-center"
            >
              <p>
                <strong>Trottinette ID:</strong> {r.scooterId}
              </p>
              <p>
                <strong>Statut:</strong> {r.status}
              </p>

              {r.status === "non-payer" && (
                <div className="d-flex gap-4">
                  <button
                    onClick={() => handleStripePayment(r.id)}
                    className="mt-2 px-4 py-2 bg-blue-400 hover:bg-blue-500 text-white rounded cursor-pointer"
                  >
                    Payer
                  </button>
                  <button
                    onClick={() => handleCancel(r)}
                    className="mt-2 px-4 py-2 bg-red-400 hover:bg-red-500 text-white rounded cursor-pointer mx-2"
                  >
                    Annuler
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MesReservations;
