export type PacketScoreRow = {
  score_type?: string | null;
  score?: number | null;
};

export type PacketScoreCaseStudy = {
  leadership_score?: number | null;
  teamwork_score?: number | null;
  analytical_score?: number | null;
};

export type PacketScoreInterview = {
  pledgeable?: number | null;
  open_minded?: number | null;
  motivated?: number | null;
  events_attended?: string | null;
};

export type PacketScoreComponentKey =
  | "pledgeFactor"
  | "professionalFactor"
  | "curious"
  | "events"
  | "resumeScore"
  | "coverLetterScore"
  | "applicationProfessionalismScore"
  | "applicationBrotherhoodScore"
  | "teamworkScore"
  | "leadershipScore"
  | "analyticalScore";

export type PacketScoreComponents = Record<
  PacketScoreComponentKey,
  { score: number; outOf: number }
>;

export function averagePacketScore(
  scores: PacketScoreRow[],
  scoreType: string
) {
  const matchingScores = scores.filter(
    (scoreRow) => scoreRow.score_type === scoreType && scoreRow.score != null
  );

  if (matchingScores.length === 0) {
    return null;
  }

  return (
    matchingScores.reduce(
      (total, scoreRow) => total + Number(scoreRow.score || 0),
      0
    ) / matchingScores.length
  );
}

function averageCaseScore(
  caseStudies: PacketScoreCaseStudy[],
  scoreKey: keyof PacketScoreCaseStudy
) {
  if (caseStudies.length === 0) {
    return 0;
  }

  return (
    caseStudies.reduce(
      (sum, caseStudy) => sum + Number(caseStudy[scoreKey] || 0),
      0
    ) / caseStudies.length
  );
}

function averageInterviewScore(
  interviews: PacketScoreInterview[],
  scoreKey: "pledgeable" | "open_minded" | "motivated"
) {
  if (interviews.length === 0) {
    return 0;
  }

  return (
    interviews.reduce(
      (sum, interview) => sum + Number(interview[scoreKey] || 0),
      0
    ) / interviews.length
  );
}

function averageEventsAttended(interviews: PacketScoreInterview[]) {
  if (interviews.length === 0) {
    return 0;
  }

  return Math.ceil(
    interviews.reduce((sum, interview) => {
      const eventsCount = interview.events_attended
        ? interview.events_attended.split(",").length
        : 0;
      return sum + eventsCount;
    }, 0) / interviews.length
  );
}

export function calculatePacketScoreComponents({
  applicationProfessionalismScore,
  applicationBrotherhoodScore,
  resumeScore,
  caseStudies,
  interviews,
  hasCoverLetter,
}: {
  applicationProfessionalismScore: number | null;
  applicationBrotherhoodScore: number | null;
  resumeScore: number | null;
  caseStudies: PacketScoreCaseStudy[];
  interviews: PacketScoreInterview[];
  hasCoverLetter: boolean;
}) {
  const normalizedResumeScore =
    resumeScore != null ? Number((resumeScore / 8).toFixed(2)) * 14 : 0;
  const normalizedApplicationProfessionalismScore =
    applicationProfessionalismScore != null
      ? Number((applicationProfessionalismScore / 5).toFixed(2)) * 12.5
      : 0;
  const normalizedApplicationBrotherhoodScore =
    applicationBrotherhoodScore != null
      ? Number((applicationBrotherhoodScore / 5).toFixed(2)) * 12.5
      : 0;

  const pledgeFactor =
    Number((averageInterviewScore(interviews, "pledgeable") / 5).toFixed(2)) *
    15;
  const professionalFactor =
    Number((averageInterviewScore(interviews, "open_minded") / 5).toFixed(2)) *
    10;
  const curious =
    Number((averageInterviewScore(interviews, "motivated") / 5).toFixed(2)) *
    7;
  const events = Number(averageEventsAttended(interviews) - 2);
  const resumeScoreComponent = normalizedResumeScore;
  const coverLetterScore = hasCoverLetter ? 1 : 0;
  const applicationProfessionalismScoreComponent =
    normalizedApplicationProfessionalismScore;
  const applicationBrotherhoodScoreComponent =
    normalizedApplicationBrotherhoodScore;
  const teamworkScore =
    Number((averageCaseScore(caseStudies, "teamwork_score") / 5).toFixed(2)) *
    10;
  const leadershipScore =
    Number((averageCaseScore(caseStudies, "leadership_score") / 5).toFixed(2)) *
    10;
  const analyticalScore =
    Number((averageCaseScore(caseStudies, "analytical_score") / 5).toFixed(2)) *
    5;

  const components: PacketScoreComponents = {
    pledgeFactor: { score: pledgeFactor, outOf: 15 },
    professionalFactor: { score: professionalFactor, outOf: 10 },
    curious: { score: curious, outOf: 7 },
    events: { score: events, outOf: 3 },
    resumeScore: { score: resumeScoreComponent, outOf: 14 },
    coverLetterScore: { score: coverLetterScore, outOf: 1 },
    applicationProfessionalismScore: {
      score: applicationProfessionalismScoreComponent,
      outOf: 12.5,
    },
    applicationBrotherhoodScore: {
      score: applicationBrotherhoodScoreComponent,
      outOf: 12.5,
    },
    teamworkScore: { score: teamworkScore, outOf: 10 },
    leadershipScore: { score: leadershipScore, outOf: 10 },
    analyticalScore: { score: analyticalScore, outOf: 5 },
  };

  const totalScore = Object.values(components).reduce(
    (total, component) => total + component.score,
    0
  );

  return {
    totalScore,
    components,
  };
}

export function formatScore(score: number | null | undefined) {
  return Number.isFinite(score) ? Number(score).toFixed(2) : "0.00";
}
