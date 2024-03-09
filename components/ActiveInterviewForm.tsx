import { InterviewForm, ProspectInterview } from '@/lib/types';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Select from 'react-select';
import { questions, scorableTraits } from '../lib/InterviewQuestions';
import { createInterview } from '@/app/supabase/interview';
import { toast } from 'react-toastify';

interface ActiveInterviewFormProps {
  selectedProspect: ProspectInterview;
  setSelectedProspect: (prospect: ProspectInterview | null) => void;
  setShowingForm: (showingForm: boolean) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
}

const options = [
  { value: 'Info Night', label: 'Info Night' },
  { value: 'Business Workshop', label: 'Business Workshop' },
  { value: 'Case Study', label: 'Case Study' },
  { value: 'Social Night', label: 'Social Night' },
  { value: 'Interview', label: 'Interview' },
];

export default function ActiveInterviewForm({
  selectedProspect,
  setSelectedProspect,
  setShowingForm,
  setIsSubmitting,
}: ActiveInterviewFormProps) {
  const savedFormData = JSON.parse(localStorage.getItem('formData') || '{}');
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: savedFormData,
  });

  function note(note: string) {
    return <p className="text-gray-400 italic text-sm text-center">{note}</p>;
  }

  function script(script: string) {
    return <p className="text-blue-400 text-lg text-center">{script}</p>;
  }

  // Watch all form fields
  const formData = watch();

  useEffect(() => {
    // Save form data to local storage on change
    localStorage.setItem('formData', JSON.stringify(formData));
  }, [formData]); // This effect depends on formData

  const onSubmit = async (data: InterviewForm) => {
    setIsSubmitting(true);
    try {
      await createInterview(data, selectedProspect);
      toast.success('Form submitted successfully');
      setSelectedProspect(null);
      localStorage.removeItem('selectedProspect');
      setShowingForm(false);
      localStorage.removeItem('formData');
    } catch (error) {
      toast.error('Error uploading interview form: ' + error);
    } finally {
      setIsSubmitting(false);
    }
  };
  const onError = (errors: any) => {
    const errorMessages = Object.values(errors).map(
      (error: any) => error.message || 'An error occurred'
    );
    const errorMessageString = errorMessages.join(', ');
    toast.error(`Form submission errors: ${errorMessageString}`);
  };

  const handleBack = () => {
    setSelectedProspect(null);
    localStorage.removeItem('selectedProspect');
    setShowingForm(false);
  };

  return (
    <div className="bg-black text-white p-5">
      <div className="flex items-center justify-between mb-5">
        <button
          type="button"
          onClick={() => handleBack()}
          className="px-4 py-2 text-base rounded-lg bg-gray-700 text-white border-none cursor-pointer"
        >
          &#x276E; Back{' '}
        </button>
        <h1 className="text-2xl text-center text-white">
          Interviewing: {selectedProspect.full_name}
        </h1>
        <div></div>
      </div>
      <h1 className="text-xl lg:text-2xl font-bold text-center my-8 px-4 py-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 animate-pulse">
        Remember to be nice. You got this!
      </h1>
      <form onSubmit={handleSubmit(onSubmit, onError)}>
        <div className="mb-5 flex items-center space-x-4">
          <label htmlFor="name" className="mb-0 flex-shrink-0">
            Active Name:
          </label>
          <input
            type="text"
            id="name"
            className="p-1 rounded-lg text-base text-black flex-grow"
            {...register('name', {
              required: 'Name is required',
            })}
          />
          {errors.name && (
            <p className="text-red-500">{`${
              errors.name.message ?? 'Required!'
            }`}</p>
          )}
        </div>
        <div className="mb-5 flex items-center space-x-4">
          <label htmlFor="otherActives" className="mb-0 flex-shrink-0">
            Other Actives:
          </label>
          <input
            type="text"
            id="otherActives"
            className="p-1 rounded-lg text-base text-black flex-grow"
            {...register('otherActives', {
              required: 'Other Actives on Panel is required',
            })}
          />
          {errors.otherActives && (
            <p className="text-red-500">{`${
              errors.otherActives.message ?? 'Required!'
            }`}</p>
          )}
        </div>
        <div className="mt-4 text-center">
          ***Script is in <span className="text-blue-400 text-lg">BLUE</span>{' '}
          and side notes are in{' '}
          <span className="text-gray-400 italic text-sm">GRAY</span>***
        </div>
        <div className="w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent my-8" />
        <div className="space-y-4">
          {note('[Lead] Beginning Blurb')}
          {script(
            'Welcome to your Alpha Kappa Psi membership interview, thank you for making it out here today.'
          )}
          {note(
            'Panel introduces themselves Ex: "My name is (First Last) and I will be conducting your interview today"'
          )}
          {script(
            "Congratulations on making it through rush week and we're excited to get to know you better right now. During the interview, we will be taking notes as you answer, so please don't be intimidated by any typing."
          )}
        </div>
        <div className="w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent my-8" />
        <div className="mt-5 mb-5 text-center">
          <label className="block mb-2">
            {script(
              'Can you start off by telling me which events you came out to during our rush week?'
            )}
            {note('(Select all that apply)')}
          </label>
          <div className="flex flex-row flex-wrap gap-8 justify-center">
            {options.map((option, index) => (
              <div key={index} className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id={option.value}
                  className="mr-1 rounded-lg"
                  {...register(`events.${option.value}`)}
                />
                <label htmlFor={option.value}>{option.label}</label>
              </div>
            ))}
          </div>
          {errors.events && (
            <p className="text-red-500">At least one event must be selected</p>
          )}
        </div>

        <div className="w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent my-8" />
        <div>
          {/* im like the look at me using a loop n shi */}
          {questions.map((question, index) => (
            <div key={index} className="mb-5">
              {index === 7 ? (
                <label htmlFor={question.name} className="block mb-2 text-left">
                  {note('8. Silly Question (Optional): Choose ONE')}
                  {script(
                    '• If you had to describe your personality as a kitchen item, what would you choose?'
                  )}
                  {script('• Explain one of your uncommon opinions.')}
                  {script('• Who would you want to play you in a movie?')}
                  {script(
                    '• Who would you want to be your fictional sidekick?'
                  )}
                  {script('• What is your comfort food?')}
                  {script(
                    '• You’ve been given an elephant. You can’t give it away or sell it. What would you do with the elephant?'
                  )}
                  {script(
                    '• If you were an ice cream flavor which one would you be and why?'
                  )}
                  {script('• How would you sell ice cream in Alaska?')}
                </label>
              ) : index === 8 ? (
                <label htmlFor={question.name} className="block mb-4 space-y-2">
                  {script(
                    '9. Do you have any questions about the pledging process?'
                  )}
                  {note('Pause for answer')}
                  {script(
                    'It is expected of all members to complete this pledging process, which takes up the time equivalent of a 4-unit class. If you are given an invitation to join AKPsi, would you be able to commit to weekly meetings on Thursday evenings (past 8pm) and Sunday afternoons?'
                  )}
                  {note('Pause for answer')}
                  {script(
                    'What other time commitments do you have this quarter?'
                  )}
                  {note('(If they are a red flag, follow the red flag doc)')}
                  {note(
                    'Be prepared to answer questions like "Do you haze?" Just say "No, we are in compliance with Nationals, but our pledging process requires the time commitment of a 4-unit class". MARK AS RED FLAG if they seem concerned. Please listen and see if they have any other commitments that may take time away from the program... any clubs/jobs/etc. Additionally, note any concerns they may have towards the program'
                  )}
                </label>
              ) : (
                <label htmlFor={question.name} className="block mb-2">
                  {script(question.label)}
                  {question.note ? note(question.note) : <></>}
                </label>
              )}
              <textarea
                id={question.name}
                className="w-full p-2.5 text-base text-black rounded-lg"
                {...register(question.name, {
                  required:
                    index !== 7 && index !== 14
                      ? `Field ${question.label} is required`
                      : false, //silly question and additional are optional
                })}
              ></textarea>
              {errors[question.name] && (
                <p className="text-red-500">{`${
                  errors[question.name]?.message || 'Required!'
                }`}</p>
              )}{' '}
            </div>
          ))}
        </div>
        <div className="w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent my-8" />
        <div className="mt-4 mb-4">
          {note('*** END OF INTERVIEW *** [Lead]')}
        </div>
        <div className="mt-4 mb-4">
          {script(
            'Thank you for taking time out of your day to participate in the interview and for taking interest in our fraternity. We will get back to you about your potential membership early this coming week, and should you receive an invitation to join AKPsi, please keep your Thursday evening free. Have a nice weekend!'
          )}
        </div>
        <div className="w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent my-8" />
        <div>
          <div className="mb-5">
            <label htmlFor={'additionalComments'} className="block mb-2">
              {note('13. Additional Comments')}
            </label>
            <textarea
              id={'additionalComments'}
              className="w-full p-2.5 text-base text-black rounded-lg"
              {...register('additionalComments', {
                required: false,
              })}
            ></textarea>
            {errors['additionalComments'] && (
              <p className="text-red-500">{`${
                errors['additionalComments']?.message || 'Required!'
              }`}</p>
            )}{' '}
          </div>
        </div>

        <div className="flex flex-col">
          {scorableTraits.map((trait) => (
            <div key={trait.propertyName} className="mb-5 mt-2 flex flex-col">
              <label className="mb-2 text-center">{trait.displayName}</label>
              <div className="flex flex-row items-center space-x-4">
                {' '}
                {/* Added alignment and spacing between items */}
                <div className="w-1/4">
                  <select
                    className="p-2.5 text-base rounded-lg text-black w-full" // Removed max-width to use full width of the container
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
                      errors[trait.propertyName]?.message || 'Required!'
                    }`}</p>
                  )}{' '}
                </div>
                <p className="text-gray-400 italic text-sm flex-1">
                  {trait.note}
                </p>{' '}
                {/* Ensures the paragraph uses the remaining space */}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center">
          <div className="mt-4">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 px-5  rounded-xl py-2.5 text-base text-black border-none cursor-pointer"
            >
              Submit
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
