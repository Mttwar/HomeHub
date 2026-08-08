import { PortalDataPage } from "@/components/portal/PortalDataPage";

export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  return <PortalDataPage view="search" role="tenant" expectedRole="TENANT" query={q} />;
}
