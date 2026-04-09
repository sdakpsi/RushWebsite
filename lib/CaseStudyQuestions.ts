export type CaseStudyQuestionItem = {
  name: string;
  label: string;
  /** When true, label shows a red QnA instruction before the question text */
  showQnaPrefix?: boolean;
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
    showQnaPrefix: true,
  },
  {
    name: "What did you like and dislike about the case study, and why?",
    label: "thoughts",
    showQnaPrefix: true,
  },
];
