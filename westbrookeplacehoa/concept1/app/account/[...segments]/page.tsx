import { SnapshotPage } from "../../snapshot-page";

export default async function AccountPage({
  params,
}: {
  params: Promise<{ segments: string[] }>;
}) {
  const { segments } = await params;
  return <SnapshotPage snapshotKey={`account__${segments.join("__")}`} />;
}
