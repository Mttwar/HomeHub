import { PortalDataPage } from "@/components/portal/PortalDataPage";

export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  return <PortalDataPage view="search" role="owner" expectedRole="OWNER" query={q} />;
}
