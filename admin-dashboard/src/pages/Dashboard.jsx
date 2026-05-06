import React, { useState, useEffect } from 'react';

const API_BASE = '/api';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        fetch(`${API_BASE}/admin/stats`, { headers: getHeaders() }),
        fetch(`${API_BASE}/admin/users`, { headers: getHeaders() }),
      ]);
      const statsData = await statsRes.json();
      const usersData = await usersRes.json();
      setStats(statsData.stats);
      setUsers(usersData.users || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Students', value: stats?.totalStudents || 0, icon: '👨‍🎓', color: 'from-indigo-500/20 to-indigo-600/10 border-indigo-500/30' },
    { label: 'Total Faculty', value: stats?.totalFaculty || 0, icon: '👨‍🏫', color: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30' },
    { label: 'Active Courses', value: stats?.totalCourses || 0, icon: '📚', color: 'from-amber-500/20 to-amber-600/10 border-amber-500/30' },
    { label: 'Departments', value: stats?.totalDepartments || 0, icon: '🏛️', color: 'from-purple-500/20 to-purple-600/10 border-purple-500/30' },
    { label: 'Pending Fees', value: stats?.pendingFees || 0, icon: '⚠️', color: 'from-red-500/20 to-red-600/10 border-red-500/30' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-50">Dashboard Overview</h1>
        <p className="text-slate-400 mt-1">University Management System analytics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card, i) => (
          <div key={i} className={`bg-gradient-to-br ${card.color} border rounded-xl p-5`}>
            <div className="text-2xl mb-2">{card.icon}</div>
            <div className="text-3xl font-bold text-slate-50">{card.value}</div>
            <div className="text-sm text-slate-400 mt-1">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Users Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-50">Recent Users</h2>
          <span className="text-sm text-slate-400">{users.length} total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Name</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Email</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Role</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Department</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {users.slice(0, 10).map((user, i) => (
                <tr key={i} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center text-sm font-medium text-primary-400">
                        {user.profile?.firstName?.[0]}{user.profile?.lastName?.[0]}
                      </div>
                      <span className="text-sm text-slate-200">{user.profile?.firstName} {user.profile?.lastName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-400">{user.email}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.role === 'ADMIN' ? 'bg-red-500/20 text-red-400' :
                      user.role === 'FACULTY' ? 'bg-emerald-500/20 text-emerald-400' :
                      'bg-indigo-500/20 text-indigo-400'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-400">{user.profile?.department?.name || '—'}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 text-xs ${user.isActive ? 'text-emerald-400' : 'text-red-400'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
