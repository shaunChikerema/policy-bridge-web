// src/app/api/policies/[id]/route.ts
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!UUID_REGEX.test(id)) {
      return NextResponse.json({ error: "Invalid policy ID format" }, { status: 400 });
    }

    const { data: policy, error } = await supabase
      .from("policies")
      .select(`*, client:clients!policies_client_id_fkey (id, first_name, last_name, email, phone)`)
      .eq("id", id)
      .single();

    if (error) {
      console.error("Database error:", error);
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Policy not found" }, { status: 404 });
      }
      return NextResponse.json({ error: "Failed to fetch policy" }, { status: 500 });
    }

    return NextResponse.json({
      data: {
        ...policy,
        client: policy.client
          ? { ...policy.client, full_name: `${policy.client.first_name} ${policy.client.last_name}`.trim() }
          : null,
      },
    });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!UUID_REGEX.test(id)) {
      return NextResponse.json({ error: "Invalid policy ID format" }, { status: 400 });
    }

    const body = await request.json();

    // Check policy exists
    const { data: existing, error: checkError } = await supabase
      .from("policies")
      .select("id, client_id")
      .eq("id", id)
      .single();

    if (checkError || !existing) {
      return NextResponse.json({ error: "Policy not found" }, { status: 404 });
    }

    // Validate dates if provided
    if (body.effective_date && body.expiration_date) {
      if (new Date(body.effective_date) >= new Date(body.expiration_date)) {
        return NextResponse.json({ error: "Effective date must be before expiration date" }, { status: 400 });
      }
    }

    const allowedFields = [
      "client_id", "policy_name", "policy_type", "description",
      "coverage_amount", "premium_amount", "deductible",
      "effective_date", "expiration_date", "renewal_date",
      "status", "priority", "terms_conditions", "policy_document_url",
      "beneficiaries", "riders", "notes", "tags",
    ];

    const updateData: Record<string, any> = { updated_at: new Date().toISOString() };
    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        updateData[field] = typeof body[field] === "string" ? (body[field].trim() || null) : body[field];
      }
    });

    const { data: policy, error } = await supabase
      .from("policies")
      .update(updateData)
      .eq("id", id)
      .select(`*, client:clients!policies_client_id_fkey (id, first_name, last_name, email, phone)`)
      .single();

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json({ error: "Failed to update policy" }, { status: 500 });
    }

    return NextResponse.json({
      data: {
        ...policy,
        client: policy.client
          ? { ...policy.client, full_name: `${policy.client.first_name} ${policy.client.last_name}`.trim() }
          : null,
      },
      message: "Policy updated successfully",
    });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!UUID_REGEX.test(id)) {
      return NextResponse.json({ error: "Invalid policy ID format" }, { status: 400 });
    }

    const { data: existing, error: checkError } = await supabase
      .from("policies")
      .select("id, policy_name")
      .eq("id", id)
      .single();

    if (checkError || !existing) {
      return NextResponse.json({ error: "Policy not found" }, { status: 404 });
    }

    const { error: deleteError } = await supabase
      .from("policies")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Delete error:", deleteError);
      return NextResponse.json({ error: "Failed to delete policy" }, { status: 500 });
    }

    return NextResponse.json({ message: `Policy "${existing.policy_name}" deleted successfully` });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}