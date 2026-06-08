import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import {
    History, CalendarDays, MapPin, ArrowRight, FileText,
    CheckCircle2, Clock, XCircle, ImageIcon,
    ChevronLeft, ChevronRight, Images,
} from 'lucide-react';

const STATUS_CONFIG = {
    PENDING:  { label: 'Chờ duyệt',       color: 'bg-amber-50 text-amber-700 border-amber-200',  icon: <Clock size={12} /> },
    ACCEPTED: { label: 'Được chọn',        color: 'bg-green-50 text-green-700 border-green-200',  icon: <CheckCircle2 size={12} /> },
    REJECTED: { label: 'Không được chọn',  color: 'bg-red-50 text-red-600 border-red-200',        icon: <XCircle size={12} /> },
};

const StatusBadge = ({ status }) => {
    const cfg = STATUS_CONFIG[status] ?? { label: status, color: 'bg-gray-50 text-gray-600 border-gray-200', icon: null };
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.color}`}>
            {cfg.icon}{cfg.label}
        </span>
    );
};

const fmt = (v) => (v ? v.toLocaleString('vi-VN') + 'đ' : '—');

// ─── Project image carousel ────────────────────────────────
const ProjectImageCarousel = ({ images }) => {
    const [idx, setIdx] = useState(0);
    if (!images?.length) return (
        <div className="w-full lg:w-40 h-28 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
            <ImageIcon size={24} className="text-gray-300" />
        </div>
    );
    return (
        <div className="relative w-full lg:w-40 h-28 rounded-xl overflow-hidden shrink-0 bg-gray-100">
            <img src={images[idx]} alt="project" className="w-full h-full object-cover" />
            {images.length > 1 && (
                <>
                    <button
                        onClick={(e) => { e.stopPropagation(); setIdx(i => (i - 1 + images.length) % images.length); }}
                        className="absolute left-1 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-0.5 hover:bg-black/60"
                    >
                        <ChevronLeft size={12} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); setIdx(i => (i + 1) % images.length); }}
                        className="absolute right-1 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-0.5 hover:bg-black/60"
                    >
                        <ChevronRight size={12} />
                    </button>
                    <span className="absolute top-1.5 right-1.5 bg-black/40 text-white text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        <Images size={9} />{idx + 1}/{images.length}
                    </span>
                </>
            )}
        </div>
    );
};

const MyBidsPage = () => {
    const navigate = useNavigate();
    const [bids, setBids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => { fetchBids(); }, []);

    const fetchBids = async () => {
        try {
            const res = await api.get('/bids/my-with-projects');
            setBids(res.data.data || []);
        } catch { /* interceptor handles */ } finally {
            setLoading(false);
        }
    };

    const filtered = filter === 'ALL' ? bids : bids.filter(b => b.bidStatus === filter);

    const count = (s) => bids.filter(b => b.bidStatus === s).length;

    const tabs = [
        { key: 'ALL',      label: `Tất cả (${bids.length})` },
        { key: 'PENDING',  label: `Chờ duyệt (${count('PENDING')})` },
        { key: 'ACCEPTED', label: `Được chọn (${count('ACCEPTED')})` },
        { key: 'REJECTED', label: `Không chọn (${count('REJECTED')})` },
    ];

    if (loading) {
        return (
            <Layout title="Đấu thầu của tôi">
                <div className="h-64 flex items-center justify-center text-sm text-gray-400">Đang tải...</div>
            </Layout>
        );
    }

    return (
        <Layout title="Đấu thầu của tôi">
            <div className="max-w-5xl mx-auto space-y-4 pb-8">

                {/* STATS */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                        { label: 'Tổng báo giá', value: bids.length, color: 'text-gray-800' },
                        { label: 'Chờ duyệt',    value: count('PENDING'),  color: 'text-amber-600' },
                        { label: 'Được chọn',    value: count('ACCEPTED'), color: 'text-green-600' },
                        {
                            label: 'Tỉ lệ thắng',
                            value: bids.length > 0
                                ? Math.round(count('ACCEPTED') / bids.length * 100) + '%'
                                : '—',
                            color: 'text-[#1a4f3a]',
                        },
                    ].map(s => (
                        <div key={s.label} className="bg-white border rounded-2xl p-4 shadow-sm">
                            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{s.label}</p>
                            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                        </div>
                    ))}
                </div>

                {/* TABS + LIST */}
                <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
                    <div className="flex border-b overflow-x-auto">
                        {tabs.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setFilter(tab.key)}
                                className={`px-5 py-3 text-sm whitespace-nowrap transition font-medium ${
                                    filter === tab.key
                                        ? 'border-b-2 border-[#1a4f3a] text-[#1a4f3a]'
                                        : 'text-gray-400 hover:text-gray-700'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {filtered.length === 0 ? (
                        <div className="p-16 text-center text-gray-400 text-sm">
                            <History size={40} className="mx-auto mb-3 opacity-30" />
                            Chưa có báo giá nào
                        </div>
                    ) : (
                        <div className="divide-y">
                            {filtered.map(bid => (
                                <div key={bid.bidId} className="p-5 hover:bg-gray-50 transition">
                                    <div className="flex flex-col lg:flex-row lg:items-start gap-4">

                                        {/* PROJECT IMAGES */}
                                        <ProjectImageCarousel images={bid.imageUrls} />

                                        {/* CONTENT */}
                                        <div className="flex-1 min-w-0">
                                            {/* Title + status */}
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <div className="min-w-0">
                                                    <h3 className="font-bold text-base truncate">{bid.projectName}</h3>
                                                    <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-500">
                                                        {bid.address && (
                                                            <span className="flex items-center gap-1">
                                                                <MapPin size={11} /> {bid.address}
                                                            </span>
                                                        )}
                                                        {bid.category && <span>{bid.category}</span>}
                                                        {bid.area && <span>{bid.area} m²</span>}
                                                    </div>
                                                </div>
                                                <StatusBadge status={bid.bidStatus} />
                                            </div>

                                            {/* Details grid */}
                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm mb-3">
                                                <div>
                                                    <p className="text-xs text-gray-400">Báo giá của tôi</p>
                                                    <p className="font-bold text-[#1a4f3a]">{fmt(bid.totalPrice)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-400">Ngân sách KH</p>
                                                    <p className="font-medium text-gray-700">{fmt(bid.budgetMin)} – {fmt(bid.budgetMax)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-400">Số ngày</p>
                                                    <p className="font-medium">{bid.estimatedDays} ngày</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-400">Ngày gửi</p>
                                                    <p className="font-medium flex items-center gap-1">
                                                        <CalendarDays size={12} />
                                                        {new Date(bid.bidCreatedAt).toLocaleDateString('vi-VN')}
                                                    </p>
                                                </div>
                                            </div>

                                            {bid.message && (
                                                <p className="text-xs text-gray-500 line-clamp-1 mb-2">💬 {bid.message}</p>
                                            )}

                                            <div className="flex items-center justify-between gap-2">
                                                {bid.details?.length > 0 && (
                                                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                                        <FileText size={12} />
                                                        {bid.details.length} hạng mục báo giá
                                                    </div>
                                                )}

                                                <button
                                                    onClick={() => navigate(`/projects-constructor/${bid.projectId}`)}
                                                    className="px-4 py-1.5 text-xs border rounded-xl flex items-center gap-1 hover:bg-gray-100 transition ml-auto font-medium"
                                                >
                                                    Xem dự án <ArrowRight size={13} />
                                                </button>
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

export default MyBidsPage;
