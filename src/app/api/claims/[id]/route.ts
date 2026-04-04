//src\app\api\claims\[id]\route.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// UUID validation function
function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
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
      console.error("Auth error:", authError?.message);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Claim ID is required" },
        { status: 400 }
      );
    }

    if (!isValidUUID(id)) {
      return NextResponse.json(
        { error: "Invalid claim ID format" },
        { status: 400 }
      );
    }

    const { data: claim, error } = await supabase
      .from("claims")
      .select(
        `
        *,
        client:clients!claims_client_id_fkey (
          id,
          first_name,
          last_name,
          email,
          phone
        ),
        policy:policies!claims_policy_id_fkey (
          id,
          policy_number,
          policy_name,
          policy_type,
          coverage_amount
        )
      `
      )
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("Database error:", error);
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Claim not found" }, { status: 404 });
      }
      return NextResponse.json(
        { error: "Failed to fetch claim" },
        { status: 500 }
      );
    }

    const claimWithFullName = {
      ...claim,
      client: claim.client
        ? {
            ...claim.client,
            full_name:
              `${claim.client.first_name} ${claim.client.last_name}`.trim(),
          }
        : null,
    };

    return NextResponse.json({ data: claimWithFullName });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : "Unknown error"
            : undefined,
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
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
      console.error("Auth error:", authError?.message);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Claim ID is required" },
        { status: 400 }
      );
    }

    if (!isValidUUID(id)) {
      return NextResponse.json(
        { error: "Invalid claim ID format" },
        { status: 400 }
      );
    }

    const { data: existingClaim, error: checkError } = await supabase
      .from("claims")
      .select("id, client_id, policy_id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (checkError) {
      console.error("Claim check error:", checkError);
      if (checkError.code === "PGRST116") {
        return NextResponse.json({ error: "Claim not found" }, { status: 404 });
      }
      return NextResponse.json(
        { error: "Failed to verify claim ownership" },
        { status: 500 }
      );
    }

    if (body.client_id && body.client_id !== existingClaim.client_id) {
      const { data: client, error: clientError } = await supabase
        .from("clients")
        .select("id")
        .eq("id", body.client_id)
        .eq("user_id", user.id)
        .single();

      if (clientError || !client) {
        return NextResponse.json(
          { error: "Invalid client ID or client not found" },
          { status: 400 }
        );
      }
    }

    if (body.policy_id && body.policy_id !== existingClaim.policy_id) {
      const clientId = body.client_id || existingClaim.client_id;

      const { data: policy, error: policyError } = await supabase
        .from("policies")
        .select("id")
        .eq("id", body.policy_id)
        .eq("user_id", user.id)
        .eq("client_id", clientId)
        .single();

      if (policyError || !policy) {
        return NextResponse.json(
          { error: "Invalid policy ID or policy not found for this client" },
          { status: 400 }
        );
      }
    }

    if (body.incident_date) {
      const incidentDate = new Date(body.incident_date);
      const today = new Date();

      if (incidentDate > today) {
        return NextResponse.json(
          { error: "Incident date cannot be in the future" },
          { status: 400 }
        );
      }

      if (body.reported_date) {
        const reportedDate = new Date(body.reported_date);
        if (reportedDate < incidentDate) {
          return NextResponse.json(
            { error: "Reported date cannot be before incident date" },
            { status: 400 }
          );
        }
      }
    }

    if (body.investigation_start_date && body.investigation_end_date) {
      const startDate = new Date(body.investigation_start_date);
      const endDate = new Date(body.investigation_end_date);

      if (startDate >= endDate) {
        return NextResponse.json(
          { error: "Investigation start date must be before end date" },
          { status: 400 }
        );
      }
    }

    const validateAmount = (amount: any, fieldName: string) => {
      if (amount !== undefined && amount !== null && amount !== "") {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount < 0) {
          throw new Error(`${fieldName} must be a valid non-negative number`);
        }
        return numAmount;
      }
      return null;
    };

    try {
      validateAmount(body.claim_amount, "Claim amount");
      validateAmount(body.approved_amount, "Approved amount");
      validateAmount(body.settled_amount, "Settled amount");
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Invalid amount" },
        { status: 400 }
      );
    }

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    const allowedFields = [
      "client_id",
      "policy_id",
      "claim_type",
      "incident_date",
      "reported_date",
      "description",
      "incident_location",
      "claim_amount",
      "approved_amount",
      "settled_amount",
      "status",
      "priority",
      "assigned_adjuster",
      "assigned_investigator",
      "investigation_start_date",
      "investigation_end_date",
      "settlement_date",
      "documents",
      "evidence",
      "witness_information",
      "notes",
      "internal_notes",
      "tags",
    ];

    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        if (typeof body[field] === "string" && body[field].trim) {
          updateData[field] = body[field].trim() || null;
        } else {
          updateData[field] = body[field];
        }
      }
    });

    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === "") {
        updateData[key] = null;
      }
    });

    const { data: claim, error } = await supabase
      .from("claims")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select(
        `
        *,
        client:clients!claims_client_id_fkey (
          id,
          first_name,
          last_name,
          email,
          phone
        ),
        policy:policies!claims_policy_id_fkey (
          id,
          policy_number,
          policy_name,
          policy_type,
          coverage_amount
        )
      `
      )
      .single();

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to update claim" },
        { status: 500 }
      );
    }

    const claimWithFullName = {
      ...claim,
      client: claim.client
        ? {
            ...claim.client,
            full_name:
              `${claim.client.first_name} ${claim.client.last_name}`.trim(),
          }
        : null,
    };

    return NextResponse.json({
      data: claimWithFullName,
      message: "Claim updated successfully",
    });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : "Unknown error"
            : undefined,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
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
      console.error("Auth error:", authError?.message);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Claim ID is required" },
        { status: 400 }
      );
    }

    if (!isValidUUID(id)) {
      return NextResponse.json(
        { error: "Invalid claim ID format" },
        { status: 400 }
      );
    }

    const { data: existingClaim, error: checkError } = await supabase
      .from("claims")
      .select("id, claim_number, description")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (checkError) {
      console.error("Claim check error:", checkError);
      if (checkError.code === "PGRST116") {
        return NextResponse.json({ error: "Claim not found" }, { status: 404 });
      }
      return NextResponse.json(
        { error: "Failed to verify claim ownership" },
        { status: 500 }
      );
    }

    const { error: deleteError } = await supabase
      .from("claims")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("Delete error:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete claim" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: `Claim "${existingClaim.claim_number}" deleted successfully`,
    });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : "Unknown error"
            : undefined,
      },
      { status: 500 }
    );
  }
}