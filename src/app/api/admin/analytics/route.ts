import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  // Allow ADMIN and EDITOR to view analytics. AUTHOR can also view dashboard, so maybe they should see it?
  // The dashboard page hides TrafficChart for AUTHOR. So this API is likely called by ADMIN/EDITOR.
  // Let's restrict to ADMIN/EDITOR for now as per dashboard logic.
  if (!session || !["ADMIN", "EDITOR"].includes((session.user as any)?.role)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get("days") || "30");

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setUTCHours(0, 0, 0, 0);

  const stats = await prisma.dailyStat.findMany({
    where: {
      date: {
        gte: startDate,
      },
    },
    orderBy: {
      date: "asc",
    },
  });

  // Create a map for easy lookup
  const statsMap = new Map(stats.map(s => [s.date.toISOString().split('T')[0], s]));

  // Generate array of dates for the range to ensure continuous line
  const result = [];
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    d.setUTCHours(0, 0, 0, 0);
    const dateStr = d.toISOString().split('T')[0];
    
    const stat = statsMap.get(dateStr);
    
    result.push({
      name: d.toLocaleDateString('en-US', { weekday: 'long' }),
      date: dateStr,
      visits: stat ? stat.visitors : 0,
      pageViews: stat ? stat.views : 0,
    });
  }

  return NextResponse.json(result);
}
