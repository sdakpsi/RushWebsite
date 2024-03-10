import React from 'react';
import { createClient } from '@/utils/supabase/server';
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

export default async function ProtectedPage() {
  const supabase = createClient();

  let isPIC = false;
  let usersData = [];
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data, error } = await supabase
      .from('users')
      .select('is_pic')
      .eq('id', user.id)
      .single();
    isPIC = data?.is_pic;
  }

  if (isPIC) {
    const { data, error } = await supabase.from('users').select('*');
    if (error) {
      console.error(error);
    } else {
      usersData = data;
      console.log(usersData);
    }
  }

  return (
    <div className="flex-1 w-full flex justify-center items-center py-10">
      <div className="animate-in opacity-0 w-full max-w-4xl">
        <div className="text-center">
          <p className="text-xl lg:text-4xl leading-tight mb-2">PIC Portal</p>
          {isPIC ? (
            <div className="flex overflow-x-auto no-scrollbar mt-4 space-x-4">
              {usersData.map((user) => (
                <div
                  key={user.id}
                  className="min-w-[200px rounded-lg p-4 shadow-lg"
                >
                  <h3 className="font-bold text-lg">{user.full_name}</h3>
                  <p className="mt-2">{user.email}</p>
                  <p className="mt-1">
                    Case Study: {user.case_study ? 'Yes' : 'No'}
                  </p>
                  <p className="mt-1">
                    Interview: {user.interview ? 'Yes' : 'No'}
                  </p>
                  <p className="mt-1">
                    Application: {user.application ? 'Yes' : 'No'}
                  </p>
                </div>
              ))}
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
