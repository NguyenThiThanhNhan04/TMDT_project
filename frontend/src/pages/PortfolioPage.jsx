import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import useAuthStore from '../store/useAuthStore';
import {
    Star, MapPin, Calendar, CheckCircle2, Loader2,
    ImageIcon, ChevronLeft, ChevronRight, Wallet,
    Tag, User, Phone,
} from 'lucide-react';

const fmt = (v) => (v ? v.toLocaleString('vi-VN') + 'đ' : '—');

// ─── Mini image carousel ───────────────────────────────────
const MiniCarousel = ({ images }) => {
    const [idx, setIdx] = useState(0);
    if (!images?.length) return (
        <div className="w-full h-48 bg-gray-100 rounded-t-2xl flex items-center justify-center">
            <ImageIcon size={32} className="text-gray-300" />
        </div>
    );
    return (
        <div className="relative w-full h-48 bg-gray-100 rounded-t-2xl overflow-hidden group">
            <img src={images[idx]} alt="project" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            {images.length > 1 && (
                <>
                    <button
                        onClick={(e) => { e.stopPropagation(); setIdx(i => (i - 1 + images.length) % images.length); }}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition hover:bg-black/60"
                    >
                        <ChevronLeft size={14} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); setIdx(i => (i + 1) % images.length); }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition hover:bg-black/60"
                    >
                        <ChevronRight size={14} />
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                        {images.map((_, i) => (
                            <button key={i} onClick={(e) => { e.stopPropagation(); setIdx(i); }}
                                className={`w-1.5 h-1.5 rounded-full transition-all ${i === idx ? 'bg-white w-3' : 'bg-white/50'}`}
                            />
                        ))}
                    </div>
                    <span className="absolute top-2 right-2 bg-black/40 text-white text-[9px] px-1.5 py-0.5 rounded-full">
                        {idx + 1}/{images.length}
                    </span>
                </>
            )}
            {/* Completed badge */}
            <div className="absolute top-2 left-2">
                <span className="inline-flex items-center gap-1 bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full font-semibold shadow-sm">
                    <CheckCircle2 size={10} /> Hoàn thành
                </span>
            </div>
        </div>
    );
};

const PortfolioPage = () => {
    const { user } = useAuthStore();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchCompleted(); }, []);

    const fetchCompleted = async () => {
        try {
            const res = await api.get('/contracts/jobs/completed');
            setJobs(res.data.data || []);
        } catch { /* handled */ } finally {
            setLoading(false);
        }
    };

    const totalRevenue = jobs.reduce((s, j) => s + (j.agreedPrice || 0), 0);

    return (
        <Layout title="Hồ sơ năng lực">
            <div className="max-w-6xl mx-auto space-y-6 pb-8">

                {/* CONTRACTOR PROFILE CARD */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
                        {/* Avatar */}
                        <div className="w-20 h-20 rounded-2xl bg-[#1a4f3a] flex items-center justify-center text-3xl text-white font-bold shadow-lg shrink-0">
                            {user?.fullName?.charAt(0)?.toUpperCase() || 'C'}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <h2 className="text-xl font-bold text-gray-900">{user?.fullName || 'Nhà thầu'}</h2>
                            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
                                {user?.address && (
                                    <span className="flex items-center gap-1">
                                        <MapPin size={14} className="text-gray-400" /> {user.address}
                                    </span>
                                )}
                                {user?.phoneNumber && (
                                    <span className="flex items-center gap-1">
                                        <Phone size={14} className="text-gray-400" /> {user.phoneNumber}
                                    </span>
                                )}
                                {user?.email && (
                                    <span className="flex items-center gap-1">
                                        <User size={14} className="text-gray-400" /> {user.email}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="flex gap-4 shrink-0">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-[#1a4f3a]">{jobs.length}</p>
                                <p className="text-xs text-gray-400">Dự án</p>
                            </div>
                            <div className="text-center border-l border-gray-100 pl-4">
                                <p className="text-2xl font-bold text-gray-800">{fmt(totalRevenue)}</p>
                                <p className="text-xs text-gray-400">Doanh thu</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SUMMARY STATS */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                        { icon: <CheckCircle2 size={16} className="text-emerald-500" />, label: 'Hoàn thành', value: jobs.length },
                        { icon: <Wallet size={16} className="text-[#1a4f3a]" />, label: 'Tổng doanh thu', value: fmt(totalRevenue) },
                        {
                            icon: <Star size={16} className="text-amber-400" />, label: 'Trung bình / dự án',
                            value: jobs.length > 0 ? fmt(Math.round(totalRevenue / jobs.length)) : '—'
                        },
                        {
                            icon: <Tag size={16} className="text-blue-400" />, label: 'Danh mục',
                            value: [...new Set(jobs.map(j => j.category).filter(Boolean))].length || '—'
                        },
                    ].map(s => (
                        <div key={s.label} className="bg-white border rounded-2xl p-4 shadow-sm">
                            <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">{s.icon} {s.label}</div>
                            <p className="text-xl font-bold text-gray-800">{s.value}</p>
                        </div>
                    ))}
                </div>

                {/* PORTFOLIO GRID */}
                <div>
                    <h3 className="font-bold text-base text-gray-800 mb-4">
                        Các công trình đã thực hiện
                    </h3>

                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <Loader2 size={28} className="animate-spin text-[#1a4f3a]" />
                        </div>
                    ) : jobs.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center text-sm text-gray-400">
                            <CheckCircle2 size={36} className="mx-auto mb-3 opacity-30" />
                            <p>Chưa có công trình hoàn thành nào.</p>
                            <p className="text-xs mt-1">Các dự án hoàn tất sẽ hiển thị tại đây.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {jobs.map((job) => (
                                <div
                                    key={job.jobId}
                                    className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden"
                                >
                                    {/* Image */}
                                    <MiniCarousel images={job.imageUrls} />

                                    {/* Info */}
                                    <div className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            {job.category && (
                                                <span className="text-[10px] font-bold text-[#1a4f3a] uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-md">
                                                    {job.category}
                                                </span>
                                            )}
                                            <span className="text-[10px] text-gray-400 flex items-center gap-1 ml-auto">
                                                <Calendar size={11} />
                                                {job.startedAt
                                                    ? new Date(job.startedAt).getFullYear()
                                                    : new Date(job.createdAt).getFullYear()}
                                            </span>
                                        </div>

                                        <h3 className="font-bold text-sm text-gray-800 mb-1 line-clamp-1">
                                            {job.projectName}
                                        </h3>

                                        {job.address && (
                                            <p className="text-xs text-gray-400 flex items-center gap-1 mb-2 truncate">
                                                <MapPin size={11} className="shrink-0" /> {job.address}
                                            </p>
                                        )}

                                        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                                            <div>
                                                <p className="text-[10px] text-gray-400">Giá trị</p>
                                                <p className="text-sm font-bold text-[#1a4f3a]">{fmt(job.agreedPrice)}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] text-gray-400">Khách hàng</p>
                                                <p className="text-xs font-medium text-gray-600">{job.customerName}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default PortfolioPage;
