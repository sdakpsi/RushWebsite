"use client"
import { getInterviewProspects } from '@/app/supabase/getUsers';
import { ProspectInterview } from '@/lib/types';
import React, { useEffect, useState } from 'react'

interface InterviewSearchBarProps {
    selectedProspect: ProspectInterview | null;
    setSelectedProspect: (prospect: ProspectInterview) => void;
}
export default function InterviewSearchBar({ selectedProspect, setSelectedProspect }: InterviewSearchBarProps) {
    const [prospectData, setProspectData] = useState<ProspectInterview[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);
    const [searchInput, setSearchInput] = useState('');
    const [filteredData, setFilteredData] = useState<ProspectInterview[]>([]);
    const [selected , setSelected] = useState<ProspectInterview | null>(null);
    useEffect(() => {
        const getInterviewProspectData = async () => {
            const prospectData = await getInterviewProspects();
            if(prospectData){
                setProspectData(prospectData);
            }
            else{
                setError(false)
            }
            setIsLoading(false);    
        }
        getInterviewProspectData();
    }, [])

    useEffect(() => {
        const filtered = prospectData.filter(prospect =>
            prospect.full_name.toLowerCase().includes(searchInput.toLowerCase())
        );
        setFilteredData(filtered);
    }, [searchInput]);

    const handleSelectProspect = (prospect: ProspectInterview) => {
        setSelectedProspect(prospect);
        setSearchInput(''); 
    };


    if (isLoading) {
        return <div>Fetching Prospects...</div>;
    }

    if (error) {
        return <div>There was an error fetching the prospects, please try refreshing.</div>;
    }
    return (
        <div className="mb-6">
           
                <div className="text-white mb-4">
                    Currently selected: {selectedProspect?.full_name ?? ""}
                </div>
            
            <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                Search
            </label>
            <div className="mt-1 relative">
                <input
                    type="text"
                    name="search"
                    id="search"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    style={{ backgroundColor: '#333', color: 'white' }}
                />
                 {searchInput && (
                    <div className="suggestions absolute z-10 w-full bg-gray-800 mt-1 rounded-md shadow-lg">
                        {filteredData.map((prospect, index) => (
                            <div
                                key={index}
                                className="suggestion px-4 py-2 border-b border-gray-700 text-white cursor-pointer"
                                style={{ minHeight: '50px' }}
                                onClick={() => handleSelectProspect(prospect)}
                            >
                                {prospect.full_name} - {prospect.email}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}