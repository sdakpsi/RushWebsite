"use server";
import { type ProspectInterview, type Comment } from "@/lib/types";
import { createClient } from "@/utils/supabase/server";

export async function getUsers() {
  const supabase = createClient();

  let isPIC = false;
  let usersData = [];
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data, error } = await supabase
      .from("users")
      .select("is_pic")
      .eq("id", user.id)
      .single();
    isPIC = data?.is_pic;
  }

  if (isPIC) {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("is_active", false)
      .eq("is_pic", false)
      //.eq('cased', true) // TODO: Make this a parameter that can be passed in
      .order("full_name", { ascending: true });
    if (error) {
      console.error(error);
    } else {
      usersData = data;
    }
  }
  return usersData;
}

export async function getInterestFormSubmissions() {
  const supabase = createClient();

  let isActive = false;
  let interestFormData = [];
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data, error } = await supabase
      .from("users")
      .select("is_active")
      .eq("id", user.id)
      .single();
    isActive = data?.is_active;
  }

  if (isActive) {
    const { data, error } = await supabase
      .from("interests")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) {
      console.error(error);
    } else {
      interestFormData = data;
    }
  }
  return interestFormData;
}

export async function getDelibsUsers() {
  const supabase = createClient();

  // First, fetch all prospect_ids from the delibs table
  const { data: delibsData, error: delibsError } = await supabase
    .from("delibs")
    .select("prospect_id");

  if (delibsError) {
    return [];
  }

  // Extract prospect_ids from the delibsData
  const prospectIds = delibsData.map((delib) => delib.prospect_id);

  if (prospectIds.length === 0) {
    return [];
  }

  const { data: usersData, error: usersError } = await supabase
    .from("users")
    .select("*")
    .in("id", prospectIds);

  if (usersError) {
    return [];
  }

  return usersData;
}

export async function getIsPIC() {
  const supabase = createClient();

  let isPIC = false;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data, error } = await supabase
      .from("users")
      .select("is_pic")
      .eq("id", user.id)
      .single();
    isPIC = data?.is_pic;
  }

  return isPIC;
}

export async function getIsActive() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const { data, error } = await supabase
      .from("users")
      .select("is_active, is_pic")
      .eq("id", user.id)
      .single();
    return data?.is_active || data?.is_pic;
  }
  return false;
}

export async function getApplication(applicationID: string) {
  const supabase = createClient();

  if (!applicationID) {
    console.error("Application ID is required.");
    return null;
  }

  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("id", applicationID)
    .single();

  if (error) {
    console.error("Error fetching application:", error.message);
    return null;
  }
  return data;
}

export async function getCases(prospectID: string | null) {
  const supabase = createClient();

  if (!prospectID) {
    console.error("Application ID is required.");
    return null;
  }

  const { data, error } = await supabase
    .from("case_studies")
    .select("*")
    .eq("prospect", prospectID);

  if (error) {
    console.error("Error fetching application:", error.message);
    return null;
  }
  return data;
}

export async function getInterviews(prospectID: string | null) {
  const supabase = createClient();

  if (!prospectID) {
    console.error("Application ID is required.");
    return null;
  }

  const { data, error } = await supabase
    .from("interviews")
    .select("*")
    .eq("prospect_id", prospectID);

  if (error) {
    console.error("Error fetching interviews:", error.message);
    return null;
  }
  return data;
}

export async function getComments(): Promise<Comment[]> {
  const supabase = createClient();

  const { data, error } = await supabase.from("comments").select("*");

  if (error) {
    console.error("Error fetching interviews:", error.message);
    return [];
  }
  return data;
}

export async function getInterviewProspects(): Promise<
  ProspectInterview[] | null
> {
  const supabase = createClient();
  let hasPerms = false;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data, error } = await supabase
      .from("users")
      .select("is_pic, is_active")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Error checking permissions:", error.message);
      return null;
    }

    if (data?.is_pic || data?.is_active) {
      hasPerms = true;
    }
  }

  // User is marked active, proceed to get interview prospects
  if (hasPerms) {
    const { data, error } = await supabase
      .from("users")
      .select("full_name, email, id")
      .eq("is_active", false)
      .eq("is_pic", false)
      //.eq('cased', true) //TODO: Make this a paramter that can be passed in
      .order("full_name", { ascending: true });

    if (error) {
      return null;
    }
    return data;
  }
  return null;
}

export async function getActiveSubmissions(
  type: "interviews" | "case_studies"
): Promise<string[] | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("is_pic, is_active")
    .eq("id", user.id)
    .single();

  if (userError) {
    console.error("Error checking user permissions:", userError.message);
    return null;
  }

  if (!userData?.is_pic && !userData?.is_active) {
    return null;
  }

  if (type === "interviews") {
    const { data, error } = await supabase
      .from(type)
      .select("prospect_id")
      .eq("active_id", user.id);

    if (error) {
      console.error(`Error fetching ${type} prospects:`, error.message);
      return null;
    }

    const prospectIds = data.map((item) => item.prospect_id as string);

    const { data: prospectData, error: prospectError } = await supabase
      .from("users")
      .select("full_name")
      .in("id", prospectIds);

    if (prospectError) {
      console.error("Error fetching prospect data:", prospectError.message);
      return null;
    }

    return prospectData.map((prospect) => prospect.full_name as string);
  }

  const { data, error } = await supabase
    .from(type)
    .select("prospect")
    .eq("active", user.id);

  if (error) {
    console.error(`Error fetching ${type} prospects:`, error.message);
    return null;
  }

  const prospectIds = data.map((item) => item.prospect as string);

  const { data: prospectData, error: prospectError } = await supabase
    .from("users")
    .select("full_name")
    .in("id", prospectIds);

  if (prospectError) {
    console.error("Error fetching prospect data:", prospectError.message);
    return null;
  }

  return prospectData.map((prospect) => prospect.full_name as string);
}
