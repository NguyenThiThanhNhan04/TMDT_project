import React, { useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout';
import {
  Search,
  Eye,
  Calendar,
  DollarSign,
  MapPin,
  User,
  Clock,
  Activity,
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

const MONITOR_FILTERS = [
  { value: 'OPEN', label: 'Đang mở' },
  { value: 'IN_PROGRESS', label: 'Đang thi công' },
  { value: 'COMPLETED', label: 'Hoàn thành' },
  { value: 'CANCELLED', label: 'Đã huỷ' },
  { value: 'all', label: 'Tất cả' },
];

const AdminProjectMonitorPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchProjects();
  }, [statusFilter]);

  const fetchProjects = async () => {
    setLoading(true);

    try {
      const response = await api.get('/admin/projects', {
        params: {
          view: 'monitor',
          status: statusFilter,
        },
      });

      setProjects(response.data.data || []);
    } catch (error) {
      console.error('Error fetching monitored projects:', error);
      toast.error(error.response?.data?.message || 'Không thể tải danh sách dự án');
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = useMemo(() => {
    if (!searchTerm.trim()) return projects;

    const term = searchTerm.trim().toLowerCase();
    return projects.filter((project) =>
      [
        project.name,
        project.customerName,
        project.customerEmail,
        project.address,
        project.category,
        `${project.id}`,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term))
    );
  }, [projects, searchTerm]);

  const summary = useMemo(() => ({
    OPEN: projects.filter((p) => p.status === 'OPEN').length,
    IN_PROGRESS: projects.filter((p) => p.status === 'IN_PROGRESS').length,
    COMPLETED: projects.filter((p) => p.status === 'COMPLETED').length,
    CANCELLED: projects.filter((p) => p.status === 'CANCELLED').length,
  }), [projects]);

  const formatCurrency = (amount) => {
    if (!amount) return 'Thỏa thuận';
    return amount.toLocaleString('vi-VN') + 'đ';
  };

  const getProjectStatusLabel = (status) => {
    if (status === 'OPEN') return 'Đang mở';
    if (status === 'IN_PROGRESS') return 'Đang thi công';
    if (status === 'COMPLETED') return 'Hoàn thành';
    if (status === 'CANCELLED') return 'Đã huỷ';
    return status || 'Không rõ';
  };

  const getProjectStatusBadge = (status) => {
    if (status === 'OPEN') return 'bg-blue-100 text-blue-700';
    if (status === 'IN_PROGRESS') return 'bg-amber-100 text-amber-700';
    if (status === 'COMPLETED') return 'bg-green-100 text-green-700';
    if (status === 'CANCELLED') return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-700';
  };

  const getApprovalBadge = (status) => {
    if (status === 'PENDING') return 'bg-yellow-100 text-yellow-700';
    if (status === 'APPROVED') return 'bg-green-100 text-green-700';
    if (status === 'REJECTED') return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <Layout title="Giám sát dự án">
        <div className="text-center py-12">Đang tải...</div>
      </Layout>
    );
  }

  return (
    <Layout title="Giám sát dự án">
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-400 font-bold">
                Admin Console
              </p>
              <h1 className="text-2xl font-bold text-gray-900 mt-1">Giám sát dự án</h1>
              <p className="text-sm text-gray-500 mt-1">
                Theo dõi toàn bộ dự án đang mở, thi công, hoàn thành hoặc đã huỷ.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatBox label="Đang mở" value={summary.OPEN} tone="blue" />
          <StatBox label="Đang thi công" value={summary.IN_PROGRESS} tone="yellow" />
          <StatBox label="Hoàn thành" value={summary.COMPLETED} tone="green" />
          <StatBox label="Đã huỷ" value={summary.CANCELLED} tone="red" />
        </div>

        <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-end justify-between">
          <div className="relative w-full xl:w-96">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm theo tên dự án, khách hàng, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {MONITOR_FILTERS.map((item) => (
              <button
                key={item.value}
                onClick={() => setStatusFilter(item.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  statusFilter === item.value
                    ? 'bg-[#1a4f3a] text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filteredProjects.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-gray-200 p-10 text-center">
              <p className="text-gray-500">Không tìm thấy dự án phù hợp</p>
            </div>
          ) : (
            filteredProjects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition"
              >
                <div className="flex flex-col 2xl:flex-row 2xl:items-center 2xl:justify-between gap-5">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <h3 className="text-lg font-bold text-gray-900">
                        #{project.id} · {project.name}
                      </h3>

                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getProjectStatusBadge(project.status)}`}>
                        {getProjectStatusLabel(project.status)}
                      </span>

                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getApprovalBadge(project.approvalStatus)}`}>
                        {project.approvalStatus || 'UNKNOWN'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                      <p className="flex items-center gap-2">
                        <User size={16} />
                        {project.customerName || 'Không rõ khách hàng'} · {project.customerEmail || '-'}
                      </p>

                      <p className="flex items-center gap-2">
                        <MapPin size={16} />
                        {project.address || 'Chưa có địa chỉ'}
                      </p>

                      <p className="flex items-center gap-2">
                        <DollarSign size={16} />
                        Ngân sách: {formatCurrency(project.budgetMin)} - {formatCurrency(project.budgetMax)}
                      </p>

                      <p className="flex items-center gap-2">
                        <Calendar size={16} />
                        Tạo ngày: {project.createdAt ? new Date(project.createdAt).toLocaleDateString('vi-VN') : '-'}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                      {project.category && <span className="badge badge-blue">{project.category}</span>}
                      {project.style && <span className="badge badge-gray">{project.style}</span>}
                      {project.area && <span className="badge badge-amber">{project.area}m²</span>}
                      <span className="badge badge-gray">
                        {project.bidType === 'NEGOTIABLE' ? 'Đấu thầu đóng' : 'Đấu thầu mở'}
                      </span>
                      {typeof project.imageCount === 'number' && (
                        <span className="badge badge-gray">
                          {project.imageCount} ảnh
                        </span>
                      )}
                    </div>

                    {project.description && (
                      <p className="text-sm text-gray-700 mt-3 line-clamp-2">
                        {project.description}
                      </p>
                    )}

                    {project.adminNote && (
                      <p className="text-sm text-gray-500 mt-3 flex items-center gap-2">
                        <Clock size={14} />
                        Ghi chú admin: {project.adminNote}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3 2xl:justify-end">
                    <Link
                      to={`/projects/${project.id}`}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 font-medium transition"
                    >
                      <Eye size={18} />
                      Xem
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

const StatBox = ({ label, value, tone }) => {
  const toneClasses = {
    gray: 'bg-white border-gray-100 text-gray-900',
    yellow: 'bg-yellow-50 border-yellow-100 text-yellow-800',
    green: 'bg-green-50 border-green-100 text-green-800',
    red: 'bg-red-50 border-red-100 text-red-800',
    blue: 'bg-blue-50 border-blue-100 text-blue-800',
  };

  return (
    <div className={`rounded-xl border p-4 shadow-sm ${toneClasses[tone] || toneClasses.gray}`}>
      <div className="text-sm font-medium opacity-80">{label}</div>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
};

export default AdminProjectMonitorPage;
