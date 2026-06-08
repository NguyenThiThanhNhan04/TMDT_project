import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import useAuthStore from '../store/useAuthStore';
import {
  MapPin,
  Clock,
  Construction,
  DollarSign,
  ArrowLeft,
  Calendar,
  Tag,
  User as UserIcon,
  MessageSquare,
  Image as ImageIcon,
  FileText,
  CheckCircle2,
  XCircle,
  CircleDashed,
} from 'lucide-react';

const BID_STATUS = {
  PENDING: {
    label: 'Chờ duyệt',
    cls: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: <CircleDashed size={12} />,
  },
  ACCEPTED: {
    label: 'Được chọn',
    cls: 'bg-green-50 text-green-700 border-green-200',
    icon: <CheckCircle2 size={12} />,
  },
  REJECTED: {
    label: 'Không chọn',
    cls: 'bg-red-50 text-red-600 border-red-200',
    icon: <XCircle size={12} />,
  },
};

const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [project, setProject] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectingBidId, setSelectingBidId] = useState(null);

  useEffect(() => {
    fetchProjectDetail();
  }, [id]);

  const fetchProjectDetail = async () => {
    try {
      const response = await api.get(`/projects/v2/${id}`);
      const data = response.data.data;
      setProject(data.project);
      setBids(data.bids ?? []);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Lỗi khi tải thông tin dự án';
      toast.error(errorMsg);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'Thỏa thuận';
    return amount.toLocaleString('vi-VN') + 'đ';
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'OPEN':
        return <span className="badge badge-green">Đang tuyển nhà thầu</span>;
      case 'IN_PROGRESS':
        return <span className="badge badge-amber">Đang thi công</span>;
      case 'COMPLETED':
        return <span className="badge badge-blue">Hoàn thành</span>;
      case 'CANCELLED':
        return <span className="badge badge-gray">Đã huỷ</span>;
      default:
        return <span className="badge badge-gray">{status}</span>;
    }
  };

  const isOwner = useMemo(() => {
    if (!user || !project) return false;
    return user.email && project.ownerEmail && user.email === project.ownerEmail;
  }, [user, project]);

  const canSelectBid = isOwner && project?.status === 'OPEN';
  const canReceiveBids = project?.status === 'OPEN' && project?.approvalStatus === 'APPROVED';

  const handleSelectBid = async (bidId) => {
    if (!project) return;

    try {
      setSelectingBidId(bidId);
      await api.post(`/contracts/${project.id}/select-bid/${bidId}`);
      toast.success('Đã chọn nhà thầu thành công');
      await fetchProjectDetail();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể chọn nhà thầu');
    } finally {
      setSelectingBidId(null);
    }
  };

  if (loading) {
    return (
      <Layout title="Chi tiết dự án">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!project) return null;

  return (
    <Layout title={project.name || 'Chi tiết dự án'}>
      <div className="max-w-4xl mx-auto pb-20">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft size={18} /> Quay lại
        </button>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 bg-gradient-to-br from-gray-50 to-white border-b border-gray-100">
            <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  {getStatusBadge(project.status)}
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock size={14} /> Đăng ngày {new Date(project.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <h1 className="text-3xl font-bold font-display text-gray-900 mb-2">{project.name}</h1>
                <div className="flex items-center gap-2 text-gray-500">
                  <UserIcon size={16} />
                  <span className="text-sm font-medium">
                    Chủ dự án: {project.ownerName || 'Khách hàng'}
                  </span>
                </div>
              </div>

              {user?.role === 'CONTRACTOR' && canReceiveBids && (
                <button
                  onClick={() => navigate(`/projects/${id}/bid`)}
                  className="btn btn-primary py-3 px-8 flex items-center gap-2 shadow-lg shadow-primary/20"
                >
                  Gửi báo giá ngay <MessageSquare size={18} />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Ngân sách tối thiểu</p>
                <div className="flex items-center gap-1.5 text-primary">
                  <DollarSign size={16} />
                  <span className="font-bold">{formatCurrency(project.budgetMin)}</span>
                </div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Ngân sách tối đa</p>
                <div className="flex items-center gap-1.5 text-primary">
                  <DollarSign size={16} />
                  <span className="font-bold">{formatCurrency(project.budgetMax)}</span>
                </div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Diện tích</p>
                <div className="flex items-center gap-1.5 text-gray-700">
                  <Construction size={16} className="text-gray-400" />
                  <span className="font-bold">{project.area} m²</span>
                </div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Địa điểm</p>
                <div className="flex items-center gap-1.5 text-gray-700">
                  <MapPin size={16} className="text-gray-400" />
                  <span className="font-bold">{project.address || 'Toàn quốc'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="mb-10">
              <h2 className="text-lg font-bold font-display text-gray-900 mb-4 flex items-center gap-2">
                <Tag size={20} className="text-primary" /> Thông tin hạng mục
              </h2>
              <div className="inline-block px-4 py-2 bg-primary-bg text-primary rounded-xl font-bold text-sm">
                {project.category}
              </div>
            </div>

            {project.imageUrls && project.imageUrls.length > 0 && (
              <div className="mb-10">
                <h2 className="text-lg font-bold font-display text-gray-900 mb-4 flex items-center gap-2">
                  <ImageIcon size={20} className="text-primary" /> Hình ảnh đính kèm ({project.imageUrls.length})
                </h2>
                <div className="flex flex-wrap gap-4">
                  {project.imageUrls.map((url, idx) => (
                    <a key={idx} href={url} target="_blank" rel="noreferrer">
                      <img
                        src={url}
                        alt={`Attachment ${idx}`}
                        className="w-32 h-32 md:w-48 md:h-48 object-cover rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-primary transition-all cursor-pointer"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-10">
              <h2 className="text-lg font-bold font-display text-gray-900 mb-4 flex items-center gap-2">
                <Calendar size={20} className="text-primary" /> Mô tả dự án
              </h2>
              <div className="bg-gray-50 p-6 rounded-2xl text-gray-700 leading-relaxed whitespace-pre-wrap">
                {project.description || 'Không có mô tả chi tiết cho dự án này.'}
              </div>
            </div>

            <div className="mb-10">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h2 className="text-lg font-bold font-display text-gray-900 flex items-center gap-2">
                  <FileText size={20} className="text-primary" /> Danh sách báo giá ({bids.length})
                </h2>
                                {canSelectBid && (
                                  <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                                    Chọn 1 nhà thầu để chuyển dự án sang đang thi công
                                  </span>
                                )}
              </div>

              {bids.length === 0 ? (
                <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-6 text-sm text-gray-500">
                  Chưa có nhà thầu nào báo giá cho dự án này.
                </div>
              ) : (
                <div className="space-y-4">
                  {bids.map((bid) => {
                    const bidStatus = BID_STATUS[bid.status] || {
                      label: bid.status,
                      cls: 'bg-gray-50 text-gray-600 border-gray-200',
                      icon: null,
                    };

                    return (
                      <div
                        key={bid.id}
                        className={`rounded-2xl border p-5 shadow-sm ${
                          bid.status === 'ACCEPTED'
                            ? 'border-green-200 bg-green-50/40'
                            : 'border-gray-100 bg-white'
                        }`}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <p className="font-bold text-gray-900">{bid.contractorName}</p>
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${bidStatus.cls}`}>
                                {bidStatus.icon}
                                {bidStatus.label}
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
                              {bid.contractorPhone && <span>Điện thoại: {bid.contractorPhone}</span>}
                              {bid.contractorEmail && <span>Email: {bid.contractorEmail}</span>}
                              <span>Thời gian: {bid.estimatedDays} ngày</span>
                            </div>

                            {bid.message && (
                              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                                💬 {bid.message}
                              </p>
                            )}

                            {bid.details?.length > 0 && (
                              <div className="mt-3 bg-gray-50 rounded-xl p-4">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                  Hạng mục báo giá
                                </p>
                                <div className="space-y-2">
                                  {bid.details.map((detail) => (
                                    <div
                                      key={detail.id}
                                      className="flex flex-wrap items-center justify-between gap-2 text-sm border-b border-gray-100 pb-2 last:border-b-0 last:pb-0"
                                    >
                                      <div className="min-w-0">
                                        <p className="font-medium text-gray-800">{detail.itemName}</p>
                                        <p className="text-xs text-gray-500">
                                          {detail.quantity} {detail.unit} · {formatCurrency(detail.unitPrice)} / đơn vị
                                        </p>
                                      </div>
                                      <p className="font-semibold text-[#1a4f3a]">
                                        {formatCurrency(detail.totalPrice)}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="lg:text-right shrink-0">
                            <p className="text-xs text-gray-400 uppercase tracking-wide">Tổng báo giá</p>
                            <p className="font-bold text-[#1a4f3a] text-xl">
                              {formatCurrency(bid.totalPrice)}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              Gửi ngày {new Date(bid.createdAt).toLocaleDateString('vi-VN')}
                            </p>

                            {canSelectBid && bid.status === 'PENDING' && (
                              <button
                                onClick={() => handleSelectBid(bid.id)}
                                disabled={selectingBidId === bid.id}
                                className="mt-4 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#1a4f3a] text-white text-sm font-semibold hover:bg-[#143d2d] transition disabled:opacity-60 disabled:cursor-not-allowed"
                              >
                                {selectingBidId === bid.id ? 'Đang chọn...' : 'Chọn nhà thầu'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProjectDetailPage;
