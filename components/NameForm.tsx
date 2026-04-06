"use client";

import { getApplicationData } from "@/app/supabase/clientQueries";
import {
  ApplicationFileTypes,
  StudentYears,
  UCSDColleges,
  UCSDQuarters,
  type ApplicationFormState,
} from "@/lib/types";
import { RUSH_CHAIR_INFO } from "@/utils/constants";
import { delay } from "@/utils/delay";
import { extractFileName, formatTimestamp } from "@/utils/format";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQuery } from "@tanstack/react-query";
import { debounce } from "lodash";
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import customToast from "./CustomToast";
import FileDropzone from "./Dropzone";
import LoadingSpinner from "./LoadingSpinner";
import {
  largeInput,
  selectWithDropdownIcon,
  smallInput,
  textLabel,
} from "./NameForm.styles";

const ESSAY_WORD_LIMIT = 350;

function countWords(value: string) {
  const trimmedValue = value.trim();
  return trimmedValue ? trimmedValue.split(/\s+/).length : 0;
}

export default function NameForm() {
  const [submitting, setSubmitting] = useState(false);

  // React Query for fetching application data
  const {
    data: applicationData,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["applicationData"],
    queryFn: getApplicationData,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });

  if (error) {
    console.error("Error fetching application data:", error);
  }

  const debouncedSave = useCallback(
    debounce(async () => {
      setIsSaving(true);
      const applicationData = formStateRef.current;

      const body = JSON.stringify({
        ...applicationData,
        isSubmitting: false,
      });

      try {
        const response = await fetch("/api/application", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body,
        });

        if (!response.ok) {
          throw new Error("Failed to save application data");
        }

        setLastSaved(formatTimestamp(new Date()));
      } catch (error) {
        console.error("Error saving application data:", error);
      } finally {
        setIsSaving(false);
      }
    }, 1000),
    []
  );

  // useEffect to populate form state when React Query data is available
  useEffect(() => {
    if (applicationData) {
      const data = applicationData;
      setApplicationId(data.id);
      setFirstName(data.name.split(" ")[0]);
      setLastName(data.name.split(" ")[1]);
      setPronouns(data.pronouns);
      setPhoneNumber(data.phone_number);
      setYearInCollege(data.year);
      setGraduationYear(data.graduation_year || "");
      setGraduationQuarter(data.graduation_qtr);
      setMajor(data.major);
      setMinor(data.minors || "");
      setCumulativeGPA(data.gpa || "");
      setCurrentClasses(data.classes);
      setExtracurricularActivities(data.extracirriculars);
      setPreviousRushTerms(data.previous_rush_terms || "");
      setProudAccomplishment(data.accomplishment);
      setJoinReason(data.why_akpsi);
      setLifeGoals(data.goals);
      setComfortZone(data.comfort_zone);
      setBusinessType(data.business);
      setAdditionalDetails(data.additional);
      setResumeFileUrl(data.resume);
      setCoverLetterFileUrl(data.cover_letter);
      setLastSaved(formatTimestamp(data.last_updated));
      setLastSubmitted(formatTimestamp(data.submitted) || null);
      setFacebook(data.social_media?.facebook || "");
      setInstagram(data.social_media?.instagram || "");
      setLinkedIn(data.social_media?.linkedIn || "");
      setTiktok(data.social_media?.tiktok || "");
      setCollege(data.college);
    }
  }, [applicationData]);

  /**
   * States for user application forms
   */
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [applicationId, setApplicationId] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [pronouns, setPronouns] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [yearInCollege, setYearInCollege] = useState<string>("");
  const [graduationYear, setGraduationYear] = useState<number | null>(null);
  const [isGraduationYearValid, setIsGraduationYearValid] =
    useState<boolean>(true);
  const [isCumulativeGPAValid, setIsCumulativeGPAValid] =
    useState<boolean>(true);
  const [graduationQuarter, setGraduationQuarter] = useState<string>("");
  const [major, setMajor] = useState<string>("");
  const [minor, setMinor] = useState<string>("");
  const [cumulativeGPA, setCumulativeGPA] = useState<string>("");
  const [currentClasses, setCurrentClasses] = useState<string>("");
  const [extracurricularActivities, setExtracurricularActivities] =
    useState<string>("");
  const [previousRushTerms, setPreviousRushTerms] = useState<string>("");
  const [proudAccomplishment, setProudAccomplishment] = useState<string>("");
  const [joinReason, setJoinReason] = useState<string>("");
  const [lifeGoals, setLifeGoals] = useState<string>("");
  const [comfortZone, setComfortZone] = useState<string>("");
  const [businessType, setBusinessType] = useState<string>("");
  const [additionalDetails, setAdditionalDetails] = useState<string>("");
  const [resumeFileUrl, setResumeFileUrl] = useState<string>("");
  const [coverLetterFileUrl, setCoverLetterFileUrl] = useState<string>("");
  const [lastSubmitted, setLastSubmitted] = useState<string | null>(null);
  const [facebook, setFacebook] = useState<string>("");
  const [instagram, setInstagram] = useState<string>("");
  const [linkedIn, setLinkedIn] = useState<string>("");
  const [tiktok, setTiktok] = useState<string>("");
  const [college, setCollege] = useState<string>("");

  const essayFields = [
    { name: "Proud Accomplishment", value: proudAccomplishment },
    { name: "Join Reason", value: joinReason },
    { name: "Life Goals", value: lifeGoals },
    { name: "Comfort Zone", value: comfortZone },
    { name: "Business Type", value: businessType },
    { name: "Additional Details", value: additionalDetails },
  ];

  const overLimitEssayFields = essayFields.filter(
    (field) => countWords(field.value) > ESSAY_WORD_LIMIT
  );

  const getEssayTextareaClassName = (value: string) =>
    `${largeInput} ${
      countWords(value) > ESSAY_WORD_LIMIT
        ? "border-destructive focus:border-destructive focus:ring-destructive/20"
        : ""
    }`;

  const renderEssayWordCount = (value: string) => {
    const wordCount = countWords(value);
    const isOverLimit = wordCount > ESSAY_WORD_LIMIT;

    return (
      <p
        className={`mt-2 text-sm ${
          isOverLimit ? "text-destructive" : "text-muted-foreground"
        }`}
      >
        {wordCount}/{ESSAY_WORD_LIMIT} words
        {isOverLimit
          ? " - please shorten this response before submitting."
          : ""}
      </p>
    );
  };

  const formStateRef = useRef<ApplicationFormState>({
    applicationId,
    firstName,
    lastName,
    pronouns,
    phoneNumber,
    yearInCollege,
    graduationYear,
    graduationQuarter,
    major,
    minor,
    cumulativeGPA,
    currentClasses,
    extracurricularActivities,
    previousRushTerms,
    proudAccomplishment,
    joinReason,
    lifeGoals,
    comfortZone,
    businessType,
    additionalDetails,
    resumeFileUrl,
    coverLetterFileUrl,
    college,
    facebook,
    instagram,
    linkedIn,
    tiktok,
  });

  useEffect(() => {
    formStateRef.current = {
      applicationId,
      firstName,
      lastName,
      pronouns,
      phoneNumber,
      yearInCollege,
      graduationYear,
      graduationQuarter,
      major,
      minor,
      cumulativeGPA,
      currentClasses,
      extracurricularActivities,
      previousRushTerms,
      proudAccomplishment,
      joinReason,
      lifeGoals,
      comfortZone,
      businessType,
      additionalDetails,
      resumeFileUrl,
      coverLetterFileUrl,
      college,
      facebook,
      instagram,
      linkedIn,
      tiktok,
    };
  }, [
    applicationId,
    firstName,
    lastName,
    pronouns,
    phoneNumber,
    yearInCollege,
    graduationYear,
    graduationQuarter,
    major,
    minor,
    cumulativeGPA,
    currentClasses,
    extracurricularActivities,
    previousRushTerms,
    proudAccomplishment,
    joinReason,
    lifeGoals,
    comfortZone,
    businessType,
    additionalDetails,
    resumeFileUrl,
    coverLetterFileUrl,
    college,
    facebook,
    instagram,
    linkedIn,
    tiktok,
  ]);

  useEffect(() => {
    debouncedSave();
  }, [
    resumeFileUrl,
    coverLetterFileUrl,
    graduationYear,
    cumulativeGPA,
    debouncedSave,
  ]);

  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  const handleGraduationYearChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    const numberValue = parseInt(value, 10);
    const isValid = !isNaN(numberValue);

    setIsGraduationYearValid(isValid);

    if (isValid || value === "") {
      setGraduationYear(value ? numberValue : null);
    }
  };

  const handleCumulativeGPAChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    const floatValue = parseFloat(value);
    const isValid = !isNaN(floatValue);

    setIsCumulativeGPAValid(isValid);

    if (isValid || value === "") {
      setCumulativeGPA(value);
    }
  };

  const handleChange =
    (setState: React.Dispatch<React.SetStateAction<string>>) =>
    (
      event: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      setState(event.target.value);
      debouncedSave();
    };

  // Function to handle form submission
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isGraduationYearValid) {
      customToast("Graduation year is invalid.", "error");
      return;
    }
    if (!isCumulativeGPAValid) {
      customToast("Cumulative GPA is invalid.", "error");
      return;
    }
    if (overLimitEssayFields.length > 0) {
      customToast(
        `These essay responses exceed ${ESSAY_WORD_LIMIT} words: ${overLimitEssayFields
          .map((field) => field.name)
          .join(", ")}`,
        "error"
      );
      return;
    }

    const fields = [
      { name: "First Name", value: firstName },
      { name: "Last Name", value: lastName },
      { name: "Pronouns", value: pronouns },
      { name: "Phone Number", value: phoneNumber },
      { name: "Year in College", value: yearInCollege },
      { name: "Graduation Year", value: graduationYear },
      { name: "Graduation Quarter", value: graduationQuarter },
      { name: "Major", value: major },
      { name: "Cumulative GPA", value: cumulativeGPA },
      { name: "Current Classes", value: currentClasses },
      { name: "Extracurricular Activities", value: extracurricularActivities },
      { name: "Previous AKPsi Rush Participation", value: previousRushTerms },
      { name: "Proud Accomplishment", value: proudAccomplishment },
      { name: "Join Reason", value: joinReason },
      { name: "Life Goals", value: lifeGoals },
      { name: "Comfort Zone", value: comfortZone },
      { name: "Business Type", value: businessType },
      { name: "Additional Details", value: additionalDetails },
      { name: "Resume File URL", value: resumeFileUrl },
      { name: "College", value: college },
    ];

    const emptyFields = fields
      .filter((field) => !field.value)
      .map((field) => field.name);
    if (emptyFields.length > 0) {
      customToast(`Empty fields: ${emptyFields.join(", ")}`, "error");
      return;
    } else {
      setSubmitting(true);
      try {
        await delay(2000);
        const applicationData = formStateRef.current;
        const body = JSON.stringify({
          ...applicationData,
          lastSubmitted: new Date().toISOString(),
          isSubmitting: true,
        });

        console.log("Submitting application...", { applicationId });

        const response = await fetch("/api/application", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: body,
        });

        if (!response.ok) {
          // Get detailed error message from response
          let errorMessage = "Failed to submit application";
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.message || errorMessage;
            console.error("Application submission failed:", {
              status: response.status,
              error: errorData,
            });
          } catch (e) {
            console.error(
              "Application submission failed with status:",
              response.status
            );
          }
          throw new Error(errorMessage);
        }

        const result = await response.json();
        console.log("Application submitted successfully:", result);

        setLastSubmitted(formatTimestamp(new Date()));
        customToast(
          "Application submitted! Thanks for taking the time to submit an application :)",
          "success"
        );
      } catch (error) {
        console.error("Error submitting application:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "An error occurred while submitting the application";
        customToast(errorMessage, "error");
      } finally {
        setSubmitting(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="large" fullScreen={false} type="form" />
      </div>
    );
  }

  if (submitting) {
    return (
      <div className="space-y-4 py-12 text-center">
        <LoadingSpinner size="large" fullScreen={false} type="form" />
        <div className="text-lg font-semibold text-muted-foreground">
          Submitting application...
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="save-status px-4 text-muted-foreground sm:px-0">
        {isSaving ? "Saving..." : lastSaved && `Last saved on ${lastSaved}`}
      </div>
      <div className="submit-status px-4 text-green-600 sm:px-0">
        {lastSubmitted && `Last submitted at: ${lastSubmitted}`}
      </div>
      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8"
      >
        <div className="space-y-12">
          <div className="space-y-6">
            <div className="border-b border-border pb-4">
              <h2 className="text-2xl font-bold text-foreground">
                Personal Information
              </h2>
              <p className="text-muted-foreground">
                Please provide your basic personal details.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              <div className="mb-6">
                <label className={textLabel} htmlFor="firstName">
                  First Name:
                </label>
                <input
                  className={smallInput}
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={handleChange(setFirstName)}
                  placeholder="Enter your first name"
                />
              </div>
              <div className="mb-6">
                <label className={textLabel} htmlFor="lastName">
                  Last Name:
                </label>
                <input
                  className={smallInput}
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={handleChange(setLastName)}
                  placeholder="Enter your last name"
                />
              </div>
              <div className="mb-6">
                <label className={textLabel} htmlFor="pronouns">
                  Pronouns:
                </label>
                <input
                  className={smallInput}
                  id="pronouns"
                  type="text"
                  value={pronouns}
                  onChange={handleChange(setPronouns)}
                  placeholder="Enter your preferred pronouns"
                />
              </div>

              <div className="mb-6">
                <label className={textLabel} htmlFor="phoneNumber">
                  Phone Number:
                </label>
                <input
                  className={smallInput}
                  id="phoneNumber"
                  type="tel"
                  value={phoneNumber}
                  onChange={handleChange(setPhoneNumber)}
                  placeholder="Enter your phone number"
                />
              </div>
              <div className="mb-6">
                <label className={textLabel} htmlFor="yearInCollege">
                  Year in College:
                </label>
                <div className="relative">
                  <select
                    className={selectWithDropdownIcon}
                    id="yearInCollege"
                    value={yearInCollege}
                    onChange={handleChange(setYearInCollege)}
                  >
                    <option value="">Select Year</option>
                    {Object.values(StudentYears).map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                  <span
                    className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
                    aria-hidden
                  >
                    <FontAwesomeIcon icon={faChevronDown} className="h-4 w-4" />
                  </span>
                </div>
              </div>
              <div className="mb-6">
                <label className={textLabel} htmlFor="college">
                  College:
                </label>
                <div className="relative">
                  <select
                    className={selectWithDropdownIcon}
                    id="college"
                    value={college}
                    onChange={handleChange(setCollege)}
                  >
                    <option value="">Select College</option>
                    {Object.values(UCSDColleges).map((college) => (
                      <option key={college} value={college}>
                        {college}
                      </option>
                    ))}
                  </select>
                  <span
                    className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
                    aria-hidden
                  >
                    <FontAwesomeIcon icon={faChevronDown} className="h-4 w-4" />
                  </span>
                </div>
              </div>
              <div className="mb-6">
                <label className={textLabel} htmlFor="graduationYear">
                  Graduation Year:
                </label>
                <input
                  className={`${smallInput} ${
                    !isGraduationYearValid ? "border-red-500" : ""
                  }`}
                  id="graduationYear"
                  type="number"
                  value={graduationYear?.toString() || ""}
                  onChange={handleGraduationYearChange}
                  placeholder="Enter graduation year"
                />
                {!isGraduationYearValid && (
                  <p className="text-xs italic text-red-500">
                    Please enter a valid grad year
                  </p>
                )}
              </div>
              <div className="mb-6">
                <label className={textLabel} htmlFor="graduationQuarter">
                  Graduation Quarter:
                </label>
                <div className="relative">
                  <select
                    className={selectWithDropdownIcon}
                    id="graduationQuarter"
                    value={graduationQuarter}
                    onChange={handleChange(setGraduationQuarter)}
                  >
                    {" "}
                    <option value="">Select Quarter</option>
                    {Object.values(UCSDQuarters).map((quarter) => (
                      <option key={quarter} value={quarter}>
                        {quarter}
                      </option>
                    ))}
                  </select>
                  <span
                    className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
                    aria-hidden
                  >
                    <FontAwesomeIcon icon={faChevronDown} className="h-4 w-4" />
                  </span>
                </div>
              </div>
              <div className="mb-6">
                <label className={textLabel} htmlFor="major">
                  Major:
                </label>
                <input
                  className={smallInput}
                  id="major"
                  type="text"
                  value={major}
                  onChange={handleChange(setMajor)}
                  placeholder="Enter your major"
                />
              </div>
              <div className="mb-6">
                <label className={textLabel} htmlFor="minor">
                  Minor (optional):
                </label>
                <input
                  className={smallInput}
                  id="minor"
                  type="text"
                  value={minor}
                  onChange={handleChange(setMinor)}
                  placeholder="Enter your minor"
                />
              </div>
              <div className="mb-6">
                <label className={textLabel} htmlFor="cumulativeGPA">
                  Cumulative GPA (/4.0):
                </label>
                <input
                  className={`${smallInput} ${
                    !isCumulativeGPAValid ? "border-red-500" : ""
                  }`}
                  id="graduationYear"
                  type="number"
                  value={cumulativeGPA?.toString() || ""}
                  onChange={handleCumulativeGPAChange}
                  step="0.01"
                  placeholder="Enter GPA"
                />
                {!isCumulativeGPAValid && (
                  <p className="text-xs italic text-red-500">
                    Please enter a valid GPA
                  </p>
                )}
                <div className="mt-2 text-xs italic">
                  (High School GPA for Freshmen or Previous College GPA for
                  Transfers)
                </div>
              </div>
            </div>
          </div>

          {/* Social Media & Academic Information Section */}
          <div className="space-y-6">
            <div className="border-b border-border pb-4">
              <h2 className="text-2xl font-bold text-foreground">
                Social Media & Academic Information
              </h2>
              <p className="text-muted-foreground">
                Share your social media and academic details.
              </p>
            </div>

            <div className="mb-8">
              <div className="mb-6">
                <div className="my-8 w-full bg-gradient-to-r from-transparent via-foreground/10 to-transparent p-[1px]" />
                <div className="mb-6 text-lg text-muted-foreground">
                  Your social medias! Please use links if possible :)
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label className={textLabel} htmlFor="facebook">
                      Facebook:
                    </label>
                    <input
                      className={smallInput}
                      id="facebook"
                      type="text"
                      value={facebook}
                      onChange={handleChange(setFacebook)}
                      placeholder="Facebook profile or link"
                    />
                  </div>
                  <div>
                    <label className={textLabel} htmlFor="instagram">
                      Instagram:
                    </label>
                    <input
                      className={smallInput}
                      id="instagram"
                      type="text"
                      value={instagram}
                      onChange={handleChange(setInstagram)}
                      placeholder="Instagram handle or link"
                    />
                  </div>
                  <div>
                    <label className={textLabel} htmlFor="linkedIn">
                      LinkedIn:
                    </label>
                    <input
                      className={smallInput}
                      id="linkedIn"
                      type="text"
                      value={linkedIn}
                      onChange={handleChange(setLinkedIn)}
                      placeholder="LinkedIn profile or link"
                    />
                  </div>
                  <div>
                    <label className={textLabel} htmlFor="tiktok">
                      TikTok:
                    </label>
                    <input
                      className={smallInput}
                      id="tiktok"
                      type="text"
                      value={tiktok}
                      onChange={handleChange(setTiktok)}
                      placeholder="TikTok handle or link"
                    />
                  </div>
                </div>
              </div>
              <label className={textLabel} htmlFor="currentClasses">
                What classes are you currently enrolled in for this quarter?
                Please list all days and times, and include any discussion
                sections.
              </label>
              <textarea
                className={largeInput}
                id="currentClasses"
                value={currentClasses}
                onChange={handleChange(setCurrentClasses)}
                placeholder="MGT 3. Lecture: TuTh 9:00 AM - 10:20 AM. Discussion: M 3:00 PM"
                rows={4}
              />
            </div>
            <div className="mb-8">
              <label className={textLabel} htmlFor="extracurricularActivities">
                Please list the extracurricular activities you are involved in
                for this quarter. (Ex: clubs, jobs, sports, etc). and how much
                time you anticipate each activity will take.
              </label>
              <textarea
                className={largeInput}
                id="extracurricularActivities"
                value={extracurricularActivities}
                onChange={handleChange(setExtracurricularActivities)}
                placeholder="Enter your activities"
                rows={4}
              />
            </div>
            <div className="mb-8">
              <label className={textLabel} htmlFor="previousRushTerms">
                Have you participated in an Alpha Kappa Psi rush week before? If
                so, please indicate which term or terms. If not, you may write
                &quot;N/A&quot; in this section.
              </label>
              <input
                className={smallInput}
                id="previousRushTerms"
                type="text"
                value={previousRushTerms}
                onChange={handleChange(setPreviousRushTerms)}
                placeholder="Ex. Fall 2025, Spring 2025, or N/A"
              />
            </div>
          </div>

          {/* Essay Questions Section */}
          <div className="space-y-6">
            <div className="border-b border-border pb-4">
              <h2 className="text-2xl font-bold text-foreground">
                Essay Questions
              </h2>
              <p className="text-muted-foreground">
                Please answer the following questions thoughtfully. Each
                response should be 350 words maximum.
              </p>
            </div>

            <div className="mb-8">
              <label className={textLabel} htmlFor="proudAccomplishment">
                What accomplishment are you most proud of (personal or
                professional)?
              </label>
              <textarea
                className={getEssayTextareaClassName(proudAccomplishment)}
                id="proudAccomplishment"
                value={proudAccomplishment}
                onChange={handleChange(setProudAccomplishment)}
                placeholder="Enter your accomplishment"
                rows={4}
                aria-invalid={
                  countWords(proudAccomplishment) > ESSAY_WORD_LIMIT
                }
              />
              {renderEssayWordCount(proudAccomplishment)}
            </div>
            <div className="mb-8">
              <label className={textLabel} htmlFor="comfortZone">
                Tell us about a time you went out of your comfort zone. Why did
                you decide to take this risk and what did you learn?
              </label>
              <textarea
                className={getEssayTextareaClassName(comfortZone)}
                id="comfortZone"
                value={comfortZone}
                onChange={handleChange(setComfortZone)}
                placeholder="Enter your experience"
                rows={4}
                aria-invalid={countWords(comfortZone) > ESSAY_WORD_LIMIT}
              />
              {renderEssayWordCount(comfortZone)}
            </div>
            <div className="mb-8">
              <label className={textLabel} htmlFor="joinReason">
                What was a valuable community you’ve been a part of and what
                specifically made it valuable to you?
              </label>
              <textarea
                className={getEssayTextareaClassName(joinReason)}
                id="joinReason"
                value={joinReason}
                onChange={handleChange(setJoinReason)}
                placeholder="Enter your reasons"
                rows={4}
                aria-invalid={countWords(joinReason) > ESSAY_WORD_LIMIT}
              />
              {renderEssayWordCount(joinReason)}
            </div>
            <div className="mb-8">
              <label className={textLabel} htmlFor="lifeGoals">
                Describe your personal and professional goals for the end of
                this year and for the next three years. What steps are you
                currently taking toward these goals, and how would Alpha Kappa
                Psi help you further achieve them?
              </label>
              <textarea
                className={getEssayTextareaClassName(lifeGoals)}
                id="lifeGoals"
                value={lifeGoals}
                onChange={handleChange(setLifeGoals)}
                placeholder="Enter your goals"
                rows={4}
                aria-invalid={countWords(lifeGoals) > ESSAY_WORD_LIMIT}
              />
              {renderEssayWordCount(lifeGoals)}
            </div>
            <div className="mb-8">
              <label className={textLabel} htmlFor="businessType">
                What type of business would you create if money was not a
                limiting factor?
              </label>
              <textarea
                className={getEssayTextareaClassName(businessType)}
                id="businessType"
                value={businessType}
                onChange={handleChange(setBusinessType)}
                placeholder="Enter your business idea"
                rows={4}
                aria-invalid={countWords(businessType) > ESSAY_WORD_LIMIT}
              />
              {renderEssayWordCount(businessType)}
            </div>
            <div className="mb-8">
              <label className={textLabel} htmlFor="additionalDetails">
                Add any details about yourself that you were not able to convey
                with the questions above!
              </label>
              <textarea
                className={getEssayTextareaClassName(additionalDetails)}
                id="additionalDetails"
                value={additionalDetails}
                onChange={handleChange(setAdditionalDetails)}
                placeholder="Enter additional details"
                rows={4}
                aria-invalid={countWords(additionalDetails) > ESSAY_WORD_LIMIT}
              />
              {renderEssayWordCount(additionalDetails)}
            </div>
          </div>

          {/* File Upload Section */}
          <div className="space-y-6">
            <div className="border-b border-border pb-4">
              <h2 className="text-2xl font-bold text-foreground">Documents</h2>
              <p className="text-muted-foreground">
                Please upload your resume and cover letter.
              </p>
            </div>

            <div className="mb-4">
              <a
                href={resumeFileUrl ? resumeFileUrl : "#"}
                className={`${
                  resumeFileUrl
                    ? "text-primary underline underline-offset-2 hover:opacity-90"
                    : "text-muted-foreground"
                } ${!resumeFileUrl && "pointer-events-none"}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Resume:{" "}
                {resumeFileUrl
                  ? extractFileName(resumeFileUrl)
                  : "Not Uploaded"}
              </a>
            </div>
            <FileDropzone
              setFileUrl={setResumeFileUrl}
              type={ApplicationFileTypes.RESUME}
            />
            <div className="mb-4">
              <a
                href={coverLetterFileUrl ? coverLetterFileUrl : "#"}
                className={`${
                  coverLetterFileUrl
                    ? "text-primary underline underline-offset-2 hover:opacity-90"
                    : "text-muted-foreground"
                } ${!coverLetterFileUrl && "pointer-events-none"}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Cover Letter:{" "}
                {coverLetterFileUrl
                  ? extractFileName(coverLetterFileUrl)
                  : "Not Uploaded"}
              </a>
            </div>
            <FileDropzone
              setFileUrl={setCoverLetterFileUrl}
              type={ApplicationFileTypes.COVER_LETTER}
            />
          </div>

          {/* Submit Section */}
          <div className="space-y-6">
            <div className="border-b border-border pb-4">
              <h2 className="text-2xl font-bold text-foreground">
                Submit Application
              </h2>
              <p className="text-muted-foreground">
                Review your information and submit your application.
              </p>
            </div>
            <div className="flex justify-center">
              <button
                className="btn-primary transform rounded-xl px-12 py-4 text-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
                type="submit"
              >
                Submit Application
              </button>
            </div>
          </div>
        </div>
      </form>
      <p className="mt-4 text-muted-foreground">
        If you're having any issues or have any questions, please{" "}
        {RUSH_CHAIR_INFO}!
      </p>
    </div>
  );
}
