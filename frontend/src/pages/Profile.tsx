import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import axios from 'axios';

interface Organization {
  id: string;
  name: string;
  mission: string;
  tax_id: string;
  address: string;
}

const Profile: React.FC = () => {
  const { token, user } = useSelector((state: RootState) => state.auth);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    mission: '',
    tax_id: '',
    address: '',
  });

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/organizations/${user?.organization_id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setOrganization(response.data);
        setFormData({
          name: response.data.name,
          mission: response.data.mission,
          tax_id: response.data.tax_id,
          address: response.data.address,
        });
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch organization details');
        setLoading(false);
      }
    };

    if (user?.organization_id) {
      fetchOrganization();
    }
  }, [token, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:8000/organizations/${organization?.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setOrganization({
        ...organization!,
        ...formData,
      });
      setEditMode(false);
    } catch (err) {
      setError('Failed to update organization details');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Organization Details
            </h2>
            <button
              onClick={() => setEditMode(!editMode)}
              className="text-blue-500 hover:text-blue-600"
            >
              {editMode ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {editMode ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Organization Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="mission"
                  className="block text-sm font-medium text-gray-700"
                >
                  Mission Statement
                </label>
                <textarea
                  id="mission"
                  name="mission"
                  value={formData.mission}
                  onChange={handleChange}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="tax_id"
                  className="block text-sm font-medium text-gray-700"
                >
                  Tax ID
                </label>
                <input
                  type="text"
                  id="tax_id"
                  name="tax_id"
                  value={formData.tax_id}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-700"
                >
                  Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={2}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Organization Name
                </h3>
                <p className="mt-1 text-gray-900">{organization?.name}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Mission Statement
                </h3>
                <p className="mt-1 text-gray-900">{organization?.mission}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Tax ID</h3>
                <p className="mt-1 text-gray-900">{organization?.tax_id}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Address</h3>
                <p className="mt-1 text-gray-900">{organization?.address}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile; 