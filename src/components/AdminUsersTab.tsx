import React, { useState } from 'react';
import {
  Users,
  Search,
  Shield,
  UserCheck,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  DollarSign,
  Download,
  Edit2,
  Trash2,
  KeyRound,
  CheckCircle,
  XCircle,
  X,
  Save,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { User } from '../types';
import * as XLSX from 'xlsx';

export const AdminUsersTab: React.FC = () => {
  const { registeredUsers, updateUserByAdmin, deleteUserByAdmin, showToast } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'customer' | 'admin'>('all');

  // Edit User Modal
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState<{
    name: string;
    email: string;
    phone: string;
    password?: string;
    address: string;
    telegram: string;
    isActive: boolean;
  }>({
    name: '',
    email: '',
    phone: '',
    password: '',
    address: '',
    telegram: '',
    isActive: true,
  });

  const filteredUsers = registeredUsers.filter((user) => {
    if (roleFilter !== 'all' && user.role !== roleFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = user.name.toLowerCase().includes(q);
      const matchEmail = user.email?.toLowerCase().includes(q);
      const matchPhone = user.phone?.includes(q);
      const matchId = user.loginIdentifier.toLowerCase().includes(q);
      return matchName || matchEmail || matchPhone || matchId;
    }
    return true;
  });

  const totalCustomers = registeredUsers.filter((u) => u.role === 'customer').length;
  const totalCustomerSpend = registeredUsers
    .filter((u) => u.role === 'customer')
    .reduce((sum, u) => sum + (u.totalSpent || 0), 0);

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setEditFormData({
      name: user.name,
      email: user.email || '',
      phone: user.phone || '',
      password: '',
      address: user.address || '',
      telegram: user.telegram || '',
      isActive: user.isActive !== false,
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    const updates: Partial<User> = {
      name: editFormData.name,
      email: editFormData.email,
      phone: editFormData.phone,
      address: editFormData.address,
      telegram: editFormData.telegram,
      isActive: editFormData.isActive,
    };
    if (editFormData.password?.trim()) {
      updates.password = editFormData.password.trim();
    }
    updateUserByAdmin(editingUser.id, updates);
    setEditingUser(null);
  };

  const exportUsersToExcel = () => {
    const data = registeredUsers.map((u, i) => ({
      'No.': i + 1,
      'Full Name': u.name,
      'Role': u.role.toUpperCase(),
      'Login Identifier': u.loginIdentifier,
      'Gmail Address': u.email || 'N/A',
      'Phone Number': u.phone || 'N/A',
      'Security Status': 'Protected / Encrypted',
      'Total Orders Placed': u.totalOrders || 0,
      'Total Spent ($ USD)': (u.totalSpent || 0).toFixed(2),
      'Delivery Address': u.address || 'N/A',
      'Telegram': u.telegram || 'N/A',
      'Registration Date': u.registeredAt ? new Date(u.registeredAt).toLocaleString() : 'Pre-registered',
      'Account Status': u.isActive !== false ? 'ACTIVE' : 'SUSPENDED',
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [
      { wch: 6 },
      { wch: 22 },
      { wch: 12 },
      { wch: 25 },
      { wch: 25 },
      { wch: 18 },
      { wch: 18 },
      { wch: 18 },
      { wch: 18 },
      { wch: 35 },
      { wch: 18 },
      { wch: 22 },
      { wch: 14 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, 'Registered Accounts');
    XLSX.writeFile(wb, `Akuruhi_Registered_User_Accounts_${new Date().toISOString().split('T')[0]}.xlsx`);
    showToast('Exported all registered user accounts to Excel.');
  };

  return (
    <div className="space-y-6 text-slate-900 dark:text-neutral-100">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-neutral-400 text-xs">
            <span>Total Registered Users</span>
            <Users className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            {registeredUsers.length}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-neutral-500 mt-0.5">
            {totalCustomers} Customer Accounts · {registeredUsers.length - totalCustomers} Administrator
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-neutral-400 text-xs">
            <span>Customer Lifetime Volume</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            ${totalCustomerSpend.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-neutral-500 mt-0.5">
            Accumulated gross customer purchase value
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-neutral-400 text-xs">
            <span>Authentication Policy</span>
            <KeyRound className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
            Strict Credential Enforcement
          </div>
          <div className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
            Admin: Gmail only · Users: Gmail or Phone
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Export */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400 dark:text-neutral-500" />
            <input
              type="text"
              placeholder="Search by customer name, Gmail, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-white text-base sm:text-xs focus:outline-none focus:border-rose-500"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-white dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-white text-xs focus:outline-none"
          >
            <option value="all">All Roles</option>
            <option value="customer">Customers Only</option>
            <option value="admin">Administrators Only</option>
          </select>
        </div>

        <button
          onClick={exportUsersToExcel}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 text-xs font-semibold transition-colors shadow-xs"
        >
          <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Export User Directory to Excel (.xlsx)</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-md">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-neutral-900 text-slate-500 dark:text-neutral-400 uppercase tracking-wider font-mono border-b border-slate-200 dark:border-neutral-800 text-[11px]">
            <tr>
              <th className="py-3 px-4">User</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Login Identifier (Gmail / Phone)</th>
              <th className="py-3 px-4">Purchases</th>
              <th className="py-3 px-4">Delivery Address</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-neutral-850">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-neutral-850/60 transition-colors">
                <td className="py-3 px-4">
                  <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{user.name}</span>
                    {user.role === 'admin' && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                        Admin
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-neutral-400 flex items-center gap-1 mt-0.5">
                    {user.telegram && <span className="text-sky-500 dark:text-sky-400">{user.telegram}</span>}
                  </div>
                </td>

                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      user.role === 'admin'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30'
                        : 'bg-slate-100 text-slate-700 border border-slate-300 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700'
                    }`}
                  >
                    {user.role}
                  </span>
                </td>

                <td className="py-3 px-4 font-mono text-slate-700 dark:text-neutral-200">
                  <div className="flex flex-col">
                    <span className="text-slate-900 dark:text-white font-medium">{user.loginIdentifier}</span>
                    {user.email && user.email !== user.loginIdentifier && (
                      <span className="text-[10px] text-slate-500 dark:text-neutral-400">{user.email}</span>
                    )}
                    {user.phone && user.phone !== user.loginIdentifier && (
                      <span className="text-[10px] text-slate-500 dark:text-neutral-400">{user.phone}</span>
                    )}
                  </div>
                </td>

                <td className="py-3 px-4">
                  <div className="font-mono font-bold text-slate-900 dark:text-white">
                    ${(user.totalSpent || 0).toFixed(2)}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-neutral-400">
                    {user.totalOrders || 0} orders placed
                  </div>
                </td>

                <td className="py-3 px-4 text-slate-600 dark:text-neutral-300 max-w-xs truncate">
                  {user.address || <span className="text-slate-400 dark:text-neutral-600">No address saved</span>}
                </td>

                <td className="py-3 px-4">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      user.isActive !== false
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                        : 'bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
                    }`}
                  >
                    {user.isActive !== false ? (
                      <>
                        <CheckCircle className="w-3 h-3" />
                        <span>Active</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3" />
                        <span>Suspended</span>
                      </>
                    )}
                  </span>
                </td>

                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(user)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-200 transition-colors"
                      title="Edit Customer Information"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {user.role !== 'admin' && (
                      <button
                        onClick={() => {
                          if (confirm(`Remove customer record for "${user.name}"?`)) {
                            deleteUserByAdmin(user.id);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 dark:bg-neutral-800 dark:hover:bg-rose-950/60 dark:text-neutral-400 dark:hover:text-rose-400 transition-colors"
                        title="Delete Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-md bg-white dark:bg-[#11141c] text-slate-900 dark:text-neutral-100 rounded-2xl border border-slate-200 dark:border-neutral-750 p-6 space-y-4 shadow-2xl my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-neutral-800">
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                Modify Account: {editingUser.name}
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:text-neutral-400 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-neutral-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-white text-base sm:text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-neutral-400 mb-1">Gmail Address (@gmail.com)</label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-white font-mono text-base sm:text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-neutral-400 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-white font-mono text-base sm:text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-neutral-400 mb-1">Reset Password (Optional)</label>
                <input
                  type="password"
                  placeholder="Enter new password to reset, or leave blank to keep unchanged"
                  value={editFormData.password || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-white font-mono text-base sm:text-xs"
                />
                <span className="text-[10px] text-slate-500 dark:text-neutral-500 mt-0.5 block">
                  Customer passwords are encrypted and hidden for privacy. Only enter a new password if resetting.
                </span>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-neutral-400 mb-1">Delivery Address</label>
                <textarea
                  rows={2}
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-white text-base sm:text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-neutral-400 mb-1">Telegram</label>
                <input
                  type="text"
                  value={editFormData.telegram}
                  onChange={(e) => setEditFormData({ ...editFormData, telegram: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-white font-mono text-base sm:text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={editFormData.isActive}
                  onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.checked })}
                  className="rounded accent-rose-500"
                />
                <label htmlFor="isActiveToggle" className="text-slate-800 dark:text-neutral-300 font-medium cursor-pointer">
                  Account Active & Permitted to Login
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-neutral-800 hover:bg-slate-300 dark:hover:bg-neutral-750 text-slate-800 dark:text-neutral-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
