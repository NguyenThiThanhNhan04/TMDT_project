import React, { useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout';
import {
  Search,
  CheckCircle2,
  XCircle,
  Filter,
  Eye,
  KeyRound,
  Lock,
  Unlock,
  Users,
  Building2,
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { useLocation } from 'react-router-dom';

const PARTNER_STATUS_BUTTONS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'PENDING', label: 'Chờ duyệt' },
  { value: 'APPROVED', label: 'Đã duyệt' },
  { value: 'REJECTED', label: 'Từ chối' },
];

const USER_ROLE_BUTTONS = [
  { value: 'all', label: 'Tất cả vai trò' },
  { value: 'CUSTOMER', label: 'Customer' },
  { value: 'CONTRACTOR', label: 'Contractor' },
  { value: 'ADMIN', label: 'Admin' },
];

const USER_STATUS_BUTTONS = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'active', label: 'Đang hoạt động' },
  { value: 'inactive', label: 'Đã khóa' },
  { value: 'PENDING', label: 'Chờ duyệt' },
  { value: 'APPROVED', label: 'Đã duyệt' },
  { value: 'REJECTED', label: 'Từ chối' },
];

const AdminUsersPage = () => {
  const location = useLocation();
  const isContractorView = location.pathname.includes('/contractors');

  const [partners, setPartners] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loadingPartners, setLoadingPartners] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const [partnerSearchTerm, setPartnerSearchTerm] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [partnerStatusFilter, setPartnerStatusFilter] = useState('PENDING');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userStatusFilter, setUserStatusFilter] = useState('all');

  const [selectedPartner, setSelectedPartner] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [decisionType, setDecisionType] = useState('approve');
  const [decisionReason, setDecisionReason] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    fetchPartners();
  }, [partnerStatusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [userRoleFilter, userStatusFilter, userSearchTerm]);

  const fetchPartners = async () => {
    setLoadingPartners(true);
    try {
      const response = await api.get(`/admin/partners?status=${partnerStatusFilter}`);
      setPartners(response.data.data || []);
    } catch (error) {
      console.error('Error fetching partners:', error);
      toast.error('Không thể tải danh sách nhà thầu');
    } finally {
      setLoadingPartners(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await api.get('/admin/users', {
        params: {
          role: userRoleFilter,
          status: userStatusFilter,
          q: userSearchTerm || undefined,
        },
      });
      setAllUsers(response.data.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Không thể tải danh sách người dùng');
    } finally {
      setLoadingUsers(false);
    }
  };

  const filteredPartners = useMemo(() => {
    if (!partnerSearchTerm) {
      return partners;
    }

    const term = partnerSearchTerm.toLowerCase();
    return partners.filter((partner) =>
      [partner.fullName, partner.email, partner.phoneNumber, partner.address]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term))
    );
  }, [partners, partnerSearchTerm]);

  const partnerStats = useMemo(() => ({
    total: partners.length,
    pending: partners.filter((partner) => partner.approvalStatus === 'PENDING').length,
    approved: partners.filter((partner) => partner.approvalStatus === 'APPROVED').length,
    rejected: partners.filter((partner) => partner.approvalStatus === 'REJECTED').length,
  }), [partners]);

  const userStats = useMemo(() => ({
    total: allUsers.length,
    active: allUsers.filter((user) => user.active).length,
    inactive: allUsers.filter((user) => !user.active).length,
    contractors: allUsers.filter((user) => user.role === 'CONTRACTOR').length,
  }), [allUsers]);

  const openPartnerDetail = (partner) => {
    setSelectedPartner(partner);
    setShowDetailModal(true);
  };

  const openPartnerDecision = (partner, type) => {
    setSelectedPartner(partner);
    setDecisionType(type);
    setDecisionReason('');
    setShowDecisionModal(true);
  };

  const submitPartnerDecision = async () => {
    if (!selectedPartner) return;

    try {
      const payload = decisionType === 'reject' ? { reason: decisionReason } : {};
      await api.post(`/admin/partners/${selectedPartner.id}/${decisionType}`, payload);
      toast.success(decisionType === 'approve' ? 'Đã duyệt nhà thầu' : 'Đã từ chối nhà thầu');
      setShowDecisionModal(false);
      fetchPartners();
      fetchUsers();
    } catch (error) {
      console.error('Error updating partner:', error);
      toast.error(error.response?.data?.message || 'Lỗi khi cập nhật trạng thái nhà thầu');
    }
  };

  const toggleUserActive = async (user) => {
    try {
      await api.patch(`/admin/users/${user.id}/active`, { active: !user.active });
      toast.success(user.active ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản');
      fetchUsers();
      fetchPartners();
    } catch (error) {
      console.error('Error toggling user active:', error);
      toast.error(error.response?.data?.message || 'Không thể cập nhật trạng thái tài khoản');
    }
  };

  const openPasswordModal = (user) => {
    setSelectedUser(user);
    setNewPassword('');
    setShowPasswordModal(true);
  };

  const submitResetPassword = async () => {
    if (!selectedUser) return;

    try {
      await api.patch(`/admin/users/${selectedUser.id}/password`, { newPassword });
      toast.success('Đã đặt lại mật khẩu');
      setShowPasswordModal(false);
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error(error.response?.data?.message || 'Không thể đặt lại mật khẩu');
    }
  };

  const getPartnerStatusLabel = (status) => {
    if (status === 'PENDING') return 'Chờ duyệt';
    if (status === 'APPROVED') return 'Đã duyệt';
    if (status === 'REJECTED') return 'Từ chối';
    return status || 'Không rõ';
  };

  const getPartnerStatusBadge = (status) => {
    if (status === 'PENDING') return 'bg-yellow-100 text-yellow-700';
    if (status === 'APPROVED') return 'bg-green-100 text-green-700';
    if (status === 'REJECTED') return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-700';
  };

  const getUserRoleBadge = (role) => {
    if (role === 'ADMIN') return 'bg-indigo-100 text-indigo-700';
    if (role === 'CONTRACTOR') return 'bg-blue-100 text-blue-700';
    if (role === 'CUSTOMER') return 'bg-gray-100 text-gray-700';
    return 'bg-gray-100 text-gray-700';
  };

  const getUserStatusLabel = (user) => {
    if (!user.active) return 'Đã khóa';
    if (user.approvalStatus === 'PENDING') return 'Chờ duyệt';
    if (user.approvalStatus === 'REJECTED') return 'Từ chối';
    return 'Hoạt động';
  };

  const getUserStatusBadge = (user) => {
    if (!user.active) return 'bg-red-100 text-red-700';
    if (user.approvalStatus === 'PENDING') return 'bg-yellow-100 text-yellow-700';
    if (user.approvalStatus === 'REJECTED') return 'bg-orange-100 text-orange-700';
    return 'bg-green-100 text-green-700';
  };

  const renderPartnerTab = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-end justify-between">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm nhà thầu theo tên hoặc email..."
            value={partnerSearchTerm}
            onChange={(e) => setPartnerSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {PARTNER_STATUS_BUTTONS.map((button) => (
          <button
            key={button.value}
            onClick={() => setPartnerStatusFilter(button.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              partnerStatusFilter === button.value
                ? 'bg-[#1a4f3a] text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {button.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Nhà thầu</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Thông tin đăng ký</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Trạng thái</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Vai trò</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loadingPartners ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    Đang tải...
                  </td>
                </tr>
              ) : filteredPartners.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    Không tìm thấy nhà thầu phù hợp
                  </td>
                </tr>
              ) : (
                filteredPartners.map((partner) => (
                  <tr key={partner.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{partner.fullName}</p>
                        <p className="text-sm text-gray-600">{partner.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="space-y-1">
                        <p>{partner.phoneNumber || '-'}</p>
                        <p className="text-gray-500">{partner.address || 'Chưa có địa chỉ'}</p>
                        <p className="text-xs text-gray-400">
                          Đăng ký: {partner.createdAt ? new Date(partner.createdAt).toLocaleDateString('vi-VN') : '-'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getPartnerStatusBadge(partner.approvalStatus)}`}>
                        {getPartnerStatusLabel(partner.approvalStatus)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getUserRoleBadge(partner.role)}`}>
                        {partner.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => openPartnerDetail(partner)}
                          className="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-medium transition flex items-center gap-1"
                        >
                          <Eye size={14} />
                          Chi tiết
                        </button>
                        {partner.approvalStatus !== 'APPROVED' && (
                          <button
                            onClick={() => openPartnerDecision(partner, 'approve')}
                            className="px-3 py-1 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 text-sm font-medium transition flex items-center gap-1"
                          >
                            <CheckCircle2 size={14} />
                            Duyệt
                          </button>
                        )}
                        {partner.approvalStatus !== 'REJECTED' && (
                          <button
                            onClick={() => openPartnerDecision(partner, 'reject')}
                            className="px-3 py-1 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 text-sm font-medium transition flex items-center gap-1"
                          >
                            <XCircle size={14} />
                            Từ chối
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatBox label="Tổng nhà thầu" value={partnerStats.total} tone="gray" icon={<Building2 size={18} />} />
        <StatBox label="Chờ duyệt" value={partnerStats.pending} tone="yellow" icon={<Filter size={18} />} />
        <StatBox label="Đã duyệt" value={partnerStats.approved} tone="green" icon={<CheckCircle2 size={18} />} />
        <StatBox label="Từ chối" value={partnerStats.rejected} tone="red" icon={<XCircle size={18} />} />
      </div>
    </div>
  );

  const renderUserTab = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-end justify-between">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm người dùng theo tên, email, SĐT..."
            value={userSearchTerm}
            onChange={(e) => setUserSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {USER_ROLE_BUTTONS.map((button) => (
            <button
              key={button.value}
              onClick={() => setUserRoleFilter(button.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                userRoleFilter === button.value
                  ? 'bg-[#1a4f3a] text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {button.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {USER_STATUS_BUTTONS.map((button) => (
            <button
              key={button.value}
              onClick={() => setUserStatusFilter(button.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                userStatusFilter === button.value
                  ? 'bg-[#1a4f3a] text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {button.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Người dùng</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Liên hệ</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Vai trò</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Trạng thái</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loadingUsers ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    Đang tải...
                  </td>
                </tr>
              ) : allUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    Không tìm thấy người dùng phù hợp
                  </td>
                </tr>
              ) : (
                allUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{user.fullName}</p>
                        <p className="text-sm text-gray-600">#{user.id}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="space-y-1">
                        <p>{user.email}</p>
                        <p>{user.phoneNumber || '-'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getUserRoleBadge(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getUserStatusBadge(user)}`}>
                        {getUserStatusLabel(user)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.role === 'ADMIN' ? (
                        <div className="inline-flex items-center px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-sm font-medium">
                          Tài khoản hệ thống, không chỉnh sửa
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => toggleUserActive(user)}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition flex items-center gap-1 ${
                              user.active
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {user.active ? <Lock size={14} /> : <Unlock size={14} />}
                            {user.active ? 'Khóa' : 'Mở khóa'}
                          </button>
                          <button
                            onClick={() => openPasswordModal(user)}
                            className="px-3 py-1 rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-200 text-sm font-medium transition flex items-center gap-1"
                          >
                            <KeyRound size={14} />
                            Reset mật khẩu
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatBox label="Tổng user" value={userStats.total} tone="gray" icon={<Users size={18} />} />
        <StatBox label="Đang hoạt động" value={userStats.active} tone="green" icon={<CheckCircle2 size={18} />} />
        <StatBox label="Đã khóa" value={userStats.inactive} tone="red" icon={<Lock size={18} />} />
        <StatBox label="Nhà thầu" value={userStats.contractors} tone="blue" icon={<Building2 size={18} />} />
      </div>
    </div>
  );

  return (
    <Layout title={isContractorView ? 'Duyệt nhà thầu' : 'Quản lý người dùng'}>
      <div className="space-y-6">
        {isContractorView ? renderPartnerTab() : renderUserTab()}

      {showDetailModal && selectedPartner && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Chi tiết hồ sơ nhà thầu</h2>
                <p className="text-sm text-gray-500 mt-1">Thông tin hiện có trong hệ thống đăng ký.</p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <DetailItem label="Họ tên" value={selectedPartner.fullName} />
              <DetailItem label="Email" value={selectedPartner.email} />
              <DetailItem label="Số điện thoại" value={selectedPartner.phoneNumber || '-'} />
              <DetailItem label="Địa chỉ" value={selectedPartner.address || '-'} />
              <DetailItem label="Vai trò" value={selectedPartner.role} />
              <DetailItem label="Trạng thái" value={getPartnerStatusLabel(selectedPartner.approvalStatus)} />
              <DetailItem
                label="Ngày đăng ký"
                value={selectedPartner.createdAt ? new Date(selectedPartner.createdAt).toLocaleString('vi-VN') : '-'}
              />
              <DetailItem
                label="Giấy phép / Portfolio"
                value="Chưa có dữ liệu lưu trữ trong hệ thống hiện tại"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {showDecisionModal && selectedPartner && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-900">
              {decisionType === 'approve' ? 'Duyệt nhà thầu' : 'Từ chối nhà thầu'}
            </h2>
            <p className="text-gray-600 text-sm">
              {decisionType === 'approve'
                ? `Bạn chắc chắn muốn duyệt nhà thầu ${selectedPartner.fullName}?`
                : `Bạn chắc chắn muốn từ chối nhà thầu ${selectedPartner.fullName}?`}
            </p>

            {decisionType === 'reject' && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Lý do từ chối</label>
                <textarea
                  rows={4}
                  value={decisionReason}
                  onChange={(e) => setDecisionReason(e.target.value)}
                  placeholder="Nhập lý do từ chối hồ sơ..."
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDecisionModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium transition"
              >
                Hủy
              </button>
              <button
                onClick={submitPartnerDecision}
                className={`px-4 py-2 rounded-lg text-white font-medium transition ${
                  decisionType === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {decisionType === 'approve' ? 'Duyệt' : 'Từ chối'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPasswordModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Đặt lại mật khẩu</h2>
            <p className="text-gray-600 text-sm">
              Người dùng: <span className="font-semibold">{selectedUser.fullName}</span>
            </p>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Mật khẩu mới</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới"
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium transition"
              >
                Hủy
              </button>
              <button
                onClick={submitResetPassword}
                className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-medium transition"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      </div>
    </Layout>
  );
};

const StatBox = ({ label, value, tone, icon }) => {
  const toneClasses = {
    gray: 'bg-white border-gray-100 text-gray-900',
    yellow: 'bg-yellow-50 border-yellow-100 text-yellow-800',
    green: 'bg-green-50 border-green-100 text-green-800',
    red: 'bg-red-50 border-red-100 text-red-800',
    blue: 'bg-blue-50 border-blue-100 text-blue-800',
  };

  return (
    <div className={`rounded-xl border p-4 shadow-sm ${toneClasses[tone] || toneClasses.gray}`}>
      <div className="flex items-center gap-2 text-sm font-medium opacity-80">
        {icon}
        {label}
      </div>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
};

const DetailItem = ({ label, value }) => (
  <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
    <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold">{label}</p>
    <p className="text-sm text-gray-900 mt-1">{value}</p>
  </div>
);

export default AdminUsersPage;
