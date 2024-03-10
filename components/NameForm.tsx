'use client';

import React, { useState, ChangeEvent, FormEvent, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';
import FileDropzone from './Dropzone';
import { ApplicationFileTypes, StudentYears, UCSDColleges, UCSDQuarters } from '@/lib/types';
import { formatTimestamp, extractFileName } from '@/utils/format';
import { toast } from 'react-toastify';
import { delay } from '@/utils/delay';
import { smallInput, textLabel, largeInput } from './NameForm.styles';
export default function NameForm() {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const debouncedSave = useCallback(
    debounce(async (applicationData) => {
      setIsSaving(true); 

      const body = JSON.stringify({
        ...applicationData,
        lastSubmitted: new Date().toISOString(),
        isSubmitting: false,
      });
      try {
        const response = await fetch('/api/application', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: body
        });
  
        if (!response.ok) {
          throw new Error('Failed to save application data');
        }
  
        console.log('Application data saved successfully');
        setLastSaved(formatTimestamp(new Date()));
      } catch (error) {
        console.error('Error saving application data:', error);
      } finally {
        setIsSaving(false); // Reset saving status regardless of outcome
      }
    }, 1000),
    []
  );

  

  useEffect(() => {

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/application', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch application data');
        }

        const applicationObject = await response.json();
        const data = applicationObject.application;
        setApplicationId(data.id);
        setFirstName(data.name.split(' ')[0]); 
        setLastName(data.name.split(' ')[1]); 
        setPronouns(data.pronouns); 
        setPhoneNumber(data.phone_number); 
        setYearInCollege(data.year); 
        setGraduationYear(data.graduation_year || ''); 
        setGraduationQuarter(data.graduation_qtr); 
        setMajor(data.major); 
        setMinor(data.minor); 
        setCumulativeGPA(data.gpa || ''); 
        setCurrentClasses(data.classes); 
        setExtracurricularActivities(data.extracirriculars); 
        setProudAccomplishment(data.accomplishment);
        setJoinReason(data.why_akpsi);
        setLifeGoals(data.goals);
        setComfortZone(data.comfort_zone);
        setBusinessType(data.business);
        setAdditionalDetails(data.additional);
        setResumeFileUrl(data.resume);
        setCoverLetterFileUrl(data.cover_letter);
        setLastSaved(formatTimestamp(data.last_updated));
        setLastSubmitted(formatTimestamp(data.submitted) || null)
        setFacebook(data.social_media?.facebook || '');
        setInstagram(data.social_media?.instagram || '');
        setLinkedIn(data.social_media?.linkedIn || '');
        setTiktok(data.social_media?.tiktok || '');
        setCollege(data.college);
      } catch (error) {
        console.error('Error fetching application data:', error);
      }

      setLoading(false);
    };

    fetchData();
  }, []);



  /**
   * States for user application forms
   */
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [applicationId, setApplicationId] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [pronouns, setPronouns] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [yearInCollege, setYearInCollege] = useState<string>('');
  const [graduationYear, setGraduationYear] = useState<number|null>(null);
  const [isGraduationYearValid, setIsGraduationYearValid] = useState<boolean>(true);
  const [isCumulativeGPAValid, setIsCumulativeGPAValid] = useState<boolean>(true);
  const [graduationQuarter, setGraduationQuarter] = useState<string>('');
  const [major, setMajor] = useState<string>('');
  const [minor, setMinor] = useState<string>('');
  const [cumulativeGPA, setCumulativeGPA] = useState<string>('');
  const [currentClasses, setCurrentClasses] = useState<string>('');
  const [extracurricularActivities, setExtracurricularActivities] =
    useState<string>('');
  const [proudAccomplishment, setProudAccomplishment] = useState<string>('');
  const [joinReason, setJoinReason] = useState<string>('');
  const [lifeGoals, setLifeGoals] = useState<string>('');
  const [comfortZone, setComfortZone] = useState<string>('');
  const [businessType, setBusinessType] = useState<string>('');
  const [additionalDetails, setAdditionalDetails] = useState<string>('');
  const [resumeFileUrl, setResumeFileUrl] = useState<string>('');
  const [coverLetterFileUrl, setCoverLetterFileUrl] = useState<string>('');
  const [lastSubmitted, setLastSubmitted] = useState<string|null>(null);
  const [facebook, setFacebook] = useState<string>('');
  const [instagram, setInstagram] = useState<string>('');
  const [linkedIn, setLinkedIn] = useState<string>('');
  const [tiktok, setTiktok] = useState<string>('');
  const [college, setCollege] = useState<string>('');
  

  useEffect(() => {
      debouncedSave({
        id: applicationId,
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
        proudAccomplishment,
        joinReason,
        lifeGoals,
        comfortZone,
        businessType,
        
      additionalDetails,
      resumeFileUrl,
      coverLetterFileUrl,
      college,
      socialMedias: {
    ...(facebook && { facebook }),
    ...(instagram && { instagram }),
    ...(linkedIn && { linkedIn }),
    ...(tiktok && { tiktok }),
  },
      });
  }, [resumeFileUrl, coverLetterFileUrl, graduationYear, cumulativeGPA]);

  const handleGraduationYearChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const numberValue = parseInt(value, 10);
    const isValid = !isNaN(numberValue);
  
    setIsGraduationYearValid(isValid);
  
    if (isValid || value === '') {
      setGraduationYear(value ? numberValue : null);
    }
  };

  const handleCumulativeGPAChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const floatValue = parseFloat(value);
    const isValid = !isNaN(floatValue);
  
    setIsCumulativeGPAValid(isValid); 
  
    if (isValid || value === '') {
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
    debouncedSave({
      id: applicationId,
      firstName,
      lastName,
      pronouns,
      phoneNumber,
      graduationQuarter,
      graduationYear,
      major,
      minor,
      cumulativeGPA,
      currentClasses,
      extracurricularActivities,
      proudAccomplishment,
      joinReason,
      lifeGoals,
      comfortZone,
      businessType,
     
      additionalDetails,
      resumeFileUrl,
      coverLetterFileUrl,
      socialMedias: {
    ...(facebook && { facebook }),
    ...(instagram && { instagram }),
    ...(linkedIn && { linkedIn }),
    ...(tiktok && { tiktok }),
  },
    });
  };

  // Function to handle form submission
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if(!isGraduationYearValid) {
      toast.error('Graduation year is invalid.');
      return;
    }
     if (!isCumulativeGPAValid) {
    toast.error('Cumulative GPA is invalid.');
    return;
  }

    const fields = [
      { name: 'First Name', value: firstName },
      { name: 'Last Name', value: lastName },
      { name: 'Pronouns', value: pronouns },
      { name: 'Phone Number', value: phoneNumber },
      { name: 'Year in College', value: yearInCollege },
      { name: 'Graduation Year', value: graduationYear },
      { name: 'Graduation Quarter', value: graduationQuarter },
      { name: 'Major', value: major },
      { name: 'Cumulative GPA', value: cumulativeGPA },
      { name: 'Current Classes', value: currentClasses },
      { name: 'Extracurricular Activities', value: extracurricularActivities },
      { name: 'Proud Accomplishment', value: proudAccomplishment },
      { name: 'Join Reason', value: joinReason },
      { name: 'Life Goals', value: lifeGoals },
      { name: 'Comfort Zone', value: comfortZone },
      { name: 'Business Type', value: businessType },
      { name: 'Additional Details', value: additionalDetails },
      { name: 'Resume File URL', value: resumeFileUrl },
      {name: 'College', value: college}
    ];
  
    const emptyFields = fields.filter(field => !field.value).map(field => field.name);
    const socialMedias = {
  ...(facebook && { facebook }),
  ...(instagram && { instagram }),
  ...(linkedIn && { linkedIn }),
  ...(tiktok && { tiktok }),
};
  console.log(socialMedias, "socialMedias");  
    if (emptyFields.length > 0) {
      toast.error(`Empty fields: ${emptyFields.join(', ')}`);
      return; 
    } else{
      setSubmitting(true);
      try {
        await delay(2000)
        const body = JSON.stringify({
          id: applicationId,
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
          proudAccomplishment,
          joinReason,
          lifeGoals,
          comfortZone,
          businessType,
          additionalDetails,
          resumeFileUrl,
          coverLetterFileUrl,
          college,
          lastSubmitted: new Date().toISOString(),
          isSubmitting: true,
          socialMedias: JSON.stringify(socialMedias),
        })
        const response = await fetch('/api/application', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: body
        });
        if (response.ok) {
          setLastSubmitted(formatTimestamp(new Date()));
          toast.success('Application submitted! Thanks for taking the time to submit an application :)');
        } else {
          toast.error('Failed to submit application');
        }
      } catch (error) {
        console.error('Error submitting application:', error);
        toast.error('An error occurred while submitting the application');
      }
      finally {
        setSubmitting(false);
      }
  };
  }



  if(loading){
    return(
  <div className="text-center text-lg font-semibold text-gray-600">
    Loading application...
  </div>
    )
  }

  if(submitting){
    return(
  <div className="text-center text-lg font-semibold text-gray-600">
    Submitting application...
  </div>)
  }

return (
    <div>
      <div className="save-status text-gray-400 ">
        {isSaving ? 'Saving...' : lastSaved && `Last saved on ${lastSaved}`}
      </div>
      <div className="submit-status text-green-600">
        {lastSubmitted && `Last submitted at: ${lastSubmitted}`}
      </div>
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      <h2 className="text-lg font-bold mb-6"></h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="mb-4">
          <label
            className={textLabel}
            htmlFor="firstName"
          >
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
        <div className="mb-4">
          <label
            className={textLabel}
            htmlFor="lastName"
          >
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
        <div className="mb-4">
          <label
            className={textLabel}
            htmlFor="pronouns"
          >
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
      
        <div className="mb-4">
          <label
            className={textLabel}
            htmlFor="phoneNumber"
          >
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
        <div className="mb-4">
          <label
            className={textLabel}
            htmlFor="yearInCollege"
          >
            Year in College:
          </label>
          <select
            className={smallInput}
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
        </div>
        <div className="mb-4">
          <label
            className={textLabel}
            htmlFor="college"
          >
            College:
          </label>
          <select
            className={smallInput}
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
        </div>
        <div className="mb-4">
  <label
    className={textLabel}
    htmlFor="graduationYear"
  >
    Graduation Year:
  </label>
  <input
className={`${smallInput} ${!isGraduationYearValid ? 'border-red-500' : ''}`}
  id="graduationYear"
  type="number"
  value={graduationYear?.toString() || ''}
  onChange={handleGraduationYearChange}
  placeholder="Enter graduation year"
/>
{!isGraduationYearValid && <p className="text-red-500 text-xs italic">Please enter a valid grad year</p>}

</div>
        <div className="mb-4">
          <label
            className={textLabel}
            htmlFor="graduationQuarter"
          >
            Graduation Quarter:
          </label>
          <select
            className={smallInput}
            id="graduationQuarter"
            value={graduationQuarter}
            onChange={handleChange(setGraduationQuarter)}
          >  <option value="">Select Quarter</option>
           {Object.values(UCSDQuarters).map((quarter) => (
    <option key={quarter} value={quarter}>
      {quarter}
    </option>
  ))}
          </select>
        </div>
        <div className="mb-4">
          <label
            className={textLabel}
            htmlFor="major"
          >
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
        <div className="mb-4">
          <label
            className={textLabel}
            htmlFor="minor"
          >
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
        <div className="mb-4">
          <label
            className={textLabel}
            htmlFor="cumulativeGPA"
          >
            Cumulative GPA:
          </label>
          <input
className={`${smallInput} ${!isCumulativeGPAValid ? 'border-red-500' : ''}`}

  id="graduationYear"
  type="number"
  value={cumulativeGPA?.toString() || ''}
  onChange={handleCumulativeGPAChange}
  step="0.01"
  placeholder="Enter GPA"
/>
{!isCumulativeGPAValid && <p className="text-red-500 text-xs italic">Please enter a valid GPA</p>}

        </div>
        
        <div className="col-span-2 mb-4">
        <div className="mb-4">
  <div className="text-gray-600 mb-2">Enter your social medias! Please use links if possible :)</div>
  <div>
    <label
      className={textLabel}
      htmlFor="facebook"
    >
      Facebook:
    </label>
    <input
      className={smallInput}
      id="facebook"
      type="text"
      value={facebook}
      onChange={handleChange(setFacebook)}
      placeholder="Facebook"
    />
  </div>
  <div className="mt-4">
    <label
      className={textLabel}
      htmlFor="instagram"
    >
      Instagram:
    </label>
    <input
      className={smallInput}
      id="instagram"
      type="text"
      value={instagram}
      onChange={handleChange(setInstagram)}
      placeholder="Instagram"
    />
  </div>
  <div className="mt-4">
    <label
      className={textLabel}
      htmlFor="linkedIn"
    >
      LinkedIn:
    </label>
    <input
      className={smallInput}
      id="linkedIn"
      type="text"
      value={linkedIn}
      onChange={handleChange(setLinkedIn)}
      placeholder="LinkedIn"
    />
  </div>
  <div className="mt-4">
    <label
      className={textLabel}
      htmlFor="tiktok"
    >
      TikTok:
    </label>
    <input
      className={smallInput}
      id="tiktok"
      type="text"
      value={tiktok}
      onChange={handleChange(setTiktok)}
      placeholder="TikTok"
    />
  </div>
</div>
          <label
            className={textLabel}
            htmlFor="currentClasses"
          >
            What classes are you currently enrolled in for this quarter? Please
            list all days and times, and include any discussion sections.
          </label>
          <textarea
            className={largeInput}
            id="currentClasses"
            value={currentClasses}
            onChange={handleChange(setCurrentClasses)}
            placeholder="Enter your classes"
            rows={4}
          />
        </div>
        <div className="col-span-2 mb-4">
          <label
            className={textLabel}
            htmlFor="extracurricularActivities"
          >
            Please list the extracurricular activities you are involved in for
            this quarter. (Ex: clubs, jobs, sports, etc). and how much time you
            anticipate each activity will take.
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
        <div className="col-span-2 mb-4">
          <label
            className={textLabel}
            htmlFor="proudAccomplishment"
          >
            What accomplishment are you most proud of (personal or
            professional)? (500 words max)
          </label>
          <textarea
            className={largeInput}
            id="proudAccomplishment"
            value={proudAccomplishment}
            onChange={handleChange(setProudAccomplishment)}
            placeholder="Enter your accomplishment"
            rows={4}
          />
        </div>
        <div className="col-span-2 mb-4">
          <label
            className={textLabel}
            htmlFor="joinReason"
          >
            Why do you want to join Alpha Kappa Psi? What do you seek to gain
            from this fraternity? What do you expect to be able to add to our
            community? (500 words max)
          </label>
          <textarea
            className={largeInput}
            id="joinReason"
            value={joinReason}
            onChange={handleChange(setJoinReason)}
            placeholder="Enter your reasons"
            rows={4}
          />
        </div>
        <div className="col-span-2 mb-4">
          <label
            className={textLabel}
            htmlFor="lifeGoals"
          >
            What are your current life goals (personal or professional) and how
            do you believe Alpha Kappa Psi will help you achieve those goals?
            (500 words max)
          </label>
          <textarea
            className={largeInput}
            id="lifeGoals"
            value={lifeGoals}
            onChange={handleChange(setLifeGoals)}
            placeholder="Enter your goals"
            rows={4}
          />
        </div>
        <div className="col-span-2 mb-4">
          <label
            className={textLabel}
            htmlFor="comfortZone"
          >
            Tell us about a time you went out of your comfort zone. Why did you
            decide to take this risk and what did you learn? (500 words max)
          </label>
          <textarea
            className={largeInput}
            id="comfortZone"
            value={comfortZone}
            onChange={handleChange(setComfortZone)}
            placeholder="Enter your experience"
            rows={4}
          />
        </div>
        <div className="col-span-2 mb-4">
          <label
            className={textLabel}
            htmlFor="businessType"
          >
            What type of business would you create if money was not a limiting
            factor? (500 words max)
          </label>
          <textarea
            className={largeInput}
            id="businessType"
            value={businessType}
            onChange={handleChange(setBusinessType)}
            placeholder="Enter your business idea"
            rows={4}
          />
        </div>
        <div className="col-span-2 mb-4">
          <label
            className={textLabel}
            htmlFor="additionalDetails"
          >
            Add any details about yourself that you were not able to convey with
            the questions above!
          </label>
          <textarea
            className={largeInput}
            id="additionalDetails"
            value={additionalDetails}
            onChange={handleChange(setAdditionalDetails)}
            placeholder="Enter additional details"
            rows={4}
          />
        </div>
      </div>
      <div className="flex justify-between mb-6">
    
      </div>
      
      <div className="mb-4">
        <a
          href={resumeFileUrl ? resumeFileUrl : '#'}
          className={`text-blue-500 hover:text-blue-700 ${!resumeFileUrl && 'pointer-events-none'}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Resume: {resumeFileUrl ? extractFileName(resumeFileUrl) : 'Not Uploaded'}
        </a>
      </div>
      <FileDropzone setFileUrl={setResumeFileUrl} type={ApplicationFileTypes.RESUME}/>
      <div className="mb-4">
        <a
          href={coverLetterFileUrl ? coverLetterFileUrl : '#'}
          className={`text-blue-500 hover:text-blue-700 ${!coverLetterFileUrl && 'pointer-events-none'}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Cover Letter: {coverLetterFileUrl ? extractFileName(coverLetterFileUrl) : 'Not Uploaded'}
        </a>
      </div>
      <FileDropzone setFileUrl={setCoverLetterFileUrl} type={ApplicationFileTypes.COVER_LETTER} />
      <button
        className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline w-full"
        type="submit"
      >
        Submit
      </button>

    </form>
    </div>
  );
}
