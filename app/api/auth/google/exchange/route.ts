import { NextRequest, NextResponse } from "next/server";

type GoogleTokenExchangeResponse = {
  error?: string;
  error_description?: string;
  id_token?: string;
};

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

    return NextResponse.json({ idToken: tokenResult.id_token });
  } catch (error) {
    console.error("Google auth exchange error:", error);
    return NextResponse.json({ error: "Google sign-in failed." }, { status: 500 });
  }
}
