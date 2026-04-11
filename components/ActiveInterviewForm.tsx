import { createInterview } from "@/app/supabase/interview";
import { InterviewForm, ProspectInterview } from "@/lib/types";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { questions, scorableTraits } from "../lib/InterviewQuestions";
import { useCurrentUser } from '@/hooks/useCurrentUser';
import customToast from '@/components/CustomToast';

interface ActiveInterviewFormProps {
  selectedProspect: ProspectInterview;
  setSelectedProspect: (prospect: ProspectInterview | null) => void;
  setShowingForm: (showingForm: boolean) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
}

const options = [
  { value: "Pre Rush Social", label: "Pre Rush Social" },
  { value: "Info Night", label: "Info Night" },
  { value: "Business Workshop", label: "Business Workshop" },
  { value: "Case Study", label: "Case Study" },
  { value: "Social Night", label: "Social Night" },
  { value: "Interview", label: "Interview" },
];

export default function ActiveInterviewForm({
  selectedProspect,
  setSelectedProspect,
  setShowingForm,
  setIsSubmitting,
}: ActiveInterviewFormProps) {
  const savedFormData = JSON.parse(localStorage.getItem("formData") || "{}");
  const [currentUserName, setCurrentUserName] = useState<string>('');
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: savedFormData,
  });

  function note(note: string) {
    return (
      <p className="text-center text-sm italic text-gray-600">{note}</p>
    );
  }

  function script(script: string) {
    return (
      <p className="text-center text-lg font-medium text-blue-700">{script}</p>
    );
  }

  // Watch all form fields
  const formData = watch();

  // Use React Query hook for current user data
  const { user } = useCurrentUser();
  
  // Auto-populate user name when user data is available
  useEffect(() => {
    if (user && user.user_metadata?.name) {
      const userName = user.user_metadata.name;
      setCurrentUserName(userName);
      // Always set the user's name, overriding any existing value
      setValue('name', userName, { shouldValidate: true });
    }
  }, [user, setValue]);

  useEffect(() => {
    // Save form data to local storage on change
    localStorage.setItem("formData", JSON.stringify(formData));
  }, [formData]); // This effect depends on formData

  const onSubmit = async (data: InterviewForm) => {
    setIsSubmitting(true);
    try {
      await createInterview(data, selectedProspect);
      customToast("Form submitted successfully", "success");
      setSelectedProspect(null);
      localStorage.removeItem("selectedProspect");
      setShowingForm(false);
      localStorage.removeItem("formData");
    } catch (error) {
      customToast("Error uploading interview form: " + error, "error");
    } finally {
      setIsSubmitting(false);
    }
  };
  const onError = (errors: any) => {
    const errorMessages = Object.values(errors).map(
      (error: any) => error.message || "An error occurred"
    );
    const errorMessageString = errorMessages.join(", ");
    customToast(`Form submission errors: ${errorMessageString}`, "error");
  };

  const handleBack = () => {
    setSelectedProspect(null);
    localStorage.removeItem("selectedProspect");
    setShowingForm(false);
  };

  return (
    <div className="rounded-lg border border-border bg-card p-5 text-foreground">
      <div className="mb-5 flex items-center justify-between">
        <button
          type="button"
          onClick={() => handleBack()}
          className="cursor-pointer rounded-lg border border-border bg-muted px-4 py-2 text-base text-foreground hover:bg-muted/80"
        >
          &#x276E; Back{" "}
        </button>
        <h1 className="text-center text-2xl text-foreground">
          Interviewing: {selectedProspect.full_name}
        </h1>
        <div></div>
      </div>
      <p
        className="interview-guidance-glow mt-4 animate-pulse bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text px-4 py-2 text-center text-xl font-bold text-transparent lg:text-2xl"
        role="heading"
        aria-level={2}
      >
        Keep a professional demeanor (don&apos;t be mean but also don&apos;t be too
        nice) and do your best to stick to the script.
      </p>
      <p
        className="interview-guidance-glow mb-4 mt-2 animate-pulse bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text px-4 py-2 text-center text-xl font-bold text-transparent lg:text-2xl"
        role="heading"
        aria-level={2}
      >
        We want everyone to have the same chance!
      </p>
      <form onSubmit={handleSubmit(onSubmit, onError)}>
        <div className="mb-5 flex items-center space-x-4">
          <label
            htmlFor="name"
            className="mb-0 flex-shrink-0 font-medium text-foreground"
          >
            Active Name:
          </label>
          <input
            type="text"
            id="name"
            className="flex-grow cursor-not-allowed rounded-lg border border-border bg-muted p-1 text-base text-foreground"
            readOnly
            {...register("name", {
              required: "Name is required",
            })}
          />
          {errors.name && (
            <p className="text-red-500">{`${
              errors.name.message ?? "Required!"
            }`}</p>
          )}
        </div>
        <div className="mb-5 flex items-center space-x-4">
          <label
            htmlFor="otherActives"
            className="mb-0 flex-shrink-0 font-medium text-foreground"
          >
            Other Actives:
          </label>
          <input
            type="text"
            id="otherActives"
            className="flex-grow rounded-lg border border-border bg-background p-1 text-base text-foreground"
            {...register("otherActives", {
              required: "Other Actives on Panel is required",
            })}
          />
          {errors.otherActives && (
            <p className="text-red-500">{`${
              errors.otherActives.message ?? "Required!"
            }`}</p>
          )}
        </div>
        <p className="mt-4 text-center text-foreground">
          <span aria-hidden="true">***</span>
          Script is in{" "}
          <span className="text-lg font-semibold text-blue-700">BLUE</span> and
          side notes are in{" "}
          <span className="text-sm italic text-gray-600">GRAY</span>
          <span aria-hidden="true">***</span>
        </p>
        <div className="my-8 w-full bg-gradient-to-r from-transparent via-foreground/10 to-transparent p-[1px]" />
        <div className="space-y-4">
          {note("[Lead] Beginning Blurb")}
          {script(
            "Welcome to your Alpha Kappa Psi membership interview, thank you for making it out here today."
          )}
          {note(
            'Panel introduces themselves Ex: "My name is (First Last) and I will be conducting your interview today"'
          )}
          {script(
            "Congratulations on making it through rush week and we're excited to get to know you better right now. During the interview, we will be taking notes as you answer, so please don't be intimidated by any typing."
          )}
        </div>
        <div className="my-8 w-full bg-gradient-to-r from-transparent via-foreground/10 to-transparent p-[1px]" />
        <div className="mb-5 mt-5 text-center">
          <label className="mb-2 block">
            {script(
              "Can you start off by telling me which events you came out to during our rush week?"
            )}
            {note("(Select all that apply)")}
          </label>
          <div className="flex flex-row flex-wrap justify-center gap-8">
          {options.map((option, index) => (
    <div key={index} className="mb-2 flex items-center">
      <input
        type="checkbox"
        id={option.value}
        className="mr-1 rounded-lg"
        {...register(`events.${option.value}`)}
        defaultChecked={option.value === "Interview"}
      />
      <label htmlFor={option.value} className="text-foreground">
        {option.label}
      </label>
    </div>
  ))}
          </div>
          {errors.events && (
            <p className="text-red-500">At least one event must be selected</p>
          )}
        </div>

        <div className="my-8 w-full bg-gradient-to-r from-transparent via-foreground/10 to-transparent p-[1px]" />
        <div>
          {/* im like the look at me using a loop n shi */}
          {questions.map((question, index) => (
            <div key={index} className="mb-5">
              {index === 7 ? (
                <label htmlFor={question.name} className="mb-2 block text-left">
                  {note("8. Silly Question (Optional): Pick ONE")}
                  {note("Creativity/innovation:")}
                  {script(
                    "○ If you could add one class to every school's curriculum, what would it be?"
                  )}
                  {script(
                    "○ If you could have dinner with anyone — living, dead, or fictional — who and why?"
                  )}
                  {note("Mindfulness:")}
                  {script(
                    "○ What's something most people don't appreciate enough?"
                  )}
                  {note("Problem-solving:")}
                  {script(
                    "○ You're put in charge of making Mondays better for everyone. What's your plan?"
                  )}
                  {script("○ How would you sell ice cream in Alaska?")}
                  {note("Personality:")}
                  {script(
                    "○ What's a skill you have that nobody would guess just by looking at you?"
                  )}
                  {note("Analytical (only if they didn't show analytical skills at Case Study Night):")}
                  {script(
                    "○ A pizza place is losing customers but the pizza tastes great. What's wrong?"
                  )}
                </label>
              ) : index === 10 ? (
                <label htmlFor={question.name} className="mb-4 block space-y-2">
                  {script(
                    "11. Do you have any questions about the pledging process?"
                  )}
                  {note("Pause for answer")}
                  {script(
                    "It is expected of all members to complete this pledging process, which takes up the time equivalent of a 4-unit class. If you are given an invitation to join AKPsi, would you be able to commit to weekly meetings on Thursday evenings (past 8pm) and Sunday afternoons?"
                  )}
                  {note("Pause for answer")}
                  {script(
                    "What other time commitments do you have this quarter?"
                  )}
                  {note("(If they are a red flag, NOTE HERE)")}
                  {note(
                    'Be prepared to answer questions like "Do you haze?" Just say "No, we are in compliance with Nationals, but our pledging process requires the time commitment of a 4-unit class". MARK AS RED FLAG if they seem concerned. Please listen and see if they have any other commitments that may take time away from the program... any clubs/jobs/etc. Additionally, note any concerns they may have towards the program'
                  )}
                </label>
              ) : (
                <label htmlFor={question.name} className="mb-2 block">
                  {script(question.label)}
                  {question.note ? note(question.note) : <></>}
                </label>
              )}
              <textarea
                id={question.name}
                className="w-full rounded-lg border border-border bg-background p-2.5 text-base text-foreground"
                {...register(question.name, {
                  required:
                    index !== 7 && index !== 14
                      ? `Field ${question.label} is required`
                      : false, //silly question and additional are optional
                })}
              ></textarea>
              {errors[question.name] && (
                <p className="text-red-500">{`${
                  errors[question.name]?.message || "Required!"
                }`}</p>
              )}{" "}
            </div>
          ))}
        </div>
        <div className="my-8 w-full bg-gradient-to-r from-transparent via-foreground/10 to-transparent p-[1px]" />
        <div className="mb-4 mt-4">
          {note("*** END OF INTERVIEW *** [Lead]")}
        </div>
        <div className="mb-4 mt-4">
          {script(
            "Thank you for taking time out of your day to participate in the interview and for taking interest in our fraternity. We will get back to you about your potential membership early this coming week, and should you receive an invitation to join AKPsi, please keep your Thursday evening free. Have a nice weekend!"
          )}
        </div>
        <div className="my-8 w-full bg-gradient-to-r from-transparent via-foreground/10 to-transparent p-[1px]" />
        <div>
          <div className="mb-5">
            <label htmlFor={"additionalComments"} className="mb-2 block">
              {note("13. Additional Comments")}
            </label>
            <textarea
              id={"additionalComments"}
              className="w-full rounded-lg border border-border bg-background p-2.5 text-base text-foreground"
              {...register("additionalComments", {
                required: false,
              })}
            ></textarea>
            {errors["additionalComments"] && (
              <p className="text-red-500">{`${
                errors["additionalComments"]?.message || "Required!"
              }`}</p>
            )}{" "}
          </div>
        </div>

        <div className="flex flex-col">
          {scorableTraits.map((trait) => (
            <div key={trait.propertyName} className="mb-5 mt-2 flex flex-col">
              <label className="mb-2 text-center text-foreground">
                {trait.displayName}
              </label>
              <div className="flex flex-row items-center space-x-4">
                {" "}
                {/* Added alignment and spacing between items */}
                <div className="w-1/4">
                  <select
                    className="w-full rounded-lg border border-border bg-background p-2.5 text-base text-foreground"
                    {...register(`${trait.propertyName}`, {
                      required: `Please select a value for ${trait.propertyName}`,
                    })}
                  >
                    <option value="">Score</option>
                    {[1, 2, 3, 4, 5].map((number) => (
                      <option key={number} value={number}>
                        {number}
                      </option>
                    ))}
                  </select>
                  {errors[trait.propertyName] && (
                    <p className="text-red-500">{`${
                      errors[trait.propertyName]?.message || "Required!"
                    }`}</p>
                  )}{" "}
                </div>
                <p className="flex-1 text-sm italic text-gray-600">
                  {trait.note}
                </p>{" "}
                {/* Ensures the paragraph uses the remaining space */}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center">
          <div className="mt-4">
            <button type="submit" className="btn btn-primary rounded-xl px-5 py-2.5 text-base">
              Submit
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
