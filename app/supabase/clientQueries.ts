import { type ProspectInterview } from "@/lib/types";
import { createClient } from "@/utils/supabase/client";

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

  if (isPIC) {
    // Check if TESTING mode is enabled
    const isTesting = process.env.NEXT_PUBLIC_TESTING === 'true';
    
    if (isTesting) {
      // In testing mode, return all non-active, non-PIC users regardless of application status
      const { data: users, error: usersError } = await supabase
        .from("users")
        .select("*")
        .eq("is_active", false)
        .eq("is_pic", false)
        .order("full_name", { ascending: true });

      if (usersError) {
        console.error("Error fetching users in testing mode:", usersError.message);
        return [];
      }
      
      usersData = users || [];
    } else {
      // Production mode - use JOIN query for better performance
      const { data: users, error: usersError } = await supabase
        .from("users")
        .select(`
          *,
          applications!inner(
            submitted
          )
        `)
        .eq("is_active", false)
        .eq("is_pic", false)
        .not("applications.submitted", "is", null)
        .order("full_name", { ascending: true });

      if (usersError) {
        console.error("Error fetching users with applications:", usersError.message);
        return [];
      }
      
      usersData = users || [];
    }
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
    
    if (error) {
      console.error("Error checking PIC status:", error.message);
      return false;
    }
    
    isPIC = data?.is_pic || false;
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

export async function getCases(prospectID: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("case_studies")
    .select("*")
    .eq("prospect", prospectID);

  if (error) {
    console.error("Error fetching cases:", error.message);
    return [];
  }
  return data || [];
}

export async function getInterviews(prospectID: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("interviews")
    .select("*")
    .eq("prospect_id", prospectID);

  if (error) {
    console.error("Error fetching interviews:", error.message);
    return [];
  }
  return data || [];
}

// Bulk query functions for better performance
export async function getBulkAvatars(userIds: string[]) {
  if (userIds.length === 0) return {};
  
  const supabase = createClient();

  const { data, error } = await supabase
    .from("user_avatar")
    .select("user_id, avatar_url")
    .in("user_id", userIds);

  if (error) {
    console.error("Error fetching bulk avatars:", error.message);
    return {};
  }
  
  // Convert to lookup object
  const avatarMap: { [key: string]: string | null } = {};
  data?.forEach(item => {
    avatarMap[item.user_id] = item.avatar_url;
  });
  
  return avatarMap;
}

// Optimized queries for ApplicantCard (kept for backwards compatibility)
export async function getApplicantAvatar(userId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("user_avatar")
    .select("avatar_url")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Error fetching avatar URL:", error.message);
    return null;
  }
  return data?.avatar_url || null;
}

export async function getApplicantCaseStudies(userId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("case_studies")
    .select("active_name")
    .eq("prospect", userId);

  if (error) {
    console.error("Error fetching case studies:", error.message);
    return [];
  }
  return data || [];
}

export async function getApplicantInterviews(userId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("interviews")
    .select("active_name")
    .eq("prospect_id", userId);

  if (error) {
    console.error("Error fetching interviews:", error.message);
    return [];
  }
  return data || [];
}

export async function getApplicantTotalScore(userId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("users")
    .select("total_score")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching total score:", error.message);
    return null;
  }
  return data?.total_score || 0;
}

export async function getCurrentUserData() {
  const supabase = createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  // Get user data including photo_url from database
  const { data, error } = await supabase
    .from("users")
    .select("is_active, is_pic, photo_url")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Error fetching user data:", error.message);
    throw error;
  }

  const hasPhoto = !!data?.photo_url;
  const photoUrl = data?.photo_url;

  const result = {
    user,
    userData: data,
    isActive: !!data?.is_active,
    isPIC: !!data?.is_pic,
    hasPhoto,
    photoUrl
  };

  console.log('getCurrentUserData result:', result);
  return result;
}