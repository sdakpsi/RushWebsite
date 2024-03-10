'use server';
import { createClient } from '@/utils/supabase/server';

export async function getUsers() {
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

  return usersData;
}

export async function getIsPIC() {
  const supabase = createClient();

  let isPIC = false;
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

  return isPIC;
}

export async function getApplication(applicationID: string) {
  const supabase = createClient();

  if (!applicationID) {
    console.error('Application ID is required.');
    return null;
  }

  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('id', applicationID)
    .single(); // Assuming you expect a single record for a unique application ID

  if (error) {
    console.error('Error fetching application:', error.message);
    return null;
  }
  console.log(data);
  // If no error and data is fetched successfully, return the application data
  return data;
}
