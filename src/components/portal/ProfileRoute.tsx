import type { MembershipRole } from "@/generated/prisma/enums";
import { SettingsPage } from "@/components/portal/pages/SettingsPage";
import { getProfile } from "@/server/dal/portal";
import type { Session } from "@/types";

export async function ProfileRoute({ expectedRole }: { expectedRole: MembershipRole }) {
  const { session, role, data } = await getProfile(expectedRole);
  const profile: Session = {
    name: session.user.name,
    email: session.user.email,
    role: role === "OWNER" ? "owner" : "tenant",
    initials: session.user.name.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join(""),
  };
  return <SettingsPage session={profile} data={data} />;
}
