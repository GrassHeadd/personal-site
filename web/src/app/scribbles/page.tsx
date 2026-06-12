import { isAdmin } from "@/shared/auth";
import { listScribbles, todayKey } from "@/features/scribbles/model";
import ScribbleWall from "@/features/scribbles/ScribbleWall";
import PrivatePage from "@/shared/components/PrivatePage";

/* The braindump pad: admin-only, strangers get the magic-word tease. */
export default async function ScribblesPage() {
  if (!(await isAdmin())) return <PrivatePage title="scribbles" />;

  const scribbles = await listScribbles().catch(() => null);
  return <ScribbleWall initialScribbles={scribbles} today={todayKey()} />;
}
