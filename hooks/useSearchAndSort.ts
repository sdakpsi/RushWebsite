import { useState, useMemo } from 'react';
import { Packet, Comment } from '@/lib/types';

export function useSearchAndSort(usersData: Packet[], commentsData: Comment[] = []) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortType, setSortType] = useState<'name' | 'score'>('name');
  const [filterTwoPlus, setFilterTwoPlus] = useState(false);

  const sortUsers = () => {
    setSortType((prevSortType) => (prevSortType === 'name' ? 'score' : 'name'));
  };

  const toggleFilterTwoPlus = () => {
    setFilterTwoPlus((prev) => !prev);
  };

  // Create a map of prospect_id -> count of "Yes" invites
  const yesInviteCounts = useMemo(() => {
    const counts = new Map<string, number>();

    commentsData.forEach((comment) => {
      if (comment.invite === 'Yes') {
        const currentCount = counts.get(comment.prospect_id) || 0;
        counts.set(comment.prospect_id, currentCount + 1);
      }
    });

    return counts;
  }, [commentsData]);

  const filteredUsersData = useMemo(() => {
    let filtered = usersData.filter((applicant) =>
      applicant.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Apply 2+ yes invites filter
    if (filterTwoPlus) {
      filtered = filtered.filter((applicant) => {
        const yesCount = yesInviteCounts.get(applicant.id) || 0;
        return yesCount >= 2;
      });
    }

    if (sortType === 'score') {
      filtered.sort((a, b) => (b.total_score ?? 0) - (a.total_score ?? 0));
    } else {
      filtered.sort((a, b) => a.full_name.localeCompare(b.full_name));
    }

    return filtered;
  }, [usersData, searchQuery, sortType, filterTwoPlus, yesInviteCounts]);

  return {
    searchQuery,
    setSearchQuery,
    sortType,
    sortUsers,
    filteredUsersData,
    filterTwoPlus,
    toggleFilterTwoPlus,
    yesInviteCounts
  };
}