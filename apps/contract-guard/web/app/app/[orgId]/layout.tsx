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
    <div className="mx-auto w-full max-w-[1400px] md:flex md:gap-0 md:px-4 lg:px-6">
      <OrgNav orgId={orgId} />
      <main className="w-full px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
