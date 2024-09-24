"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

type QueueItem = {
  id: string;
  user_id: string;
  action: "pro" | "con" | "comment";
  inserted_at: string;
  name: string;
};

export default function QueuePage() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [user, setUser] = useState<any>(null); // Keeping it as any for now, you can replace it with a more specific type if needed

  useEffect(() => {
    async function fetchUser() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    }

    fetchUser();
  }, []);

  // Fetch the current queue from Supabase
  const fetchQueue = async () => {
    const supabase = createClient(); // Initialize client within the function
    const { data, error } = await supabase
      .from("queue")
      .select("*")
      .order("inserted_at", { ascending: true });

    if (error) {
      console.error("Error fetching queue:", error);
      return;
    }

    setQueue(data as QueueItem[]); // Type assertion to QueueItem[]
  };

  // Add or update the user's queue position
  const joinQueue = async (action: "pro" | "con" | "comment") => {
    if (!user) return;
    const supabase = createClient(); // Initialize client within the function

    // First, check if the user already exists in the queue
    const { data: existingEntry, error: checkError } = await supabase
      .from("queue")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      // "PGRST116" is the "no rows" error; if something else, return error
      console.error("Error checking existing queue entry:", checkError);
      return;
    }

    // If the user is already in the queue, update their action
    if (existingEntry) {
      const { error: updateError } = await supabase
        .from("queue")
        .update({ action })
        .eq("user_id", user.id);

      if (updateError) {
        console.error("Error updating queue entry:", updateError);
        return;
      }
    } else {
      // If the user is not in the queue, insert a new entry
      const { error: insertError } = await supabase
        .from("queue")
        .insert([{ user_id: user.id, action, name: user.user_metadata.name }]);

      if (insertError) {
        console.error("Error joining queue:", insertError);
        return;
      }
    }

    // Refresh the queue after the user joins
    await fetchQueue();
  };

  // Remove the user from the queue
  const leaveQueue = async () => {
    if (!user) return;
    const supabase = createClient(); // Initialize client within the function

    const { error } = await supabase
      .from("queue")
      .delete()
      .eq("user_id", user.id);

    if (error) {
      console.error("Error leaving queue:", error);
    } else {
      await fetchQueue(); // Refresh the queue after user leaves
    }
  };

  // Listen for real-time updates to the queue
  useEffect(() => {
    const supabase = createClient(); // Initialize client within useEffect

    fetchQueue(); // Load the queue initially

    // Subscribe to the real-time changes
    const subscription = supabase
      .channel("queue")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "queue" },
        (payload) => {
          setQueue((currentQueue) => [
            ...currentQueue,
            payload.new as QueueItem,
          ]);
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "queue" },
        (payload) => {
          setQueue((currentQueue) =>
            currentQueue.filter((item) => item.id !== payload.old.id)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  // If the user is not logged in, prompt them to sign in
  if (!user) {
    return <div>Please sign in to view the queue</div>;
  }

  return (
    <div className="mx-auto max-w-xl rounded-lg bg-white p-6 shadow-lg">
      <h1 className="mb-6 text-center text-3xl font-bold text-gray-800">
        Queue
      </h1>

      {/* Render queue list */}
      <ul className="space-y-4">
        {queue.map((item: any) => (
          <li
            key={item.id}
            className="flex items-center justify-between rounded-lg bg-gray-100 p-4 shadow-md"
          >
            <span className="font-medium text-gray-700">
              {item.name} {/* Display user name */}
            </span>
            <span className="rounded-full bg-blue-600 px-3 py-1 text-white">
              {item.action}
            </span>
          </li>
        ))}
      </ul>

      {/* Buttons to join the queue */}
      <div className="mt-6 flex justify-between space-x-4">
        <button
          onClick={() => joinQueue("pro")}
          className="w-full rounded-lg bg-green-500 px-4 py-2 text-white transition hover:bg-green-600"
        >
          Pro
        </button>
        <button
          onClick={() => joinQueue("con")}
          className="w-full rounded-lg bg-red-500 px-4 py-2 text-white transition hover:bg-red-600"
        >
          Con
        </button>
        <button
          onClick={() => joinQueue("comment")}
          className="w-full rounded-lg bg-yellow-500 px-4 py-2 text-white transition hover:bg-yellow-600"
        >
          Comment
        </button>
      </div>

      {/* Button to leave the queue */}
      <div className="mt-6 text-center">
        <button
          onClick={leaveQueue}
          className="rounded-lg bg-gray-600 px-6 py-2 text-white transition hover:bg-gray-700"
        >
          Leave Queue
        </button>
      </div>
    </div>
  );
}
