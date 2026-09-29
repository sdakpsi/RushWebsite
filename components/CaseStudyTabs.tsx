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
      return "border-border bg-navy-800 text-foreground";
    case "completed":
      return "border-success bg-success/15 text-success";
    case "submitting":
      return "border-border bg-navy-800 text-foreground";
    case "submitted":
      return "border-border bg-navy-800 text-foreground";
    case "error":
      return "border-destructive bg-destructive/15 text-destructive";
    default:
      return "border-border bg-navy-850 text-foreground";
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
    <div className="mb-6 flex flex-wrap gap-2 border-b border-border pb-4">
      {forms.map((form) => (
        <div
          key={form.id}
          className={`relative flex cursor-pointer items-center gap-2 rounded-t-lg border-2 px-4 py-2 transition-all duration-200 ${
            activeFormId === form.id
              ? `${getStatusColor(form.status)} -mb-0.5 border-b-transparent`
              : "border-border bg-navy-850 text-foreground hover:bg-navy-800"
          }`}
          onClick={() => onTabClick(form.id)}
        >
          <div className="flex items-center gap-2">
            <span
              className={`text-sm ${
                form.status === "submitted"
                  ? "text-success"
                  : form.status === "error"
                    ? "text-destructive"
                    : form.status === "submitting"
                      ? "text-muted-foreground"
                        : "text-foreground"
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
            <div className="text-xs text-muted-foreground truncate max-w-20" title={`Last saved: ${autoSaveStatus[form.id]?.lastSaved}`}>
              {autoSaveStatus[form.id]?.lastSaved}
            </div>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onTabClose(form.id);
            }}
            className="ml-2 text-sm font-bold leading-none text-muted-foreground hover:text-destructive"
            title="Close form"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
