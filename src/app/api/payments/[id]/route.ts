// app/api/payments/[id]/route.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Valid statuses for updates
const VALID_STATUSES = ["pending", "processing", "completed", "failed", "cancelled", "refunded"];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate UUID format
    if (!UUID_REGEX.test(id)) {
      return NextResponse.json(
        { error: "Invalid payment ID format. Expected UUID." },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll() } }
    );

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Auth error:", authError?.message);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Fetching payment with ID:", id, "for user:", user.id);

    // Fetch payment with related data
    const { data: payment, error } = await supabase
      .from("payments")
      .select(
        `
        *,
        client:clients!payments_client_id_fkey (
          id,
          first_name,
          last_name,
          email,
          phone
        ),
        policy:policies!payments_policy_id_fkey (
          id,
          policy_number,
          policy_name,
          policy_type,
          coverage_amount
        ),
        claim:claims!payments_claim_id_fkey (
          id,
          claim_number,
          claim_type,
          status
        )
      `
      )
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("Database error:", error);
      
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Payment not found" },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { 
          error: "Failed to fetch payment",
          details: process.env.NODE_ENV === "development" ? error.message : undefined
        },
        { status: 500 }
      );
    }

    // If no payment found (shouldn't happen with PGRST116, but just in case)
    if (!payment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    console.log("Found payment:", payment.payment_reference);

    // Transform the data to match frontend expectations
    const transformedPayment = {
      ...payment,
      // Ensure client data is properly formatted
      client: payment.client ? {
        id: payment.client.id,
        first_name: payment.client.first_name,
        last_name: payment.client.last_name,
        email: payment.client.email,
        phone: payment.client.phone,
        full_name: `${payment.client.first_name || ''} ${payment.client.last_name || ''}`.trim() || 'Unknown Client'
      } : null,
      // Ensure policy data is properly formatted
      policy: payment.policy || null,
      // Ensure claim data is properly formatted
      claim: payment.claim || null
    };

    return NextResponse.json({ data: transformedPayment });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: process.env.NODE_ENV === "development" 
          ? (error instanceof Error ? error.message : "Unknown error")
          : undefined
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate UUID format
    if (!UUID_REGEX.test(id)) {
      return NextResponse.json(
        { error: "Invalid payment ID format. Expected UUID." },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll() } }
    );

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Auth error:", authError?.message);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    console.log("Updating payment:", id, "with data:", body);

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    // Only update fields that are provided and valid
    if (body.status !== undefined) {
      if (VALID_STATUSES.includes(body.status)) {
        updateData.status = body.status;
      } else {
        return NextResponse.json(
          { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` },
          { status: 400 }
        );
      }
    }

    if (body.notes !== undefined) updateData.notes = body.notes?.trim() || null;
    if (body.payment_date !== undefined) updateData.payment_date = body.payment_date || null;
    if (body.transaction_id !== undefined) updateData.transaction_id = body.transaction_id?.trim() || null;
    if (body.external_reference !== undefined) updateData.external_reference = body.external_reference?.trim() || null;
    if (body.payment_details !== undefined) updateData.payment_details = body.payment_details || {};
    if (body.tags !== undefined) updateData.tags = body.tags || [];

    // Verify payment exists and belongs to user before updating
    const { data: existingPayment, error: fetchError } = await supabase
      .from("payments")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return NextResponse.json(
          { error: "Payment not found" },
          { status: 404 }
        );
      }
      console.error("Database error:", fetchError);
      return NextResponse.json(
        { error: "Failed to verify payment" },
        { status: 500 }
      );
    }

    // Update payment
    const { data: payment, error: updateError } = await supabase
      .from("payments")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select(
        `
        *,
        client:clients!payments_client_id_fkey (
          id,
          first_name,
          last_name,
          email,
          phone
        ),
        policy:policies!payments_policy_id_fkey (
          id,
          policy_number,
          policy_name,
          policy_type,
          coverage_amount
        ),
        claim:claims!payments_claim_id_fkey (
          id,
          claim_number,
          claim_type,
          status
        )
      `
      )
      .single();

    if (updateError) {
      console.error("Database update error:", updateError);
      return NextResponse.json(
        { 
          error: "Failed to update payment",
          details: process.env.NODE_ENV === "development" ? updateError.message : undefined
        },
        { status: 500 }
      );
    }

    // Transform response data
    const transformedPayment = {
      ...payment,
      client: payment.client ? {
        ...payment.client,
        full_name: `${payment.client.first_name || ''} ${payment.client.last_name || ''}`.trim() || 'Unknown Client',
      } : null,
    };

    console.log("Payment updated successfully:", transformedPayment.payment_reference);

    return NextResponse.json({
      data: transformedPayment,
      message: "Payment updated successfully",
    });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: process.env.NODE_ENV === "development" 
          ? (error instanceof Error ? error.message : "Unknown error")
          : undefined
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate UUID format
    if (!UUID_REGEX.test(id)) {
      return NextResponse.json(
        { error: "Invalid payment ID format. Expected UUID." },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll() } }
    );

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Auth error:", authError?.message);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Deleting payment:", id, "for user:", user.id);

    // Verify payment exists and belongs to user before deleting
    const { data: existingPayment, error: fetchError } = await supabase
      .from("payments")
      .select("id, payment_reference")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return NextResponse.json(
          { error: "Payment not found" },
          { status: 404 }
        );
      }
      console.error("Database error:", fetchError);
      return NextResponse.json(
        { error: "Failed to verify payment" },
        { status: 500 }
      );
    }

    // Delete payment
    const { error } = await supabase
      .from("payments")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Database delete error:", error);
      return NextResponse.json(
        { 
          error: "Failed to delete payment",
          details: process.env.NODE_ENV === "development" ? error.message : undefined
        },
        { status: 500 }
      );
    }

    console.log("Payment deleted successfully:", existingPayment.payment_reference);

    return NextResponse.json({ 
      success: true,
      message: "Payment deleted successfully"
    });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: process.env.NODE_ENV === "development" 
          ? (error instanceof Error ? error.message : "Unknown error")
          : undefined
      },
      { status: 500 }
    );
  }
}