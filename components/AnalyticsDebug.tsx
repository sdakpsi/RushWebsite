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
        <span className="ml-4 text-gray-300">Testing database connection...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-900/30 border border-red-500 p-6">
        <h3 className="text-red-400 font-bold text-lg">Database Connection Error</h3>
        <p className="text-red-300 mt-2">Error: {error instanceof Error ? error.message : String(error)}</p>
        <details className="mt-4">
          <summary className="cursor-pointer text-red-400">Full Error Details</summary>
          <pre className="mt-2 text-xs text-red-200 bg-red-950/50 p-3 rounded overflow-auto">
            {JSON.stringify(error, null, 2)}
          </pre>
        </details>
      </div>
    );
  }

  if (data?.error) {
    return (
      <div className="rounded-lg bg-red-900/30 border border-red-500 p-6">
        <h3 className="text-red-400 font-bold text-lg">Database Query Error</h3>
        <p className="text-red-300 mt-2">Error: {data.error}</p>
        <details className="mt-4">
          <summary className="cursor-pointer text-red-400">Full Error Details</summary>
          <pre className="mt-2 text-xs text-red-200 bg-red-950/50 p-3 rounded overflow-auto">
            {JSON.stringify(data.details, null, 2)}
          </pre>
        </details>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-green-900/30 border border-green-500 p-6">
        <h3 className="text-green-400 font-bold text-lg">✅ Database Connection Successful</h3>
        <p className="text-green-300 mt-2">All basic queries are working!</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-blue-900/30 border border-blue-500 p-4">
          <h4 className="text-blue-400 font-semibold">Users Found</h4>
          <p className="text-white text-2xl font-bold">{data?.usersCount || 0}</p>
        </div>
        <div className="rounded-lg bg-green-900/30 border border-green-500 p-4">
          <h4 className="text-green-400 font-semibold">Comments</h4>
          <p className="text-white text-2xl font-bold">{data?.commentsCount || 0}</p>
        </div>
        <div className="rounded-lg bg-yellow-900/30 border border-yellow-500 p-4">
          <h4 className="text-yellow-400 font-semibold">Case Studies</h4>
          <p className="text-white text-2xl font-bold">{data?.caseStudiesCount || 0}</p>
        </div>
        <div className="rounded-lg bg-purple-900/30 border border-purple-500 p-4">
          <h4 className="text-purple-400 font-semibold">Interviews</h4>
          <p className="text-white text-2xl font-bold">{data?.interviewsCount || 0}</p>
        </div>
      </div>

      {data?.sampleUser && (
        <div className="rounded-lg bg-gray-800 p-6">
          <h4 className="text-gray-300 font-semibold mb-3">Sample User Data</h4>
          <pre className="text-xs text-gray-400 bg-gray-900 p-3 rounded overflow-auto">
            {JSON.stringify(data.sampleUser, null, 2)}
          </pre>
        </div>
      )}

      <div className="rounded-lg bg-gray-800 p-6">
        <h4 className="text-gray-300 font-semibold mb-3">Full Response</h4>
        <pre className="text-xs text-gray-400 bg-gray-900 p-3 rounded overflow-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default AnalyticsDebug;