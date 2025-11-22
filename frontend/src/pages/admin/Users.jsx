import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { adminAPI } from '../../lib/api';
import { Edit2, Save, X } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editPlan, setEditPlan] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await adminAPI.getUsers();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingId(user.id);
    setEditPlan(user.plan_type);
  };

  const handleSave = async (userId) => {
    try {
      await adminAPI.updateUserPlan(userId, editPlan);
      setEditingId(null);
      fetchUsers();
    } catch (error) {
      console.error('Failed to update user:', error);
      alert('Failed to update user plan');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditPlan('');
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Wholesalers</h1>
          <p className="text-gray-600 mt-2">Manage all wholesaler accounts</p>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Total Leads
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    New
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Called
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Follow-up
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Not Int.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                      No wholesalers found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => {
                    const isEditing = editingId === user.id;
                    return (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{user.name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-600">{user.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          {isEditing ? (
                            <select
                              value={editPlan}
                              onChange={(e) => setEditPlan(e.target.value)}
                              className="border rounded px-2 py-1 text-sm"
                            >
                              <option value="free">Free</option>
                              <option value="basic">Basic</option>
                              <option value="elite">Elite</option>
                              <option value="pro">Pro</option>
                            </select>
                          ) : (
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                user.plan_type === 'free'
                                  ? 'bg-gray-100 text-gray-800'
                                  : user.plan_type === 'basic'
                                  ? 'bg-blue-100 text-blue-800'
                                  : user.plan_type === 'elite'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-orange-100 text-orange-800'
                              }`}
                            >
                              {user.plan_type.toUpperCase()}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-gray-900">{user.lead_count}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-blue-600 font-medium">{user.stats.new}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-green-600 font-medium">{user.stats.called}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-yellow-600 font-medium">{user.stats.follow_up}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-red-600 font-medium">{user.stats.not_interested}</span>
                        </td>
                        <td className="px-6 py-4">
                          {isEditing ? (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleSave(user.id)}
                                className="text-green-600 hover:text-green-800"
                              >
                                <Save className="h-4 w-4" />
                              </button>
                              <button
                                onClick={handleCancel}
                                className="text-red-600 hover:text-red-800"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleEdit(user)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Plan Management</h3>
          <p className="text-sm text-blue-700">
            Click the edit icon to change a wholesaler's plan. This is useful for testing different plan features during MVP phase.
          </p>
        </div>
      </div>
    </Layout>
  );
}
