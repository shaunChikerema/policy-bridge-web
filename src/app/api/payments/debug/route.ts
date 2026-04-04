// src/app/api/payments/debug/route.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get("id");

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll() } }
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!paymentId) {
      return NextResponse.json(
        { error: "Payment ID required" },
        { status: 400 }
      );
    }

    console.log("Debug - Payment ID:", paymentId);
    console.log("Debug - User ID:", user.id);

    // Check if payment exists without user filter first
    const { data: payment, error } = await supabase
      .from("payments")
      .select("*")
      .eq("id", paymentId)
      .single();

    console.log("Debug - Payment query result:", { payment, error });

    if (error) {
      return NextResponse.json(
        {
          error: "Payment query failed",
          details: error,
        },
        { status: 500 }
      );
    }

    if (!payment) {
      return NextResponse.json(
        {
          error: "Payment not found in database",
          paymentId,
        },
        { status: 404 }
      );
    }

    // Check if payment belongs to user
    if (payment.user_id !== user.id) {
      return NextResponse.json(
        {
          error: "Payment belongs to different user",
          paymentUserId: payment.user_id,
          currentUserId: user.id,
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        user_id: payment.user_id,
        payment_reference: payment.payment_reference,
        status: payment.status,
      },
    });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
