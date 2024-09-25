export enum ApplicationFileTypes {
  RESUME = "resume",
  COVER_LETTER = "cover letter",
}

export enum StudentYears {
  FirstYear = "First Year",
  SecondYear = "Second Year",
  ThirdYear = "Third Year",
  ThirdYearTransfer = "Third Year Transfer",
  FourthYear = "Fourth Year",
  FourthYearTransfer = "Fourth Year Transfer",
  FifthYearPlus = "Fifth Year+",
}

export enum UCSDQuarters {
  Spring = "Spring",
  Fall = "Fall",
  Winter = "Winter",
}

export enum UCSDColleges {
  REVELLE = "Revelle",
  WARREN = "Warren",
  MUIR = "Muir",
  MARSHALL = "Marshall",
  ERC = "ERC",
  SIXTH = "Sixth",
  SEVENTH = "Seventh",
  EIGHTH = "Eighth",
}

export type ProspectInterview = {
  id: string;
  full_name: string;
  email: string;
};

export interface ApplicationFormState {
  applicationId: string;
  firstName: string;
  lastName: string;
  pronouns: string;
  phoneNumber: string;
  yearInCollege: string;
  graduationYear: number | null;
  graduationQuarter: string;
  major: string;
  minor: string | null;
  cumulativeGPA: string;
  currentClasses: string;
  extracurricularActivities: string;
  proudAccomplishment: string;
  joinReason: string;
  lifeGoals: string;
  comfortZone: string;
  businessType: string;
  additionalDetails: string;
  resumeFileUrl: string;
  coverLetterFileUrl: string;
  college: string;
  facebook: string;
  instagram: string;
  linkedIn: string;
  tiktok: string;
}

export interface RushEvents {
  "Info Night": boolean;
  "Business Workshop": boolean;
  "Case Study": boolean;
  "Social Night": boolean;
  Interview: boolean;
}

//in supabase, it's stored as pythonic case (aboutYourself -> about_yourself) + a few more name changes sorry
// but you can find it in the interviews table
export interface InterviewForm {
  name: string;
  aboutYourself: string;
  careerInterests: string;
  instanceForFriend: string;
  failureOvercome: string;
  disagreementHandled: string;
  handlingCriticism: string;
  learningAbout: string;
  sillyQuestion: string | null;
  questionsAndCommitments: string;
  whyGiveBid: string;
  mostInfluential: string;
  moreQuestions: string;
  otherActives: string;
  events: RushEvents;
  additionalComments: string | null;
  empathy: number;
  openmindedness: number;
  pledgeable: number;
  motivated: number;
  sociallyAware: number;
}

export interface CaseStudyForm {
  name: string;
  leadership_score: number;
  teamwork_score: number;
  publicSpeaking_score: number;
  analytical_score: number;
  otherActives: string;
  leadership_comments: string;
  teamwork_comments: string;
  publicSpeaking_comments: string;
  analytical_comments: string;
  additionalComments: string;
  role: string;
  thoughts: string;
}

export type InterestForm = {
  name: string;
  email: string;
  phone: string;
};

export interface Packet {
  id: string;
  created_at: string;
  full_name: string;
  is_active: boolean;
  is_pic: boolean;
  application: string | null;
  case_study: string | null;
  interview: string | null;
  email: string;
  active_case_studies: string | null;
  active_interviews: string | null;
  total_score: number | null;
}

export interface Comment {
  id: string;
  created_at: string;
  prospect_id: string;
  active_id: string;
  prospect_name: string | null;
  active_name: string | null;
  comment: string | null;
  interaction: string | null;
  invite: string | null;
}
