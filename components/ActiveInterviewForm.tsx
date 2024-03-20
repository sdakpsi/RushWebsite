import { ProspectInterview } from "@/lib/types";
import { Controller, useForm } from "react-hook-form";
import  Select from 'react-select';

interface ActiveInterviewFormProps {
    selectedProspect: ProspectInterview
}


export default function ActiveInterviewForm({ selectedProspect }: ActiveInterviewFormProps) {
    const options = [
        { value: 'Info Night', label: 'Info Night' },
        { value: 'Business Workshop', label: 'Business Workshop' },
        { value: 'Case Study', label: 'Case Study' },
        { value: 'Social Night', label: 'Social Night' },
        { value: 'Interview', label: 'Interview' },
      ];
    const { register, handleSubmit, control } = useForm();

    const onSubmit = (data) => {
      console.log(data);
      // Perform form submission logic
    };
  
    return (
      <div style={{ background: 'black', color: 'white', padding: '20px' }}>
          
        <h1 style={{ textAlign: 'center', marginBottom: '20px', fontSize: '24px' }}>Interviewing: {selectedProspect.full_name}</h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="name" style={{ display: 'block', marginBottom: '5px' }}>
              Active Name
            </label>
            <input
              type="text"
              id="name"
              {...register("message", {
                required: "Required",
              })}
            style={{ width: '100%', padding: '10px', fontSize: '16px' }}
            />
          </div>
  
         
            
<div style={{ marginBottom: '20px' }}>
  <label style={{ display: 'block', marginBottom: '5px' }}>
    Rush Events (Select all that apply)
  </label>
  {options.map((option, index) => (
    <div key={index}>
      <input
        type="checkbox"
        id={option.value}
        {...register(`events.${option.value}`)}
      />
      <label htmlFor={option.value} style={{ marginLeft: '8px' }}>
        {option.label}
      </label>
    </div>
  ))}
          </div>
  
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="question1" style={{ display: 'block', marginBottom: '5px' }}>
             1. Tell us about yourself in 1 minute!
            </label>
            <textarea
              id="question1"
              {...register("message", {
                required: "Required",
              })}
              style={{ width: '100%', padding: '10px', fontSize: '16px' }}
            ></textarea>
          </div>
  
          {/* Repeat the above structure for the remaining questions */}
  
          <button
            type="submit"
            style={{
              background: 'white',
              color: 'black',
              padding: '10px 20px',
              fontSize: '16px',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Submit
          </button>
        </form>
      </div>
    )
  }
  


