import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

const subscriptions = new Map<string, any>();

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const subscription = await request.json();

    subscriptions.set(user.id, subscription);

    return NextResponse.json({ message: "Subscribed successfully" });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
