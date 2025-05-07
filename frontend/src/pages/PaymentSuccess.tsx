import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const reservationId = searchParams.get("reservationId");
  console.log(reservationId);

  useEffect(() => {
    if (!reservationId) return;

    // Récupérer la réservation
    fetch(`http://localhost:3000/reservations/${reservationId}`)
      .then((res) => res.json())
      .then((reservation) => {
        const updatedReservation = {
          ...reservation,
          status: "payée",
          paidAt: new Date().toISOString(),
        };

        // Mettre à jour la réservation
        fetch(`http://localhost:3000/reservations/${reservationId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedReservation),
        });

        // Mettre à jour la trottinette (status: "in-use")
        fetch(`http://localhost:3000/scooters/${reservation.scooterId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "in-use" }),
        });
      });
  }, [reservationId]);

  return (
    <div className="p-6 text-center">
      <h1 className="text-2xl font-bold text-green-600">
        🎉 Paiement réussi !
      </h1>
      <p className="mt-4">Votre trottinette est maintenant déverrouillée.</p>
    </div>
  );
};

export default PaymentSuccess;
