import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = createClient();

  try {
    const { userId, avatarUrl } = await request.json();

    if (!userId || !avatarUrl) {
      return NextResponse.json(
        { error: "User ID and avatar URL are required" },
        { status: 400 }
      );
    }

    // Check if user_avatar entry exists
    const { data: existingAvatar } = await supabase
      .from("user_avatar")
      .select("*")
      .eq("user_id", userId)
      .single();

    let result;
    if (existingAvatar) {
      // Update existing avatar
      result = await supabase
        .from("user_avatar")
        .update({ avatar_url: avatarUrl })
        .eq("user_id", userId);
    } else {
      // Insert new avatar
      result = await supabase
        .from("user_avatar")
        .insert([{ user_id: userId, avatar_url: avatarUrl }]);
    }

    if (result.error) {
      throw result.error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error uploading avatar:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload avatar" },
      { status: 500 }
    );
  }
}
