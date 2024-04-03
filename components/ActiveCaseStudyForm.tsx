import { CaseStudyForm, InterviewForm, ProspectInterview } from '@/lib/types';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Select from 'react-select';
import { questions, scorableTraits } from '../lib/InterviewQuestions';
import { createCaseStudy, createInterview } from '@/app/supabase/interview';
import { toast } from 'react-toastify';
import { caseStudyData } from '@/lib/CaseStudyQuestions';

interface ActiveInterviewFormProps {
  selectedProspect: ProspectInterview;
  setSelectedProspect: (prospect: ProspectInterview | null) => void;
  setShowingForm: (showingForm: boolean) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
}
export default function ActiveCaseStudyForm({
  selectedProspect,
  setSelectedProspect,
  setShowingForm,
  setIsSubmitting
}: ActiveInterviewFormProps) {
  const savedFormData = JSON.parse(localStorage.getItem('formDataCase') || '{}');
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
    localStorage.setItem('formDataCase', JSON.stringify(formData));
  }, [formData]); // This effect depends on formData

  const onSubmit = async (data: CaseStudyForm) => {
    setIsSubmitting(true);
    try {
      await createCaseStudy(data, selectedProspect);
      toast.success('Form submitted successfully');
      setSelectedProspect(null);
      localStorage.removeItem('selectedProspect');
      setShowingForm(false);
      localStorage.removeItem('formDataCase');
    } catch (error) {
      toast.error('Error uploading interview form: ' + error);
    } finally {
      setIsSubmitting(false);
    }
  };
  const onError = (errors: any) => {
    const errorMessages = Object.values(errors).map((error) => error.message || 'An error occurred');
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
          className="px-4 py-2 text-base rounded-lg text-white border-none cursor-pointer"
        >
          &lt; Back{' '}
        </button>
        <h1 className="text-2xl text-center text-white">
          Case Study: {selectedProspect.full_name}
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

        <div>
          {/* im like the look at me using a loop n shi */}
          {caseStudyData.map((question, index) => (
            <div key={index} className="mb-5">
              <label htmlFor={question.name} className="block mb-2">
              {index <= 3 ? `${question.name} Comments` : question.name}
              </label>
              <textarea
                id={question.name}
                className="w-full p-2.5 text-base text-black rounded-lg"
                {...register(index <= 3 ? `${question.label}_comments` : question.label, {
                  required: `Field  ${index <= 3 ? `${question.name} Comments` : question.name} is required`
                })}
              ></textarea>
             {errors[index <= 3 ? `${question.label}_comments` : question.label] && (
                <p className="text-red-500">{`${
                  errors[index <= 3 ? `${question.label}_comments` : question.label]?.message || 'Required!'
                }`}</p>
              )}{' '}
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row justify-evenly">
          {caseStudyData.slice(0, 4).map((trait) => (
            <div key={trait.label} className="mb-5">
              <label>{trait.name + " Score"}</label>
              <div className="mt-1">
                <select
                  className="p-2.5 text-base rounded-lg text-black"
                  {...register(`${trait.label}_score`, {
                    required: `Please select a value for ${trait.name}`,
                  })}
                >
                  <option value="">Score</option>
                  {[1, 2, 3, 4, 5].map((number) => (
                    <option key={number} value={number}>
                      {number}
                    </option>
                  ))}
                </select>
              </div>
              {errors[`${trait.label}_score`] && (
                <p className="text-red-500">{`${
                  errors[`${trait.label}_score`]?.message || 'Required!'
                }`}</p>
              )}
            </div>
          ))}
        </div>
        <div className="mt-5">
              <label htmlFor={"additionalComments"} className="block mb-2">
                Additional Comments
              </label>
              <textarea
                id={"additionalComments"}
                className="w-full p-2.5 text-base text-black rounded-lg"
                {...register("additionalComments", {
                })}
              ></textarea>
              {errors["additionalComments"] && (
                <p className="text-red-500">{`${
                  errors["additionalComments"]?.message || 'Required!'
                }`}</p>
              )}{' '}
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
