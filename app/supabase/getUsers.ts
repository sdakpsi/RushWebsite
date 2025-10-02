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
    
    if (error) {
      console.error("Error checking PIC status in getUsers:", error.message);
      return [];
    }
    
    isPIC = data?.is_pic || false;
  }

  // .eq("cased", true) // TODO: Make this a parameter that can be passed in

  if (isPIC) {
    const { data: apps, error: appsError } = await supabase
      .from("applications")
      .select("user_id")
      .not("submitted", "is", null);

    if (appsError) {
      console.error("Error fetching applications:", appsError.message);
      return [];
    }

    const validUserIds = apps?.map((app) => app.user_id) ?? [];

    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("*")
      .eq("is_active", false)
      .eq("is_pic", false)
      .in("id", validUserIds)
      .order("full_name", { ascending: true });

    if (usersError) {
      console.error("Error fetching users:", usersError.message);
      return [];
    }
    
    usersData = users || [];
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
    .select(`
      *,
      applications(
        id,
        submitted
      )
    `)
    .in("id", prospectIds);

  if (usersError) {
    return [];
  }

  // Transform the data to match expected format
  const transformedUsers = usersData?.map((user: any) => {
    // Find submitted application
    const submittedApp = user.applications?.find((app: any) => app.submitted !== null);
    return {
      ...user,
      application: submittedApp?.id || null
    };
  }) || [];

  return transformedUsers;
}

export async function getIsPIC() {
  const supabase = createClient();

  let isPIC = false;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log('🔍 getIsPIC: User ID:', user?.id);

  if (user) {
    const { data, error } = await supabase
      .from("users")
      .select("is_pic")
      .eq("id", user.id)
      .single();
    
    console.log('🔍 getIsPIC: Query result:', { data, error: error?.message });
    
    if (error) {
      console.error("Error checking PIC status:", error.message);
      return false;
    }
    
    isPIC = data?.is_pic || false;
    console.log('🔍 getIsPIC: Final result:', isPIC);
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
    
    if (error) {
      console.error("Error checking active status:", error.message);
      return false;
    }
    
    return (data?.is_active || data?.is_pic) || false;
  }
  return false;
}

export async function getApplication(applicationID: string) {
  const supabase = createClient();

  if (!applicationID) {
    console.error("Application ID is required.");
    return null;
  }

  // First get the application
  const { data: appData, error: appError } = await supabase
    .from("applications")
    .select("*")
    .eq("id", applicationID)
    .single();

  if (appError) {
    console.error("Error fetching application:", appError.message);
    return null;
  }

  // Then get the user's name using the user_id
  if (appData && appData.user_id) {
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("full_name")
      .eq("id", appData.user_id)
      .single();

    if (!userError && userData) {
      appData.name = userData.full_name;
    }
  }
  
  return appData;
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

  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .order("prospect_name", { ascending: true });

  const userData = await getUsers();

  if (error) {
    console.error("Error fetching interviews:", error.message);
    return [];
  }

  // const filteredData = data.filter((comment) => {
  //   const userDataUser = userData.find(
  //     (user) => user.id === comment.prospect_id
  //   );
  //   console.log(userDataUser);
  //   return userDataUser;
  // });

  return data;
}

export async function getInterviewProspects(): Promise<ProspectInterview[]> {
  const supabase = createClient();
  let hasPerms = false;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error("User not authenticated for interview prospects");
    return [];
  }

  const { data, error } = await supabase
    .from("users")
    .select("is_pic, is_active")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Error checking permissions:", error.message);
    return [];
  }

  if (data?.is_pic || data?.is_active) {
    hasPerms = true;
  }

  if (!hasPerms) {
    console.error("User lacks permissions to view interview prospects");
    return [];
  }

  // User is marked active, proceed to get interview prospects
  const { data: prospects, error: prospectsError } = await supabase
    .from("users")
    .select("full_name, email, id")
    .eq("is_active", false)
    .eq("is_pic", false)
    .order("full_name", { ascending: true });

  if (prospectsError) {
    console.error("Error fetching prospects:", prospectsError.message);
    return [];
  }

  return prospects || [];
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

export async function getUsersForComments(): Promise<Array<{id: string, full_name: string, email: string}> | null> {
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

  // User is marked active, proceed to get all prospects (same logic as getInterviewProspects)
  if (hasPerms) {
    const { data, error } = await supabase
      .from("users")
      .select("id, full_name, email, photo_url")
      .eq("is_active", false)
      .eq("is_pic", false)
      .order("full_name", { ascending: true });

    if (error) {
      console.error("Error fetching users for comments:", error.message);
      return null;
    }
    return data;
  }
  return null;
}

export async function getActiveSubmissionsWithStatus(
  type: "interviews" | "case_studies"
): Promise<Array<{name: string, status: 'complete' | 'incomplete', id: string}> | null> {
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

  if (userError || (!userData?.is_pic && !userData?.is_active)) {
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
      .select("id, full_name")
      .in("id", prospectIds);

    if (prospectError) {
      console.error("Error fetching prospect data:", prospectError.message);
      return null;
    }

    // For interviews, assume all are complete (no draft logic implemented yet)
    return prospectData.map((prospect) => ({
      name: prospect.full_name as string,
      status: 'complete' as const,
      id: prospect.id as string
    }));
  }

  // For case studies, check for incomplete submissions
  const { data, error } = await supabase
    .from(type)
    .select("prospect, leadership_score, teamwork_score, public_speaking_score, analytical_score, leadership_comments, teamwork_comments, public_speaking_comments, analytical_comments, role, thoughts")
    .eq("active", user.id);

  if (error) {
    console.error(`Error fetching ${type} prospects:`, error.message);
    return null;
  }

  const prospectIds = data.map((item) => item.prospect as string);

  const { data: prospectData, error: prospectError } = await supabase
    .from("users")
    .select("id, full_name")
    .in("id", prospectIds);

  if (prospectError) {
    console.error("Error fetching prospect data:", prospectError.message);
    return null;
  }

  // Check each submission for completeness
  return prospectData.map((prospect) => {
    const submission = data.find(item => item.prospect === prospect.id);

    // Consider incomplete if any required field is missing/empty
    // Note: scores can be 0, so check for null/undefined specifically
    const isIncomplete = !submission ||
      submission.leadership_score == null ||
      submission.teamwork_score == null ||
      submission.public_speaking_score == null ||
      submission.analytical_score == null ||
      !submission.leadership_comments?.trim() ||
      !submission.teamwork_comments?.trim() ||
      !submission.public_speaking_comments?.trim() ||
      !submission.analytical_comments?.trim() ||
      !submission.role?.trim() ||
      !submission.thoughts?.trim();

    return {
      name: prospect.full_name as string,
      status: isIncomplete ? 'incomplete' as const : 'complete' as const,
      id: prospect.id as string
    };
  });
}

