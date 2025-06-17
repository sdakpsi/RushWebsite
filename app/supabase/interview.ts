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

export async function createOrUpdateCaseStudy(data: CaseStudyForm, selectedProspect: ProspectInterview, existingSubmissionId?: string) {
    const supabase = createClient();

    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        const submissionData = {
            prospect: selectedProspect.id,
            active: user?.id as string,
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
        };

        let result;
        let error;

        if (existingSubmissionId) {
            // Update existing submission
            const updateResult = await supabase
                .from("case_studies")
                .update(submissionData)
                .eq("id", existingSubmissionId)
                .eq("active", user?.id as string); // Security check
            
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

        if (error) {
            console.error("Error saving case study:", error);
            throw error;
        }

        return { data: result, isUpdate: !!existingSubmissionId };

    } catch (error) {
        throw error;
    }
}

// Keep the original function for backward compatibility
export async function createCaseStudy(data: CaseStudyForm, selectedProspect: ProspectInterview) {
    return createOrUpdateCaseStudy(data, selectedProspect);
}