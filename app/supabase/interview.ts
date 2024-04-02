"use server"

import { InterviewForm, ProspectInterview } from "@/lib/types";
import { createClient } from "@/utils/supabase/server";

export async function createInterview(data: InterviewForm, selectedProspect: ProspectInterview) {
    console.log(data, selectedProspect)
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

        console.log("Interview created:", interview);
    } catch (error) {
        console.error("An error occurred:", error);
        throw error;
    }
}