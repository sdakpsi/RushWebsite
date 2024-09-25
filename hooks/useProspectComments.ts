import { useState, useEffect } from "react";
import { getComments } from "@/app/supabase/getUsers";
import { Comment } from "@/lib/types";

export function useProspectComments() {
  const [commentsData, setCommentsData] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getComments();
        setCommentsData(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return { commentsData, isLoading };
}
