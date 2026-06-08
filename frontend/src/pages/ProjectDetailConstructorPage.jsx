import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import {
    MapPin, Clock, DollarSign, User, ArrowLeft,
    ChevronLeft, ChevronRight, ImageIcon, Tag,
    Maximize2, Layers, FileText, Send,
} from 'lucide-react';
import toast from 'react-hot-toast';

const fmt = (v) => (v ? v.toLocaleString('vi-VN') + 'đ' : 'Thỏa thuận');

// ─── Image gallery ─────────────────────────────────────────
const ImageGallery = ({ images }) => {
    console.log(images)
    const [idx, setIdx] = useState(0);
    if (!images?.length) return (
        <div className="w-full h-56 bg-gray-100 rounded-xl flex items-center justify-center">
            <ImageIcon size={36} className="text-gray-300" />
        </div>
    );
    return (
        <div className="relative rounded-xl overflow-hidden bg-gray-100">
            <img
                src={images[idx]}
                alt={`img-${idx}`}
                className="w-full h-64 object-cover"
            />
            {images.length > 1 && (
                <>
                    <button
                        onClick={() => setIdx(i => (i - 1 + images.length) % images.length)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-1.5 hover:bg-black/60 transition"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <button
                        onClick={() => setIdx(i => (i + 1) % images.length)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-1.5 hover:bg-black/60 transition"
                    >
                        <ChevronRight size={16} />
                    </button>
                    {/* Thumbnails */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                        {images.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setIdx(i)}
                                className={`w-1.5 h-1.5 rounded-full transition-all ${i === idx ? 'bg-white w-4' : 'bg-white/50'}`}
                            />
                        ))}
                    </div>
                    <span className="absolute top-2 right-2 bg-black/40 text-white text-[10px] px-2 py-0.5 rounded-full">
                        {idx + 1} / {images.length}
                    </span>
                </>
            )}
            {/* Thumbnail strip */}
            {images.length > 1 && (
                <div className="flex gap-1.5 mt-1.5 overflow-x-auto pb-1">
                    {images.map((src, i) => (
                        <button
                            key={i}
                            onClick={() => setIdx(i)}
                            className={`shrink-0 w-14 h-10 rounded-md overflow-hidden border-2 transition-all ${i === idx ? 'border-[#1a4f3a]' : 'border-transparent opacity-60 hover:opacity-100'}`}
                        >
                            <img src={src} alt={`thumb-${i}`} className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const ProjectDetailConstructorPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadData(); }, [id]);

    const loadData = async () => {
        try {
            const res = await api.get(`/projects/v2/${id}`);
            setData(res.data.data);
            console.log(res.data.data)
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Không thể tải dự án');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Layout title="Chi tiết dự án">
                <div className="h-64 flex items-center justify-center text-sm text-gray-400">
                    <div className="animate-pulse space-y-3 w-full max-w-2xl">
                        <div className="h-56 bg-gray-100 rounded-xl" />
                        <div className="h-4 bg-gray-100 w-3/4 rounded" />
                        <div className="h-4 bg-gray-100 w-full rounded" />
                    </div>
                </div>
            </Layout>
        );
    }

    if (!data) return null;

    const project = data.project;
    const bids = data.bids ?? [];

    return (
        <Layout title="Chi tiết dự án">
            <div className="max-w-5xl mx-auto space-y-5 pb-8 text-sm">

                {/* Back */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition-colors"
                >
                    <ArrowLeft size={14} /> Quay lại
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                    {/* LEFT: main content */}
                    <div className="lg:col-span-2 space-y-5">

                        {/* PROJECT CARD */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

                            {/* Image gallery */}
                            <div className="p-4 pb-0">
                                <ImageGallery images={project.imageUrls} />
                            </div>

                            <div className="p-5">
                                {/* Title + badges */}
                                <div className="mb-3">
                                    <div className="flex flex-wrap gap-1.5 mb-2">
                                        {project.category && (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-50 text-[#1a4f3a] text-[11px] font-bold border border-emerald-100">
                                                <Tag size={11} /> {project.category}
                                            </span>
                                        )}
                                        {project.area && (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-gray-50 text-gray-600 text-[11px] border border-gray-100">
                                                <Maximize2 size={11} /> {project.area} m²
                                            </span>
                                        )}
                                        {project.style && (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-gray-50 text-gray-600 text-[11px] border border-gray-100">
                                                <Layers size={11} /> {project.style}
                                            </span>
                                        )}
                                    </div>

                                    <h1 className="text-lg font-bold text-gray-900">{project.name}</h1>
                                </div>

                                {/* Meta */}
                                <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-4">
                                    {project.address && (
                                        <span className="flex items-center gap-1">
                                            <MapPin size={13} className="text-gray-400" />
                                            {project.address}
                                        </span>
                                    )}
                                    <span className="flex items-center gap-1">
                                        <DollarSign size={13} className="text-gray-400" />
                                        <span className="font-semibold text-[#1a4f3a]">
                                            {fmt(project.budgetMin)} – {fmt(project.budgetMax)}
                                        </span>
                                    </span>
                                    {project.createdAt && (
                                        <span className="flex items-center gap-1">
                                            <Clock size={13} className="text-gray-400" />
                                            {new Date(project.createdAt).toLocaleDateString('vi-VN')}
                                        </span>
                                    )}
                                </div>

                                {/* Description */}
                                {project.description && (
                                    <p className="text-xs text-gray-600 leading-relaxed">
                                        {project.description}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* BIDS LIST */}
                        <div>
                            <h2 className="font-bold text-base text-gray-800 mb-3">
                                Các báo giá ({bids.length})
                            </h2>

                            {bids.length === 0 ? (
                                <div className="bg-white rounded-xl border border-dashed border-gray-200 p-10 text-center text-xs text-gray-400">
                                    Chưa có báo giá nào cho dự án này.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {bids.map(bid => (
                                        <div
                                            key={bid.id}
                                            className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-sm transition"
                                        >
                                            <div className="flex justify-between items-start gap-3">
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    {bid.designImage ? (
                                                        <img
                                                            src={bid.designImage}
                                                            alt="design"
                                                            className="w-12 h-12 rounded-lg object-cover shrink-0 border border-gray-100"
                                                        />
                                                    ) : (
                                                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                                                            <ImageIcon size={18} className="text-gray-300" />
                                                        </div>
                                                    )}
                                                    <div className="min-w-0">
                                                        <p className="font-semibold text-sm text-gray-800">{bid.contractorName}</p>
                                                        <p className="text-xs text-gray-400">{bid.contractorPhone}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="font-bold text-[#1a4f3a] text-sm">{bid.totalPrice?.toLocaleString('vi-VN')}đ</p>
                                                    <p className="text-xs text-gray-400">{bid.estimatedDays} ngày</p>
                                                </div>
                                            </div>

                                            {bid.message && (
                                                <p className="text-xs text-gray-500 mt-2 leading-relaxed border-t border-gray-50 pt-2">
                                                    💬 {bid.message}
                                                </p>
                                            )}

                                            {bid.details?.length > 0 && (
                                                <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-2">
                                                    <FileText size={11} />
                                                    {bid.details.length} hạng mục báo giá
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT SIDEBAR */}
                    <div className="space-y-4">
                        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm sticky top-4">
                            <div className="flex items-center gap-2.5 mb-4 pb-4 border-b border-gray-50">
                                <div className="w-9 h-9 rounded-full bg-[#1a4f3a]/10 flex items-center justify-center font-bold text-sm text-[#1a4f3a]">
                                    {project.ownerName?.charAt(0) || 'U'}
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">Chủ dự án</p>
                                    <p className="font-semibold text-sm text-gray-800">{project.ownerName}</p>
                                    {project.ownerPhone && (
                                        <p className="text-xs text-gray-400">{project.ownerPhone}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2 text-xs text-gray-600 mb-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Ngân sách</span>
                                    <span className="font-semibold text-[#1a4f3a]">{fmt(project.budgetMin)} – {fmt(project.budgetMax)}</span>
                                </div>
                                {project.area && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Diện tích</span>
                                        <span className="font-medium">{project.area} m²</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Trạng thái</span>
                                    <span className={`font-semibold ${project.status === 'OPEN' ? 'text-green-600' : 'text-gray-500'}`}>
                                        {project.status === 'OPEN' ? 'Đang nhận báo giá' : project.status}
                                    </span>
                                </div>
                            </div>

                            {project.status === 'OPEN' && project.approvalStatus === 'APPROVED' && (
                                <button
                                    onClick={() => navigate(`/projects/${id}/bid`)}
                                    className="w-full bg-[#1a4f3a] text-white text-sm py-2.5 rounded-xl font-semibold hover:bg-[#143d2d] transition-colors flex items-center justify-center gap-2"
                                >
                                    <Send size={14} /> Gửi báo giá
                                </button>
                            )}

                            {(project.status !== 'OPEN' || project.approvalStatus !== 'APPROVED') && (
                                <div className="w-full bg-gray-100 text-gray-500 text-sm py-2.5 rounded-xl font-medium text-center">
                                    Đã đóng nhận báo giá
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default ProjectDetailConstructorPage;
