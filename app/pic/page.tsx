'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import NextLinkButton from '../../components/NextLinkButton';
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
  getUsers,
  getIsPIC,
  getApplication,
  getCases,
  getInterviews,
} from '../supabase/getUsers';
import ApplicationPopup from '@/components/ApplicationPopUp';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Packet {
  id: string;
  created_at: string;
  full_name: string;
  is_active: boolean;
  is_pic: boolean;
  application: string | null; // Assuming application could be null
  case_study: string | null; // Assuming case_study could be null
  interview: string | null; // Assuming interview could be null
  email: string;
  active_case_studies: string | null; // Assuming active_case_studies could be null
  active_interviews: string | null; // Assuming active_interviews could be null
}

export default function ProtectedPage() {
  const [usersData, setUserData] = useState<Packet[]>([]);
  const [isPIC, setIsPIC] = useState(false);
  const [currentApplicationId, setCurrentApplicationId] = useState<
    string | null
  >(null);
  const [userID, setUserID] = useState<string | null>(null);
  const [currentApplication, setCurrentApplication] = useState<any | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [cases, setCases] = useState<any[]>([]); // Use 'any[]' instead of '[]' to allow for arrays with any elements
  const [interviews, setInterviews] = useState<any[]>([]); // Use 'any[]' instead of '[]' to allow for arrays with any elements
  const [isLoading, setIsLoading] = useState(true); // Initialize loading state

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true); // Begin loading
      try {
        const usersData = await getUsers();
        setUserData(usersData);
        const picStatus = await getIsPIC();
        setIsPIC(picStatus);

        // Any additional data fetching logic can be included here
        // After all data fetching is completed
        setIsLoading(false); // End loading
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(false); // Ensure loading is ended even if there is an error
      }
    };

    fetchData();
  }, []); // Dependency array left empty to run only on component mount

  useEffect(() => {
    const users = async () => {
      const bruh = (await getCases(userID)) || [];
      setCases(bruh);
      console.log(bruh);
    };

    users();
  }, [userID]);

  useEffect(() => {
    const users = async () => {
      const bruh = (await getInterviews(userID)) || [];
      setInterviews(bruh);
      console.log(bruh);
    };

    users();
  }, [userID]);

  useEffect(() => {
    const fetchApplication = async () => {
      if (currentApplicationId) {
        const applicationData = await getApplication(currentApplicationId);
        setCurrentApplication(applicationData);
        console.log(applicationData);
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
  const filteredUsersData = usersData.filter((applicant) =>
    applicant.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Continue with your handleViewApplication, handleClosePopup functions, and render method
  if (isLoading) {
    return <LoadingSpinner />; // Placeholder for a loading state
  }

  return (
    <div className="flex-1 w-full flex justify-center items-center py-10">
      <div className="animate-in w-full mx-8">
        <div className="text-center">
          <p className="text-xl lg:text-4xl leading-tight mb-2">PIC Portal</p>

          {isPIC ? (
            <div>
              <input
                type="text"
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mt-4 px-4 py-2 border rounded-lg shadow-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out mb-4"
              />
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredUsersData.map((applicant) => (
                  <ApplicantCard
                    key={applicant.id}
                    applicant={applicant}
                    onViewApplication={handleViewApplication}
                  />
                ))}
                {currentApplication && (
                  <ApplicationPopup
                    application={currentApplication}
                    cases={cases}
                    interviews={interviews}
                    userID={userID}
                    onClose={handleClosePopup}
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="mt-8">
              <p>You are not on PIC.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
