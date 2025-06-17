import React from 'react';
import { CaseFormInstance } from '@/hooks/useMultipleCaseForms';

interface CaseStudyTabsProps {
  forms: CaseFormInstance[];
  activeFormId: string | null;
  onTabClick: (formId: string) => void;
  onTabClose: (formId: string) => void;
}

const getStatusColor = (status: CaseFormInstance['status']) => {
  switch (status) {
    case 'editing':
      return 'border-yellow-500 bg-yellow-900 text-yellow-100';
    case 'completed':
      return 'border-green-500 bg-green-900 text-green-100';
    case 'submitting':
      return 'border-blue-500 bg-blue-900 text-blue-100';
    case 'submitted':
      return 'border-gray-500 bg-gray-800 text-gray-300';
    case 'error':
      return 'border-red-500 bg-red-900 text-red-100';
    default:
      return 'border-gray-600 bg-gray-800 text-white';
  }
};

const getStatusIcon = (status: CaseFormInstance['status']) => {
  switch (status) {
    case 'completed':
      return '✓';
    case 'submitting':
      return '⟳';
    case 'submitted':
      return '✓';
    case 'error':
      return '!';
    default:
      return '●';
  }
};

export default function CaseStudyTabs({ forms, activeFormId, onTabClick, onTabClose }: CaseStudyTabsProps) {
  if (forms.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-600 pb-4">
      {forms.map((form) => (
        <div
          key={form.id}
          className={`relative flex items-center gap-2 px-4 py-2 rounded-t-lg border-2 cursor-pointer transition-all duration-200 ${
            activeFormId === form.id
              ? `${getStatusColor(form.status)} border-b-transparent -mb-0.5`
              : 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
          onClick={() => onTabClick(form.id)}
        >
          <div className="flex items-center gap-2">
            <span className={`text-sm ${
              form.status === 'completed' ? 'text-green-400' :
              form.status === 'submitted' ? 'text-gray-400' :
              form.status === 'error' ? 'text-red-400' :
              form.status === 'submitting' ? 'text-blue-400' :
              'text-yellow-400'
            }`}>
              {getStatusIcon(form.status)}
            </span>
            <span className="text-sm font-medium truncate max-w-32" title={form.prospect.full_name}>
              {form.prospect.full_name}
            </span>
          </div>
          
          {form.status !== 'submitted' && form.status !== 'submitting' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(form.id);
              }}
              className="ml-2 text-gray-400 hover:text-red-400 text-sm font-bold leading-none"
              title="Close form"
            >
              ×
            </button>
          )}
        </div>
      ))}
    </div>
  );
}