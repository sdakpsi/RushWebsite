"use server"

import { CaseStudyForm, InterviewForm, ProspectInterview } from "@/lib/types";
import { createClient } from "@/utils/supabase/server";

export async function createInterview(data: InterviewForm, selectedProspect: ProspectInterview) {
    const supabase = createClient();

    try {
        const {
            data: { user },
          } = await supabase.auth.getUser();
const eventsAttendedArray = Object.entries(data.events)
  .filter(([key, value]) => value)
  .map(([key, value]) => key);

const events_attended = eventsAttendedArray.join(', ');
const num_events= eventsAttendedArray.length;

    const { data: interview, error } = await supabase
        .from("interviews")
        .insert([
            {
                prospect_id: selectedProspect.id,
                active_id: user?.id as string,
                about_yourself: data.aboutYourself,
                other_actives: data.otherActives,
                active_name: data.name,
                career_interests: data.careerInterests,
                instance_for_friend: data.instanceForFriend,
                failure_overcome: data.failureOvercome,
                disagreement_handled: data.disagreementHandled,
                handling_criticism: data.handlingCriticism,
                learning_about: data.learningAbout,
                silly_question: data.sillyQuestion ?? "",
                questions_and_commitments: data.questionsAndCommitments,
                why_give_bid: data.whyGiveBid,
                most_influential: data.mostInfluential,
                more_questions: data.moreQuestions,
                events_attended: events_attended,
                num_events: num_events,
                additional: data.additionalComments ?? "",
                empathy: data.empathy,
                open_minded: data.openmindedness,
                pledgeable: data.pledgeable,
                motivated: data.motivated,
                socially_aware: data.sociallyAware,
            },
        ]); 
        if (error) {
            console.error("Error inserting data:", error);
            throw error;
        }

    } catch (error) {
        throw error;
    }
}

export async function getExistingCaseStudy(prospectId: string, activeId?: string) {
    const supabase = createClient();

    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        const userId = activeId || user?.id;
        if (!userId) {
            throw new Error("No user ID available");
        }

        const { data, error } = await supabase
            .from("case_studies")
            .select("*")
            .eq("prospect", prospectId)
            .eq("active", userId)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
            console.error("Error fetching existing case study:", error);
            throw error;
        }

        return data;
    } catch (error) {
        throw error;
    }
}

export async function autoSaveCaseStudy(data: Partial<CaseStudyForm>, selectedProspect: ProspectInterview, existingSubmissionId?: string) {
    const supabase = createClient();

    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user?.id) {
            throw new Error("No user authenticated");
        }

        const submissionData = {
            prospect: selectedProspect.id,
            active: user.id,
            active_name: data.name || '',
            leadership_score: data.leadership_score ?? null,
            teamwork_score: data.teamwork_score ?? null,
            public_speaking_score: data.publicSpeaking_score ?? null,
            analytical_score: data.analytical_score ?? null,
            other_actives: data.otherActives || '',
            leadership_comments: data.leadership_comments || '',
            teamwork_comments: data.teamwork_comments || '',
            public_speaking_comments: data.publicSpeaking_comments || '',
            analytical_comments: data.analytical_comments || '',
            additional: data.additionalComments || '',
            role: data.role || '',
            thoughts: data.thoughts || '',
        };

        let result;
        let error;

        if (existingSubmissionId) {
            // Update existing submission
            const updateResult = await supabase
                .from("case_studies")
                .update(submissionData)
                .eq("id", existingSubmissionId)
                .eq("active", user.id) // Security check
                .select();

            result = updateResult.data;
            error = updateResult.error;
        } else {
            // Check if a case study already exists for this prospect/active combination
            const { data: existing } = await supabase
                .from("case_studies")
                .select("id")
                .eq("prospect", selectedProspect.id)
                .eq("active", user.id)
                .single();

            if (existing) {
                // Update the existing one instead of creating a duplicate
                const updateResult = await supabase
                    .from("case_studies")
                    .update(submissionData)
                    .eq("id", existing.id)
                    .select();

                result = updateResult.data;
                error = updateResult.error;
            } else {
                // Create new draft submission
                const insertResult = await supabase
                    .from("case_studies")
                    .insert([submissionData])
                    .select();

                result = insertResult.data;
                error = insertResult.error;
            }
        }

        if (error) {
            console.error("Error auto-saving case study:", error);
            throw error;
        }

        return { data: result, isUpdate: !!existingSubmissionId || !!result };

    } catch (error) {
        throw error;
    }
}

export async function createOrUpdateCaseStudy(data: CaseStudyForm, selectedProspect: ProspectInterview, existingSubmissionId?: string) {
    const supabase = createClient();

    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user?.id) {
            throw new Error("No user authenticated");
        }

        const submissionData = {
            prospect: selectedProspect.id,
            active: user.id,
            active_name: data.name,
            leadership_score: data.leadership_score,
            teamwork_score: data.teamwork_score,
            public_speaking_score: data.publicSpeaking_score,
            analytical_score: data.analytical_score,
            other_actives: data.otherActives,
            leadership_comments: data.leadership_comments,
            teamwork_comments: data.teamwork_comments,
            public_speaking_comments: data.publicSpeaking_comments,
            analytical_comments: data.analytical_comments,
            additional: data.additionalComments ?? "",
            role: data.role,
            thoughts: data.thoughts,
            social_invite: data.socialNight.toLowerCase(),
        };

        let result;
        let error;

        if (existingSubmissionId) {
            // Update existing submission
            const updateResult = await supabase
                .from("case_studies")
                .update(submissionData)
                .eq("id", existingSubmissionId)
                .eq("active", user.id); // Security check

            result = updateResult.data;
            error = updateResult.error;
        } else {
            // Check if a case study already exists for this prospect/active combination
            const { data: existing } = await supabase
                .from("case_studies")
                .select("id")
                .eq("prospect", selectedProspect.id)
                .eq("active", user.id)
                .single();

            if (existing) {
                // Update the existing one instead of creating a duplicate
                const updateResult = await supabase
                    .from("case_studies")
                    .update(submissionData)
                    .eq("id", existing.id);

                result = updateResult.data;
                error = updateResult.error;
            } else {
                // Create new submission
                const insertResult = await supabase
                    .from("case_studies")
                    .insert([submissionData]);

                result = insertResult.data;
                error = insertResult.error;
            }
        }

        if (error) {
            console.error("Error saving case study:", error);
            throw error;
        }

        return { data: result, isUpdate: !!existingSubmissionId || !!result };

    } catch (error) {
        throw error;
    }
}

// Keep the original function for backward compatibility
export async function createCaseStudy(data: CaseStudyForm, selectedProspect: ProspectInterview) {
    return createOrUpdateCaseStudy(data, selectedProspect);
}

export async function loadCaseStudyFormData(prospectId: string) {
    try {
        const existingSubmission = await getExistingCaseStudy(prospectId);

        if (existingSubmission) {
            // Capitalize the stored lowercase enum value back to title case for the form
            const socialInviteMap: Record<string, string> = { yes: "Yes", maybe: "Maybe", no: "No" };

            const formData = {
                name: existingSubmission.active_name,
                otherActives: existingSubmission.other_actives,
                leadership_score: existingSubmission.leadership_score,
                teamwork_score: existingSubmission.teamwork_score,
                publicSpeaking_score: existingSubmission.public_speaking_score,
                analytical_score: existingSubmission.analytical_score,
                leadership_comments: existingSubmission.leadership_comments,
                teamwork_comments: existingSubmission.teamwork_comments,
                publicSpeaking_comments: existingSubmission.public_speaking_comments,
                analytical_comments: existingSubmission.analytical_comments,
                additionalComments: existingSubmission.additional,
                role: existingSubmission.role,
                thoughts: existingSubmission.thoughts,
                socialNight: socialInviteMap[existingSubmission.social_invite] ?? "",
            };
            
            return {
                exists: true,
                data: formData,
                submissionId: existingSubmission.id,
                isEditing: true
            };
        }
        
        return {
            exists: false,
            data: null,
            submissionId: undefined,
            isEditing: false
        };
    } catch (error) {
        console.error('Error loading case study form data:', error);
        return {
            exists: false,
            data: null,
            submissionId: undefined,
            isEditing: false
        };
    }
}