'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { User } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import ActiveLoginComponent from '@/components/ActiveLoginComponent';
import ActiveSetter from '@/components/ActiveSetter';
import Link from 'next/link';
import styles from './styles.module.css';
import logo from './akpsilogo.png';
import Image from 'next/image';
import ApplicantCard from '@/components/ApplicantCard';
import {
  getIsActive,
  getApplication,
  getCases,
  getInterviews,
  getDelibsUsers,
} from '../../supabase/getUsers';
import ApplicationPopup from '@/components/ApplicationPopUp';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Packet {
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

export default function ProtectedPage() {
  const [usersData, setUserData] = useState<Packet[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [currentApplicationId, setCurrentApplicationId] = useState<
    string | null
  >(null);
  const [userID, setUserID] = useState<string>('');
  const [currentApplication, setCurrentApplication] = useState<any | null>(
    null
  );
  const [cases, setCases] = useState<any[]>([]); 
  const [interviews, setInterviews] = useState<any[]>([]); 
  const [isLoading, setIsLoading] = useState(true); 

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true); 
      try {
        const usersData = await getDelibsUsers();
        setUserData(usersData);

        const activeStatus = await getIsActive();
        setIsActive(activeStatus);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []); 

  useEffect(() => {
    const getCasesForUser = async () => {
      const cases = (await getCases(userID)) || [];
      setCases(cases);
    };

    getCasesForUser();
  }, [userID]);

  useEffect(() => {
    const getInterviewsForUser = async () => {
      const interviews = (await getInterviews(userID)) || [];
      setInterviews(interviews);
    };

    getInterviewsForUser();
  }, [userID]);

  useEffect(() => {
    const fetchApplication = async () => {
      if (currentApplicationId) {
        const applicationData = await getApplication(currentApplicationId);
        setCurrentApplication(applicationData);
      }
    };

    fetchApplication();
  }, [currentApplicationId]);

  const handleViewApplication = async (
    applicationId: string,
    userId: string
  ) => {
    setCurrentApplicationId(applicationId);
    setUserID(userId);
  };

  const handleClosePopup = () => {
    setCurrentApplication(null); // Or setCurrentApplicationId(null) depending on your logic
    setCurrentApplicationId(null);
  };

  // Continue with your handleViewApplication, handleClosePopup functions, and render method
  if (isLoading) {
    return <LoadingSpinner />; // Placeholder for a loading state
  }

  return (
    <div className="flex-1 w-full flex justify-center items-center py-10">
      <div className="animate-in w-full mx-8">
        <div className="text-center">
          <p className="text-xl lg:text-4xl leading-tight mb-2">
            Delibs Portal
          </p>

          {isActive ? (
            <div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {usersData.map((applicant: Packet) => (
                  <div key={applicant.id} className="flex flex-col">
                    <ApplicantCard
                      key={applicant.id}
                      applicant={applicant}
                      onViewApplication={handleViewApplication}
                    />
                  </div>
                ))}
                {currentApplication && (
                  <ApplicationPopup
                    application={currentApplication}
                    cases={cases}
                    interviews={interviews}
                    isPIC={false}
                    userID={userID}
                    onClose={handleClosePopup}
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="mt-8">
              <p>You are not an active.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
