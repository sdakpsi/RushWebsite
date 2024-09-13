import { useState, useMemo } from 'react';
import { Packet } from '@/lib/types';

export function useSearchAndSort(usersData: Packet[]) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortType, setSortType] = useState<'name' | 'score'>('name');

  const sortUsers = () => {
    setSortType((prevSortType) => (prevSortType === 'name' ? 'score' : 'name'));
  };

  const filteredUsersData = useMemo(() => {
    let filtered = usersData.filter((applicant) =>
      applicant.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortType === 'score') {
      filtered.sort((a, b) => (b.total_score ?? 0) - (a.total_score ?? 0));
    } else {
      filtered.sort((a, b) => a.full_name.localeCompare(b.full_name));
    }

    return filtered;
  }, [usersData, searchQuery, sortType]);

  return { searchQuery, setSearchQuery, sortType, sortUsers, filteredUsersData };
}