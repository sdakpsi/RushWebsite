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
}: ActiveInterviewFormProps) {
  const [submitting, isSubmitting] = useState(false);
  const savedFormData = JSON.parse(localStorage.getItem('formData') || '{}');
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: savedFormData,
  });

  // Watch all form fields
  const formData = watch();

  useEffect(() => {
    // Save form data to local storage on change
    localStorage.setItem('formData', JSON.stringify(formData));
  }, [formData]); // This effect depends on formData

  const onSubmit = async (data: InterviewForm) => {
    isSubmitting(true);
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
      isSubmitting(false);
    }
  };
  const onError = (errors: any) => {
    toast.error('Form submission errors:', errors.message);
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
          className="px-4 py-2 text-base rounded-lg text-white border-none cursor-pointer"
        >
          &lt; Back{' '}
        </button>
        <h1 className="text-2xl text-center text-white">
          Interviewing: {selectedProspect.full_name}
        </h1>
        <div></div>
      </div>
      <form onSubmit={handleSubmit(onSubmit, onError)}>
        <div className="mb-5">
          <label htmlFor="name" className="block mb-2">
            Active Name
          </label>
          <input
            type="text"
            id="name"
            className="w-full p-2.5 rounded-lg text-base text-black"
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
        <div className="mb-5">
          <label htmlFor="otherActives" className="block mb-2">
            Other Actives on Panel
          </label>
          <input
            type="text"
            id="otherActives"
            className="w-full p-2.5 rounded-lg text-base text-black"
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

        <div className="mb-5">
          <label className="block mb-2">
            Rush Events (Select all that apply)
          </label>
          {options.map((option, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="checkbox"
                id={option.value}
                className="mr-2 rounded-lg"
                {...register(`events.${option.value}`)}
              />
              <label htmlFor={option.value}>{option.label}</label>
            </div>
          ))}
          {errors.events && (
            <p className="text-red-500">At least one event must be selected</p>
          )}
        </div>

        <div>
          {/* im like the look at me using a loop n shi */}
          {questions.map((question, index) => (
            <div key={index} className="mb-5">
              <label htmlFor={question.name} className="block mb-2">
                {question.label}
              </label>
              <textarea
                id={question.name}
                className="w-full p-2.5 text-base text-black rounded-lg"
                {...register(question.name, {
                  required:
                    index !== 7 && index !== 14
                      ? 'This field is required'
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

        <div className="flex flex-col sm:flex-row justify-evenly">
          {scorableTraits.map((trait) => (
            <div key={trait.propertyName} className="mb-5">
              <label>{trait.displayName}</label>
              <div className="mt-1">
                <select
                  className="p-2.5 text-base rounded-lg text-black"
                  {...register(trait.propertyName)}
                >
                  <option value="">Score</option>
                  {[1, 2, 3, 4, 5].map((number) => (
                    <option key={number} value={number}>
                      {number}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 px-5  rounded-xl py-2.5 text-base text-black border-none cursor-pointer"
            >
              Submit
            </button>
        </div>
      </form>
    </div>
  );
}
