import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import {
    Search, MapPin, Clock, ArrowUpRight, Filter,
    DollarSign, Briefcase, Loader2, ImageIcon, Images,
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const ProjectMarketplacePage = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState('');

    useEffect(() => { fetchOpenProjects(); }, []);

    const fetchOpenProjects = async () => {
        try {
            setLoading(true);
            const res = await api.get('/projects/open');
            setProjects(res.data.data || []);
        } catch {
            toast.error('Không thể tải danh sách dự án');
        } finally {
            setLoading(false);
        }
    };

    const formatMoney = (v) => (v ? `${v.toLocaleString('vi-VN')}đ` : 'Thỏa thuận');

    const filtered = projects.filter((p) =>
        p.name?.toLowerCase().includes(keyword.toLowerCase())
    );

    return (
        <Layout title="Sàn dự án">
            <div className="max-w-6xl mx-auto space-y-5 pb-8">

                {/* SEARCH BAR */}
                <div className="flex flex-col sm:flex-row gap-2.5 items-center sticky top-0 z-10 bg-gray-50/90 backdrop-blur-md pb-4 pt-1 border-b border-gray-200/60">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3.5 top-3 text-gray-400" size={16} />
                        <input
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            placeholder="Tìm tên dự án, hạng mục nội thất, xây dựng..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-[#1a4f3a]/20 focus:border-[#1a4f3a] outline-none text-sm transition-all"
                        />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto shrink-0">
                        <button className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center gap-1.5 text-xs font-medium text-gray-600 transition-colors">
                            <Filter size={14} /> Lọc
                        </button>
                        <button className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-[#1a4f3a] text-white text-xs font-semibold hover:bg-[#145c42] shadow-sm transition-colors">
                            Tìm kiếm
                        </button>
                    </div>
                </div>

                {/* CONTENT */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="p-4 border border-gray-100 rounded-2xl animate-pulse bg-white space-y-3">
                                <div className="h-40 bg-gray-100 rounded-xl" />
                                <div className="h-4 bg-gray-100 w-3/4 rounded" />
                                <div className="h-4 bg-gray-100 w-full rounded" />
                                <div className="h-4 bg-gray-100 w-1/2 rounded" />
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200 shadow-sm max-w-xl mx-auto">
                        <Briefcase size={36} className="mx-auto text-gray-300 mb-3" />
                        <h3 className="font-bold text-sm text-gray-800">Không tìm thấy dự án phù hợp</h3>
                        <p className="text-gray-400 text-xs mt-1">Thử lại với từ khóa khác.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filtered.map((p) => {
                            const coverImage = p.imageUrls?.[0];
                            const extraImages = (p.imageUrls?.length ?? 0) - 1;

                            return (
                                <div
                                    key={p.id}
                                    onClick={() => navigate(`/projects-constructor/${p.id}`)}
                                    className="group bg-white border border-gray-100 rounded-2xl hover:shadow-md hover:border-gray-200 transition-all cursor-pointer flex flex-col overflow-hidden"
                                >
                                    {/* PROJECT IMAGE */}
                                    <div className="relative h-44 bg-gray-100 shrink-0">
                                        {coverImage ? (
                                            <img
                                                src={coverImage}
                                                alt={p.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <ImageIcon size={32} className="text-gray-300" />
                                            </div>
                                        )}

                                        {/* Category badge over image */}
                                        <div className="absolute top-3 left-3">
                                            <span className="text-[10px] px-2.5 py-0.5 rounded-md bg-white/90 text-[#1a4f3a] font-bold uppercase tracking-wider shadow-sm">
                                                {p.category || 'Chưa phân loại'}
                                            </span>
                                        </div>

                                        {/* Extra images count */}
                                        {extraImages > 0 && (
                                            <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full">
                                                <Images size={10} /> +{extraImages}
                                            </div>
                                        )}
                                    </div>

                                    {/* CARD CONTENT */}
                                    <div className="p-4 flex flex-col flex-1">
                                        <div className="flex justify-between items-center mb-1.5">
                                            <span className="text-[11px] text-gray-400 flex items-center gap-1">
                                                <Clock size={12} />
                                                {p.createdAt ? new Date(p.createdAt).toLocaleDateString('vi-VN') : 'Mới đăng'}
                                            </span>
                                        </div>

                                        {/* TITLE */}
                                        <h2 className="font-bold text-sm text-gray-800 group-hover:text-[#1a4f3a] transition-colors line-clamp-1 leading-snug mb-1">
                                            {p.name}
                                        </h2>

                                        {/* DESCRIPTION */}
                                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3 min-h-[32px]">
                                            {p.description || 'Chưa có mô tả.'}
                                        </p>

                                        {/* METADATA */}
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-gray-500 pb-3 border-b border-gray-50">
                                            {p.address && (
                                                <span className="flex items-center gap-1">
                                                    <MapPin size={12} className="text-gray-400 shrink-0" />
                                                    <span className="max-w-[140px] truncate">{p.address}</span>
                                                </span>
                                            )}
                                            <span className="flex items-center gap-0.5 font-bold text-[#1a4f3a] bg-emerald-50/60 px-2 py-0.5 rounded-md">
                                                <DollarSign size={12} className="shrink-0" />
                                                {p.budgetMin || p.budgetMax
                                                    ? `${formatMoney(p.budgetMin)} – ${formatMoney(p.budgetMax)}`
                                                    : 'Thỏa thuận'}
                                            </span>
                                        </div>

                                        {/* FOOTER */}
                                        <div className="mt-3 flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center font-bold text-xs text-gray-600 border border-white shadow-sm">
                                                    {p.user?.fullName?.charAt(0) || 'U'}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold text-gray-700 line-clamp-1 max-w-[110px]">
                                                        {p.user?.fullName || 'Ẩn danh'}
                                                    </p>
                                                    <p className="text-[10px] text-gray-400">Chủ dự án</p>
                                                </div>
                                            </div>
                                            <button className="inline-flex items-center gap-0.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#1a4f3a] bg-emerald-50/60 group-hover:bg-[#1a4f3a] group-hover:text-white transition-all">
                                                Xem & Báo giá
                                                <ArrowUpRight size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default ProjectMarketplacePage;
