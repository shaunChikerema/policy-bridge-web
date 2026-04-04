// src/app/dashboard/policy-management/[id]/page.tsx
import PolicyDetailsPage from "./policy-details-page";

interface PolicyPageProps {
  params: Promise<{ id: string }>;
}

export default async function PolicyPage({ params }: PolicyPageProps) {
  const { id } = await params;
  return <PolicyDetailsPage policyId={id} />;
}