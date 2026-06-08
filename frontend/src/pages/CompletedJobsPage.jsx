import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import {
    CheckCircle2, CalendarDays, MapPin, Eye, User, Phone,
    ImageIcon, ChevronLeft, ChevronRight, Images,
} from 'lucide-react';

const fmt = (v) => (v ? v.toLocaleString('vi-VN') + 'đ' : '—');

// ─── Mini image gallery ────────────────────────────────────
const MiniGallery = ({ images }) => {
    const [idx, setIdx] = useState(0);
    if (!images?.length) return (
        <div className="w-full h-44 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
            <ImageIcon size={28} className="text-gray-300" />
        </div>
    );
    return (
        <div className="relative rounded-xl overflow-hidden mb-4">
            <img src={images[idx]} alt="project" className="w-full h-44 object-cover" />
            {images.length > 1 && (
                <>
                    <button
                        onClick={(e) => { e.stopPropagation(); setIdx(i => (i - 1 + images.length) % images.length); }}
                        className="absolute left-1.5 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-1 hover:bg-black/60"
                    >
                        <ChevronLeft size={14} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); setIdx(i => (i + 1) % images.length); }}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-1 hover:bg-black/60"
                    >
                        <ChevronRight size={14} />
                    </button>
                    <span className="absolute top-2 right-2 bg-black/40 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Images size={10} /> {idx + 1}/{images.length}
                    </span>
                </>
            )}
        </div>
    );
};

const CompletedJobsPage = () => {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchCompletedJobs(); }, []);

    const fetchCompletedJobs = async () => {
        try {
            const res = await api.get('/contracts/jobs/completed');
            setJobs(res.data.data || []);
        } catch { /* handled by interceptor */ } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Layout title="Công việc đã hoàn thành">
                <div className="h-64 flex items-center justify-center text-sm text-gray-400">Đang tải...</div>
            </Layout>
        );
    }

    const totalRevenue = jobs.reduce((s, j) => s + (j.agreedPrice || 0), 0);

    return (
        <Layout title="Công việc đã hoàn thành">
            <div className="max-w-5xl mx-auto space-y-5 pb-8">

                {/* STATS */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="bg-white border rounded-2xl p-4 shadow-sm">
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Tổng công việc</p>
                        <p className="text-2xl font-bold text-[#1a4f3a]">{jobs.length}</p>
                    </div>
                    <div className="bg-white border rounded-2xl p-4 shadow-sm">
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Tổng doanh thu</p>
                        <p className="text-2xl font-bold text-gray-800">{fmt(totalRevenue)}</p>
                    </div>
                    <div className="bg-white border rounded-2xl p-4 shadow-sm col-span-2 lg:col-span-1">
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Trung bình / công việc</p>
                        <p className="text-2xl font-bold text-gray-800">
                            {jobs.length > 0 ? fmt(Math.round(totalRevenue / jobs.length)) : '—'}
                        </p>
                    </div>
                </div>

                {/* LIST */}
                <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
                    <div className="p-5 border-b flex items-center gap-2">
                        <CheckCircle2 size={18} className="text-green-600" />
                        <div>
                            <h2 className="font-bold text-base">Lịch sử công việc hoàn thành</h2>
                            <p className="text-xs text-gray-400">Tất cả dự án đã hoàn tất và được nghiệm thu</p>
                        </div>
                    </div>

                    {jobs.length === 0 ? (
                        <div className="p-16 text-center text-gray-400 text-sm">
                            <CheckCircle2 size={40} className="mx-auto mb-3 opacity-30" />
                            Chưa có công việc nào hoàn thành
                        </div>
                    ) : (
                        <div className="divide-y">
                            {jobs.map((job) => (
                                <div key={job.jobId} className="p-5 hover:bg-gray-50 transition">

                                    {/* Gallery */}
                                    {job.imageUrls?.length > 0 && (
                                        <MiniGallery images={job.imageUrls} />
                                    )}

                                    {/* Header row */}
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-green-50 text-green-700 border-green-200">
                                                    <CheckCircle2 size={11} /> Hoàn thành
                                                </span>
                                                {job.category && (
                                                    <span className="text-xs text-gray-400">{job.category}</span>
                                                )}
                                            </div>
                                            <h3 className="font-bold text-base text-gray-800">{job.projectName}</h3>
                                        </div>
                                        <span className="text-xs text-gray-400 shrink-0 flex items-center gap-1">
                                            <CalendarDays size={12} />
                                            {job.startedAt
                                                ? new Date(job.startedAt).toLocaleDateString('vi-VN')
                                                : new Date(job.createdAt).toLocaleDateString('vi-VN')}
                                        </span>
                                    </div>

                                    {/* Info grid */}
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm mb-4">
                                        <div>
                                            <p className="text-xs text-gray-400">Khách hàng</p>
                                            <p className="font-medium flex items-center gap-1">
                                                <User size={12} className="text-gray-400" /> {job.customerName}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400">Liên hệ</p>
                                            <p className="font-medium flex items-center gap-1">
                                                <Phone size={12} className="text-gray-400" /> {job.customerPhone || '—'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400">Địa chỉ</p>
                                            <p className="font-medium flex items-center gap-1 truncate">
                                                <MapPin size={12} className="text-gray-400 shrink-0" />
                                                <span className="truncate">{job.address || '—'}</span>
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400">Giá trị</p>
                                            <p className="font-bold text-[#1a4f3a]">{fmt(job.agreedPrice)}</p>
                                        </div>
                                    </div>

                                    {job.description && (
                                        <p className="text-xs text-gray-500 line-clamp-2 mb-3">{job.description}</p>
                                    )}

                                    <button
                                        onClick={() => navigate(`/production-log/${job.jobId}`)}
                                        className="px-4 py-2 text-xs border rounded-xl flex items-center gap-1.5 hover:bg-gray-100 transition w-fit font-medium"
                                    >
                                        <Eye size={13} /> Xem chi tiết nhật ký
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default CompletedJobsPage;
