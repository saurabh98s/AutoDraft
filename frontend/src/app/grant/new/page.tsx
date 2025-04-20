"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-toastify";

// Type for your in-memory grants
interface Grant {
  id: string;
  title: string;
  funder: string;
  deadline: string;
  description: string;
  amount: string;
  category: string;
  status: "draft" | "submitted" | "approved" | "rejected";
  updatedAt: string;
}

// Load grants from localStorage (or return empty array)
function loadGrants(): Grant[] {
  if (typeof window !== "undefined") {
    try {
      const data = localStorage.getItem("mockGrants");
      return data ? JSON.parse(data) : [];
    } catch (err) {
      console.error("Failed to parse localStorage grants", err);
    }
  }
  return [];
}

// Save grants to localStorage
function saveGrants(grants: Grant[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem("mockGrants", JSON.stringify(grants));
  }
}

export default function NewGrantPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Same initial form state as your code
  const [formData, setFormData] = useState({
    title: "",
    funder: "",
    deadline: "",
    description: "",
    amount: "",
    category: "education",
  });

  // On first mount, ensure localStorage at least has an array (or your mock data).
  // If you prefer purely empty, remove the "seed with mock data" logic below.
  useEffect(() => {
    const existing = loadGrants();
    if (!existing.length) {
      // Optionally seed with your mock data. Or do nothing if you want an empty start.
      // localStorage.setItem("mockGrants", JSON.stringify([]));
    }
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Use the new API endpoint
      const response = await fetch('http://localhost:8000/api/grants/new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          funder: formData.funder,
          deadline: formData.deadline,
          description: formData.description,
          amount: formData.amount,
          category: formData.category,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create grant');
      }

      const result = await response.json();
      toast.success("Grant project created successfully!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Error creating grant:", error);
      toast.error("Failed to create grant project");
      
      // Fallback to localStorage if API fails
      const newGrant: Grant = {
        id: Date.now().toString(), // quick unique ID
        title: formData.title,
        funder: formData.funder,
        deadline: formData.deadline,
        description: formData.description,
        amount: formData.amount,
        category: formData.category,
        status: "draft",
        updatedAt: new Date().toISOString(),
      };

      // Load existing grants from localStorage
      const existing = loadGrants();
      // Add the new grant
      existing.push(newGrant);
      // Save them back
      saveGrants(existing);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen font-[family-name:var(--font-geist-sans)] overflow-hidden bg-gradient-to-b from-white to-gray-50">
      {/* Animated Background Blobs */}
      <div
        className="animated-blob w-[500px] h-[500px] left-[-200px] top-[100px]"
        style={{ animationDelay: "0s" }}
      ></div>
      <div
        className="animated-blob w-[600px] h-[600px] right-[-250px] top-[300px]"
        style={{ animationDelay: "2s" }}
      ></div>
      <div
        className="animated-blob w-[400px] h-[400px] left-[30%] bottom-[-100px]"
        style={{ animationDelay: "4s" }}
      ></div>

      {/* Header */}
      <header className="bg-white shadow z-10 relative backdrop-blur-sm bg-opacity-90">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 bg-clip-text text-transparent animate-gradient animate-fade-in">
            AutoDraft
          </h1>
          <div className="flex items-center space-x-4">
            <button className="text-gray-600 hover:text-gray-900">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032
                  2.032 0 0118 14.158V11a6.002
                  6.002 0 00-4-5.659V5a2
                  2 0 10-4 0v.341C7.67
                  6.165 6 8.388 6 11v3.159c0
                  .538-.214 1.055-.595 1.436L4
                  17h5m6 0v1a3 3 0 11-6 0v-1m6
                  0H9"
                />
              </svg>
            </button>
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
              US
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        className="container mx-auto px-4 py-8 relative z-10 animate-fade-in"
        style={{ animationDelay: "0.2s" }}
      >
        <div className="mb-8">
          <div className="flex items-center">
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 inline mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 14.707a1 1 0 
                     01-1.414 0l-4-4a1 1 0 
                     010-1.414l4-4a1 1 0 
                     011.414 1.414L7.414
                     9H15a1 1 0 110 2H7.414l
                     2.293 2.293a1 1 0 
                     010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Back to Dashboard
            </Link>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 bg-clip-text text-transparent animate-gradient mt-4">
            Create New Grant Project
          </h2>
          <p
            className="text-gray-600 animate-slide-up"
            style={{ animationDelay: "0.3s" }}
          >
            Enter the details of your new grant application
          </p>
        </div>

        <div
          className="bg-white shadow rounded-xl p-8 border border-gray-100 animate-slide-up"
          style={{ animationDelay: "0.4s" }}
        >
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2">
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Project Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md 
                             focus:outline-none focus:ring-blue-500 
                             focus:border-blue-500"
                  placeholder="Enter the title of your grant project"
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label
                  htmlFor="funder"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Funding Organization *
                </label>
                <input
                  type="text"
                  id="funder"
                  name="funder"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md 
                             focus:outline-none focus:ring-blue-500 
                             focus:border-blue-500"
                  placeholder="Organization providing the grant"
                  value={formData.funder}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label
                  htmlFor="deadline"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Application Deadline *
                </label>
                <input
                  type="date"
                  id="deadline"
                  name="deadline"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md 
                             focus:outline-none focus:ring-blue-500 
                             focus:border-blue-500"
                  value={formData.deadline}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Grant Amount ($)
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md 
                             focus:outline-none focus:ring-blue-500 
                             focus:border-blue-500"
                  placeholder="Grant amount in USD"
                  value={formData.amount}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md 
                             focus:outline-none focus:ring-blue-500 
                             focus:border-blue-500"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="education">Education</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="environment">Environment</option>
                  <option value="arts">Arts & Culture</option>
                  <option value="community">Community Development</option>
                  <option value="research">Research</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="col-span-2">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Project Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={5}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md 
                             focus:outline-none focus:ring-blue-500 
                             focus:border-blue-500"
                  placeholder="Provide a brief description of your grant project"
                  value={formData.description}
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-end space-x-4">
              <Link href="/dashboard" className="btn-secondary">
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 
                           0 0 5.373 0 12h4zm2 5.291A7.962 
                           7.962 0 014 12H0c0 3.042 
                           1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating...
                  </div>
                ) : (
                  "Create Grant Project"
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
