import type { Metadata } from "next";
import { BookingFlow } from "@/features/booking/booking-flow";

export const metadata: Metadata = {
  title: "Agendar horário",
  description:
    "Escolha serviço, profissional, data e horário na experiência de agendamento da SR Navalha.",
  robots: { index: false, follow: true },
};

export default function BookingPage() {
  return <BookingFlow />;
}
