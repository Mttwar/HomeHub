import { PendingOverlay } from "@/components/overlays/PendingOverlay";

export default function ApartmentsLoading() {
  return <PendingOverlay title="Carico i tuoi spazi" description="Recuperiamo gli appartamenti associati al tuo account." />;
}
