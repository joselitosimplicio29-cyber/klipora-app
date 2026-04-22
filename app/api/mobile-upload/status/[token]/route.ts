import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/uploadTokens";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const session = getSession(token);

  if (!session) {
    return NextResponse.json({ status: "expired" }, { status: 404 });
  }

  return NextResponse.json({
    status: session.status,
    progress: session.progress,
    videoPath: session.status === "done" ? session.videoPath : undefined,
    filename: session.status === "done" ? session.filename : undefined,
  });
}
