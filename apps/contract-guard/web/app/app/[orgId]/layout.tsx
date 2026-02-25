import { OrgNav } from '../../components/org-nav';

export default async function OrgLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ orgId: string }>;
}>) {
  const { orgId } = await params;

  return (
    <div className="app-shell">
      <OrgNav orgId={orgId} />
      <main className="main-panel page-wrap">{children}</main>
    </div>
  );
}
