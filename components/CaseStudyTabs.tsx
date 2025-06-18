import React from "react";
import { CaseFormInstance } from "@/hooks/useMultipleCaseForms";

interface CaseStudyTabsProps {
  forms: CaseFormInstance[];
  activeFormId: string | null;
  onTabClick: (formId: string) => void;
  onTabClose: (formId: string) => void;
  autoSaveStatus?: {[formId: string]: {saving: boolean, lastSaved?: string}};
}

const getStatusColor = (status: CaseFormInstance["status"]) => {
  switch (status) {
    case "editing":
      return "border-green-500 bg-green-900 text-green-100";
    case "completed":
      return "border-green-500 bg-green-900 text-green-100";
    case "submitting":
      return "border-blue-500 bg-blue-900 text-blue-100";
    case "submitted":
      return "border-gray-500 bg-gray-800 text-gray-300";
    case "error":
      return "border-red-500 bg-red-900 text-red-100";
    default:
      return "border-gray-600 bg-gray-800 text-white";
  }
};

const getStatusIcon = (form: CaseFormInstance) => {
  switch (form.status) {
    case "submitting":
      return "⟳";
    case "submitted":
      return "✓";
    case "error":
      return "!";
    default:
      // For editing status, show different icons based on whether it's new or existing
      return form.isEditing ? "✎" : "!";
  }
};

export default function CaseStudyTabs({
  forms,
  activeFormId,
  onTabClick,
  onTabClose,
  autoSaveStatus = {},
}: CaseStudyTabsProps) {
  if (forms.length === 0) return null;

  return (
    <div className="mb-6 flex flex-wrap gap-2 border-b border-gray-600 pb-4">
      {forms.map((form) => (
        <div
          key={form.id}
          className={`relative flex cursor-pointer items-center gap-2 rounded-t-lg border-2 px-4 py-2 transition-all duration-200 ${
            activeFormId === form.id
              ? `${getStatusColor(form.status)} -mb-0.5 border-b-transparent`
              : "border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
          onClick={() => onTabClick(form.id)}
        >
          <div className="flex items-center gap-2">
            <span
              className={`text-sm ${
                form.status === "submitted"
                  ? "text-green-400"
                  : form.status === "error"
                    ? "text-red-400"
                    : form.status === "submitting"
                      ? "text-blue-400"
                        : "text-white-400"
              }`}
            >
              {getStatusIcon(form)}
            </span>
            <span
              className="max-w-32 truncate text-sm font-medium"
              title={form.prospect.full_name}
            >
              {form.prospect.full_name}
            </span>
            {autoSaveStatus[form.id]?.saving && (
              <span className="text-xs text-grey-400 ml-1">Saving...</span>
            )}
          </div>
          {autoSaveStatus[form.id]?.lastSaved && !autoSaveStatus[form.id]?.saving && (
            <div className="text-xs text-gray-400 truncate max-w-20" title={`Last saved: ${autoSaveStatus[form.id]?.lastSaved}`}>
              {autoSaveStatus[form.id]?.lastSaved}
            </div>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onTabClose(form.id);
            }}
            className="ml-2 text-sm font-bold leading-none text-gray-400 hover:text-red-400"
            title="Close form"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
