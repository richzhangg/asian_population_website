import { NextRequest, NextResponse } from "next/server";
import { fetchCityWorldBankData, hasCityWBData } from "@/lib/services/worldbank";

export const revalidate = 86400; // cache for 24 hours server-side

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const slug = searchParams.get("slug");
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  if (!slug || !hasCityWBData(slug)) {
    return NextResponse.json({ error: "Invalid city slug" }, { status: 400 });
  }

  const dateRange =
    start && end
      ? { start: parseInt(start, 10), end: parseInt(end, 10) }
      : undefined;

  try {
    const data = await fetchCityWorldBankData(slug, slug, dateRange);
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
