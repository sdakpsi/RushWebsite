import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

type GoogleTokenExchangeResponse = {
  error?: string;
  error_description?: string;
  id_token?: string;
};

function decodeJwtEmail(token: string): string | null {
  try {
    const payload = token.split(".")[1];
    const decoded = Buffer.from(payload, "base64url").toString("utf-8");
    return JSON.parse(decoded).email ?? null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { code, origin } = await request.json();

    if (typeof code !== "string" || !code) {
      return NextResponse.json({ error: "Missing Google authorization code." }, { status: 400 });
    }

    if (typeof origin !== "string" || !origin.startsWith("http")) {
      return NextResponse.json({ error: "Missing or invalid origin." }, { status: 400 });
    }

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: "Google OAuth server credentials are not configured." },
        { status: 500 },
      );
    }

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: origin,
        grant_type: "authorization_code",
      }),
      cache: "no-store",
    });

    const tokenResult = (await tokenResponse.json()) as GoogleTokenExchangeResponse;

    if (!tokenResponse.ok) {
      return NextResponse.json(
        {
          error:
            tokenResult.error_description ??
            tokenResult.error ??
            "Failed to exchange Google authorization code.",
        },
        { status: tokenResponse.status },
      );
    }

    if (!tokenResult.id_token) {
      return NextResponse.json(
        { error: "Google token exchange did not return an ID token." },
        { status: 400 },
      );
    }

    const email = decodeJwtEmail(tokenResult.id_token);

    // If not a @ucsd.edu address, check whether this person already has an
    // account in the users table before allowing sign-in.
    if (!email?.endsWith("@ucsd.edu")) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!supabaseUrl || !serviceRoleKey) {
        return NextResponse.json(
          { error: "Server configuration error." },
          { status: 500 },
        );
      }

      const adminClient = createClient(supabaseUrl, serviceRoleKey);
      const { data: existingUser, error: dbError } = await adminClient
        .from("users")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (dbError) {
        console.error("Error checking user existence:", dbError.message);
        return NextResponse.json({ error: "Failed to verify account." }, { status: 500 });
      }

      if (!existingUser) {
        return NextResponse.json(
          { error: "Only @ucsd.edu email addresses can create an account." },
          { status: 403 },
        );
      }
    }

    return NextResponse.json({ idToken: tokenResult.id_token });
  } catch (error) {
    console.error("Google auth exchange error:", error);
    return NextResponse.json({ error: "Google sign-in failed." }, { status: 500 });
  }
}
