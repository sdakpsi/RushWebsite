"use client";

import React from "react";
import { useSimpleAnalytics } from "@/hooks/useSimpleAnalytics";
import LoadingSpinner from "./LoadingSpinner";

const AnalyticsDebug: React.FC = () => {
  const { data, isLoading, error } = useSimpleAnalytics();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <LoadingSpinner />
        <span className="ml-4 text-muted-foreground">Testing database connection...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-destructive/15 border border-destructive p-6">
        <h3 className="text-destructive font-bold text-lg">Database Connection Error</h3>
        <p className="text-destructive mt-2">Error: {error instanceof Error ? error.message : String(error)}</p>
        <details className="mt-4">
          <summary className="cursor-pointer text-destructive">Full Error Details</summary>
          <pre className="mt-2 text-xs text-destructive bg-destructive/10 p-3 rounded overflow-auto">
            {JSON.stringify(error, null, 2)}
          </pre>
        </details>
      </div>
    );
  }

  if (data?.error) {
    return (
      <div className="rounded-lg bg-destructive/15 border border-destructive p-6">
        <h3 className="text-destructive font-bold text-lg">Database Query Error</h3>
        <p className="text-destructive mt-2">Error: {data.error}</p>
        <details className="mt-4">
          <summary className="cursor-pointer text-destructive">Full Error Details</summary>
          <pre className="mt-2 text-xs text-destructive bg-destructive/10 p-3 rounded overflow-auto">
            {JSON.stringify(data.details, null, 2)}
          </pre>
        </details>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-success/15 border border-success p-6">
        <h3 className="text-success font-bold text-lg">✅ Database Connection Successful</h3>
        <p className="text-success mt-2">All basic queries are working!</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-primary/15 border border-primary p-4">
          <h4 className="text-primary font-semibold">Users Found</h4>
          <p className="text-foreground text-2xl font-bold">{data?.usersCount || 0}</p>
        </div>
        <div className="rounded-lg bg-success/15 border border-success p-4">
          <h4 className="text-success font-semibold">Comments</h4>
          <p className="text-foreground text-2xl font-bold">{data?.commentsCount || 0}</p>
        </div>
        <div className="rounded-lg bg-warning/15 border border-warning p-4">
          <h4 className="text-warning font-semibold">Case Studies</h4>
          <p className="text-foreground text-2xl font-bold">{data?.caseStudiesCount || 0}</p>
        </div>
        <div className="rounded-lg bg-periwinkle-300/15 border border-periwinkle-300/50 p-4">
          <h4 className="text-periwinkle-300 font-semibold">Interviews</h4>
          <p className="text-foreground text-2xl font-bold">{data?.interviewsCount || 0}</p>
        </div>
      </div>

      {data?.sampleUser && (
        <div className="rounded-lg bg-navy-900 p-6">
          <h4 className="text-muted-foreground font-semibold mb-3">Sample User Data</h4>
          <pre className="text-xs text-muted-foreground bg-navy-950 p-3 rounded overflow-auto">
            {JSON.stringify(data.sampleUser, null, 2)}
          </pre>
        </div>
      )}

      <div className="rounded-lg bg-navy-900 p-6">
        <h4 className="text-muted-foreground font-semibold mb-3">Full Response</h4>
        <pre className="text-xs text-muted-foreground bg-navy-950 p-3 rounded overflow-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default AnalyticsDebug;