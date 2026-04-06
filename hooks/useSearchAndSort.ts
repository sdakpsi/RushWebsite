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

  // Create a map of prospect_id -> count of "Good" interactions
  const goodInteractionCounts = useMemo(() => {
    const counts = new Map<string, Set<string>>();

    commentsData.forEach((comment) => {
      if (comment.interaction === 'Good') {
        const currentProspectSet = counts.get(comment.prospect_id) || new Set<string>();
        currentProspectSet.add(comment.active_id);
        counts.set(comment.prospect_id, currentProspectSet);
      }
    });

    return new Map(
      Array.from(counts.entries()).map(([prospectId, activeIds]) => [
        prospectId,
        activeIds.size,
      ])
    );
  }, [commentsData]);

  const filteredUsersData = useMemo(() => {
    let filtered = usersData.filter((applicant) =>
      applicant.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Apply 2+ good interactions filter
    if (filterTwoPlus) {
      filtered = filtered.filter((applicant) => {
        const goodCount = goodInteractionCounts.get(applicant.id) || 0;
        return goodCount >= 2;
      });
    }

    if (sortType === 'score') {
      filtered.sort((a, b) => (b.total_score ?? 0) - (a.total_score ?? 0));
    } else {
      filtered.sort((a, b) => a.full_name.localeCompare(b.full_name));
    }

    return filtered;
  }, [usersData, searchQuery, sortType, filterTwoPlus, goodInteractionCounts]);

  return {
    searchQuery,
    setSearchQuery,
    sortType,
    sortUsers,
    filteredUsersData,
    filterTwoPlus,
    toggleFilterTwoPlus,
    goodInteractionCounts
  };
}
