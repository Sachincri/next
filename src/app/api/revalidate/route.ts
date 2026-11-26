import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const tag = typeof body?.tag === "string" && body.tag ? body.tag : "home-seo";
    const path = typeof body?.path === "string" && body.path ? body.path : "/";

    revalidateTag(tag, { expire: 0 });
    revalidatePath(path, "layout");
    revalidatePath(path, "page");

    return NextResponse.json({
      revalidated: true,
      tag,
      path,
      now: Date.now(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { revalidated: false, message: error?.message || "Revalidation failed" },
      { status: 500 }
    );
  }
}
