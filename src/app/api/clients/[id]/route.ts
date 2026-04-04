// app/api/clients/[id]/route.ts
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!UUID_REGEX.test(id)) {
      return NextResponse.json(
        { error: "Invalid client ID format." },
        { status: 400 }
      );
    }

    const { data: client, error } = await supabase
      .from("clients")
      .select(`
        *,
        policies (
          id,
          policy_number,
          policy_name,
          policy_type,
          status,
          premium_amount,
          coverage_amount,
          effective_date,
          expiration_date,
          renewal_date
        ),
        claims (
          id,
          claim_number,
          claim_type,
          status,
          priority,
          claim_amount,
          incident_date,
          reported_date
        ),
        payments (
          id,
          payment_reference,
          payment_type,
          amount,
          status,
          payment_date,
          due_date
        )
      `)
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Client not found" }, { status: 404 });
      }
      console.error("Database error:", error);
      return NextResponse.json({ error: "Failed to fetch client" }, { status: 500 });
    }

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const enhancedClient = {
      ...client,
      full_name: `${client.first_name} ${client.last_name}`.trim(),
      join_date: client.created_at,
    };

    return NextResponse.json({ data: enhancedClient });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!UUID_REGEX.test(id)) {
      return NextResponse.json(
        { error: "Invalid client ID format." },
        { status: 400 }
      );
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    // Check client exists
    const { data: existing, error: fetchError } = await supabase
      .from("clients")
      .select("id")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Check email uniqueness if being changed
    if (body.email) {
      const { data: emailConflict } = await supabase
        .from("clients")
        .select("id")
        .eq("email", body.email.toLowerCase())
        .neq("id", id)
        .single();

      if (emailConflict) {
        return NextResponse.json(
          { error: "A client with this email already exists" },
          { status: 409 }
        );
      }
    }

    const updateData = {
      ...body,
      email: body.email ? body.email.toLowerCase() : undefined,
      updated_at: new Date().toISOString(),
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );

    const { data: updatedClient, error } = await supabase
      .from("clients")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Database update error:", error);
      return NextResponse.json({ error: "Failed to update client" }, { status: 500 });
    }

    return NextResponse.json({
      data: {
        ...updatedClient,
        full_name: `${updatedClient.first_name} ${updatedClient.last_name}`.trim(),
        join_date: updatedClient.created_at,
      },
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!UUID_REGEX.test(id)) {
      return NextResponse.json(
        { error: "Invalid client ID format." },
        { status: 400 }
      );
    }

    // Check client exists
    const { data: existing, error: fetchError } = await supabase
      .from("clients")
      .select("id")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const { error } = await supabase.from("clients").delete().eq("id", id);

    if (error) {
      console.error("Database delete error:", error);
      return NextResponse.json({ error: "Failed to delete client" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Client deleted successfully" });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}