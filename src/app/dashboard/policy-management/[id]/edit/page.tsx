import EditPolicyPage from "./edit-policy-page";

interface EditPolicyPageProps {
  params: {
    id: string;
  };
}

export default function EditPolicyRoute({ params }: EditPolicyPageProps) {
  return <EditPolicyPage policyId={params.id} />;
}
