export type CaseStudyQuestionItem = {
  name: string;
  label: string;
  /** Bold red label before the question (e.g. which panelist asks it) */
  qnaRoleLabel?: string;
};

export const caseStudyData: CaseStudyQuestionItem[] = [
  {
    name: "Leadership",
    label: "leadership",
  },
  {
    name: "Teamwork",
    label: "teamwork",
  },
  {
    name: "Public Speaking",
    label: "publicSpeaking",
  },
  {
    name: "Analytical",
    label: "analytical",
  },
  {
    name: "How do you think the group performed as a whole, and how did you contribute individually?",
    label: "role",
    qnaRoleLabel: "Lead panelist asks",
  },
  {
    name: "What did you like and dislike about the case study, and why?",
    label: "thoughts",
    qnaRoleLabel: "Time keeper asks",
  },
];
