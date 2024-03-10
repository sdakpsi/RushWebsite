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
import { getUsers, getIsPIC, getApplication } from '../getUsers';
import ApplicationPopup from '@/components/ApplicationPopUp';

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
  const [currentApplication, setCurrentApplication] = useState<any | null>(
    null
  );

  useEffect(() => {
    const users = async () => {
      const bruh = await getUsers();
      setUserData(bruh);
    };

    users();
  }, []);

  useEffect(() => {
    const users = async () => {
      const bruh2 = await getIsPIC();
      setIsPIC(bruh2);
    };

    users();
  }, []);

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

  const handleViewApplication = async (applicationId: string) => {
    setCurrentApplicationId(applicationId);
  };

  const handleClosePopup = () => {
    setCurrentApplication(null); // Or setCurrentApplicationId(null) depending on your logic
    setCurrentApplicationId(null);
  };

  return (
    <div className="flex-1 w-full flex justify-center items-center py-10">
      <div className="animate-in opacity-0 w-full max-w-4xl">
        <div className="text-center">
          <p className="text-xl lg:text-4xl leading-tight mb-2">PIC Portal</p>
          {isPIC ? (
            <div className="mt-4 grid grid-cols-3 gap-4">
              {usersData.map((applicant) => (
                <ApplicantCard
                  key={applicant.id}
                  applicant={applicant}
                  onViewApplication={handleViewApplication}
                />
              ))}
              {currentApplication && (
                <ApplicationPopup
                  application={currentApplication}
                  onClose={handleClosePopup}
                />
              )}
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
