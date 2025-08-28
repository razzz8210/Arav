import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing URL" }, { status: 400 });
  }

  try {
    const res = await fetch(url, { method: "HEAD" });
    return NextResponse.json({
      available: res.ok,
      status: res.status,
      statusText: res.statusText,
    });
  } catch (err: any) {
    console.error(`Failed to reach sandbox: ${url}`, err);
    return NextResponse.json(
      { available: false, error: err.message },
      { status: 502 }
    );
  }
}
