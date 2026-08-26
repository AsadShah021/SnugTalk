import { MemberOnly } from "@/components/dashboard/member-only";
import { MemberShell } from "@/components/dashboard/member-shell";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Dashboard",
  description: "Message us or schedule a meeting.",
  path: "/dashboard",
  noIndex: true,
});

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <MemberOnly>
      <MemberShell>{children}</MemberShell>
    </MemberOnly>
  );
}
