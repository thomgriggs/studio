import { SnapshotPage } from "../../snapshot-page";

export default async function Page({ params }: { params: Promise<{ segments: string[] }> }) {
  const { segments } = await params;
  return <SnapshotPage snapshotKey={segments.join("__")} />;
}
