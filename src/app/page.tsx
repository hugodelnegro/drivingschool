'use client';

import { useState } from 'react';
import Link from "next/link";
import { quizData } from "@/lib/data";

export default function Home() {
  const [jsonData, setJsonData] = useState(JSON.stringify(quizData, null, 2));
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    try {
      JSON.parse(jsonData);
      setIsEditing(false);
      alert('JSON saved successfully!');
    } catch {
      alert('Invalid JSON format. Please check your syntax.');
    }
  };

  return (
    <div className="font-sans min-h-screen p-8">
      <main className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-100 mb-4">
            Quiz Data Editor
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            View and edit the quiz data in JSON format.
          </p>
        </div>

        <div className=" rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Quiz Data (JSON)</h2>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-green-700" disabled
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setJsonData(JSON.stringify(quizData, null, 2));
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700" disabled
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)} disabled
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-blue-700"
                >
                  Edit
                </button>
              )}
            </div>
          </div>

          {isEditing ? (
            <textarea
              value={jsonData}
              onChange={(e) => setJsonData(e.target.value)}
              className="w-full h-96 p-4 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter JSON data here..."
            />
          ) : (
            <pre className="w-full h-96 p-4 border border-gray-300 rounded-lg font-mono text-sm overflow-auto">
              {jsonData}
            </pre>
          )}
        </div>

        <div className="mt-8 text-center">
          <Link
            className="rounded-sx border border-solid border-transparent transition-colors flex items-center justify-center bg-red-600 text-white gap-2 hover:bg-red-700 font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto mx-auto"
            href="/survey"
          >
            Fahrprüfung der Klasse B
          </Link>
        </div>
      </main>
    </div>
  );
}
