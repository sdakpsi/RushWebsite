import { ProspectInterview } from "@/lib/types";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import  Select from 'react-select';

interface ActiveInterviewFormProps {
    selectedProspect: ProspectInterview
}

const options = [
    { value: 'Info Night', label: 'Info Night' },
    { value: 'Business Workshop', label: 'Business Workshop' },
    { value: 'Case Study', label: 'Case Study' },
    { value: 'Social Night', label: 'Social Night' },
    { value: 'Interview', label: 'Interview' },
  ];


export default function ActiveInterviewForm({ selectedProspect }: ActiveInterviewFormProps) {
  

    const savedFormData = JSON.parse(localStorage.getItem('formData') || '{}');
    const { register, handleSubmit, watch } = useForm({
        defaultValues: savedFormData
    });

    // Watch all form fields
    const formData = watch();

    useEffect(() => {
        // Save form data to local storage on change
        localStorage.setItem('formData', JSON.stringify(formData));
    }, [formData]); // This effect depends on formData


    const onSubmit = (data: any) => {
      console.log(data);
      // Perform form submission logic
    };
  
    return (
        <div className="bg-black text-white p-5">
            <h1 className="text-center mb-5 text-2xl">Interviewing: {selectedProspect.full_name}</h1>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-5">
                    <label htmlFor="name" className="block mb-2">
                        Active Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        className="w-full p-2.5 text-base text-black"
                        {...register("name", {
                            required: "Required",
                        })}
                    />
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
                                className="mr-2"
                                {...register(`events.${option.value}`)}
                            />
                            <label htmlFor={option.value}>
                                {option.label}
                            </label>
                        </div>
                    ))}
                </div>

                <div className="mb-5">
                    <label htmlFor="question1" className="block mb-2">
                        1. Tell us about yourself in 1 minute!
                    </label>
                    <textarea
                        id="question1"
                        className="w-full p-2.5 text-base text-black"
                        {...register("question1", {
                            required: "Required",
                        })}
                    ></textarea>
                </div>

                {/* Repeat the above structure for the remaining questions */}

                <button
                    type="submit"
                    className="bg-white px-5 py-2.5 text-base text-black border-none cursor-pointer"
                >
                    Submit
                </button>
            </form>
        </div>
    );
}
  


