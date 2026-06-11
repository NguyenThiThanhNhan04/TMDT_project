import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import {
    CheckCircle2, Clock, Wallet, X, ImagePlus, Loader2,
    Tag, Maximize2, Layers, ChevronDown, ChevronUp,
    PlusCircle, Trash2, CalendarDays, MapPin, User,
    ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import useAuthStore from '../store/useAuthStore';

// ─── helpers ───────────────────────────────────────────────
const fmt = (v) => (v != null ? v.toLocaleString('vi-VN') + 'đ' : '—');

const STATUS_MAP = {
    PENDING:              { label: 'Chờ bắt đầu',   cls: 'bg-gray-50 text-gray-500 border-gray-200' },
    IN_PROGRESS:          { label: 'Đang thực hiện', cls: 'bg-blue-50 text-blue-600 border-blue-100' },
    WAITING_CONFIRMATION: { label: 'Chờ nghiệm thu', cls: 'bg-amber-50 text-amber-600 border-amber-100' },
    COMPLETED:            { label: 'Hoàn thành',     cls: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
};

const StatusBadge = ({ status }) => {
    const cfg = STATUS_MAP[status] ?? { label: status, cls: 'bg-gray-50 text-gray-500 border-gray-200' };
    return (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${cfg.cls}`}>
            {cfg.label}
        </span>
    );
};

// ─── Cloudinary upload ─────────────────────────────────────
const uploadToCloudinary = async (file) => {
    const cloudName = import.meta.env.VITE_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_UPLOAD_PRESET;
    if (!cloudName || !uploadPreset) throw new Error('Thiếu cấu hình Cloudinary ENV');
    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', uploadPreset);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error?.message || 'Upload thất bại');
    return data.secure_url;
};

// ─── Image gallery carousel ────────────────────────────────
const ImageGallery = ({ images }) => {
    const [idx, setIdx] = useState(0);
    if (!images?.length) return null;
    return (
        <div className="relative rounded-xl overflow-hidden bg-gray-100">
            <img
                src={images[idx]}
                alt={`project-${idx}`}
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
        </div>
    );
};

// ─── Inline update form ────────────────────────────────────
const UpdateForm = ({ milestone, onSuccess, onCancel }) => {
    const [form, setForm] = useState({ title: '', content: '', imageUrl: '' });
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            setUploading(true);
            const url = await uploadToCloudinary(file);
            setForm(p => ({ ...p, imageUrl: url }));
            toast.success('Upload ảnh thành công');
        } catch (err) {
            toast.error(err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async () => {
        if (!form.title.trim()) return toast.error('Vui lòng nhập tiêu đề');
        if (!form.content.trim()) return toast.error('Vui lòng nhập nội dung');
        try {
            setSubmitting(true);
            await api.post(`/milestones/${milestone.id}/updates`, form);
            toast.success('Đăng cập nhật tiến độ thành công');
            onSuccess();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="mt-4 border border-[#1a4f3a]/20 rounded-xl bg-emerald-50/30 p-4 space-y-3">
            <p className="text-xs font-bold text-[#1a4f3a] flex items-center gap-1.5">
                <PlusCircle size={13} /> Đăng cập nhật tiến độ mới
            </p>

            <div>
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
                    Tiêu đề <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={form.title}
                    onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                    placeholder="Ví dụ: Hoàn thành cán nền bê tông, chuẩn bị ốp lát"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#1a4f3a] focus:ring-1 focus:ring-[#1a4f3a]/20 bg-white"
                />
            </div>

            <div>
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
                    Mô tả chi tiết <span className="text-red-500">*</span>
                </label>
                <textarea
                    rows={3}
                    value={form.content}
                    onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                    placeholder="Mô tả khối lượng công việc đã hoàn thành, vật tư đã dùng..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#1a4f3a] focus:ring-1 focus:ring-[#1a4f3a]/20 resize-none bg-white leading-relaxed"
                />
            </div>

            <div>
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                    Hình ảnh hiện trường
                </label>
                {form.imageUrl ? (
                    <div className="relative w-fit">
                        <img src={form.imageUrl} alt="preview" className="h-36 rounded-lg object-cover border border-gray-200" />
                        <button
                            onClick={() => setForm(p => ({ ...p, imageUrl: '' }))}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 shadow"
                        >
                            <X size={12} />
                        </button>
                    </div>
                ) : (
                    <label className={`border border-dashed border-gray-300 rounded-lg h-24 flex flex-col items-center justify-center cursor-pointer hover:bg-white hover:border-[#1a4f3a]/40 transition-all bg-white/50 ${uploading ? 'pointer-events-none' : ''}`}>
                        {uploading ? (
                            <><Loader2 size={20} className="animate-spin text-[#1a4f3a] mb-1" /><p className="text-[10px] text-gray-400">Đang tải lên...</p></>
                        ) : (
                            <><ImagePlus size={20} className="text-gray-300 mb-1" /><p className="text-[10px] text-gray-400">Click để chọn ảnh (JPG, PNG)</p></>
                        )}
                        <input type="file" hidden accept="image/*" disabled={uploading} onChange={handleUpload} />
                    </label>
                )}
            </div>

            <div className="flex gap-2 pt-1">
                <button
                    onClick={onCancel}
                    className="px-4 py-1.5 rounded-lg border border-gray-200 text-gray-500 text-xs font-medium hover:bg-gray-100 transition-colors"
                >
                    Hủy
                </button>
                <button
                    disabled={submitting || uploading}
                    onClick={handleSubmit}
                    className="px-5 py-1.5 rounded-lg bg-[#1a4f3a] text-white text-xs font-bold hover:bg-[#153f2e] transition-colors disabled:opacity-40 flex items-center gap-1.5"
                >
                    {submitting && <Loader2 size={12} className="animate-spin" />}
                    {submitting ? 'Đang gửi...' : 'Đăng cập nhật'}
                </button>
            </div>
        </div>
    );
};

// ─── Main Page ─────────────────────────────────────────────
const ProductionLogDetailPage = () => {
    const { jobId } = useParams();
    const { user } = useAuthStore();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [openFormId, setOpenFormId] = useState(null);
    const [collapsedIds, setCollapsedIds] = useState(new Set());

    useEffect(() => { fetchJobDetail(); }, [jobId]);

    const fetchJobDetail = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/contracts/job/${jobId}`);
            setJob(res.data.data);
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Không thể tải chi tiết dự án');
        } finally {
            setLoading(false);
        }
    };

    const handleRequestRelease = async (milestoneId) => {
        if (!window.confirm('Xác nhận gửi yêu cầu giải ngân cho khách hàng?')) return;
        try {
            await api.post(`/milestones/${milestoneId}/submit`);
            toast.success('Đã gửi yêu cầu xác nhận');
            fetchJobDetail();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleConfirmRelease = async (milestoneId) => {
        if (!window.confirm('Xác nhận nghiệm thu? Hệ thống sẽ giải ngân tiền Escrow cho Nhà thầu ngay lập tức.')) return;
        try {
            await api.post(`/milestones/${milestoneId}/confirm`);
            toast.success('Nghiệm thu & Giải ngân thành công!');
            // Trigger wallet refresh
            window.dispatchEvent(new CustomEvent('WALLET_DATA_CHANGED'));
            fetchJobDetail();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const toggleCollapse = (id) => {
        setCollapsedIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    if (loading) {
        return (
            <Layout title="Chi tiết thi công">
                <div className="flex justify-center items-center py-32">
                    <Loader2 size={32} className="animate-spin text-[#1a4f3a]" />
                </div>
            </Layout>
        );
    }

    if (!job) return null;

    const milestones = job.workPlan?.milestones ?? [];
    const completedCount = milestones.filter(m => m.status === 'COMPLETED').length;
    const isCustomer = user?.email === job.customerEmail;

    return (
        <Layout title="Nhật ký thi công">
            <div className="max-w-4xl mx-auto space-y-5 pb-10">

                {/* ── PROJECT HEADER ── */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

                    {/* Image gallery */}
                    {job.imageUrls?.length > 0 && (
                        <ImageGallery images={job.imageUrls} />
                    )}

                    <div className="p-6">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4 pb-5 border-b border-gray-100">
                            <div className="space-y-2">
                                <h1 className="text-xl font-bold text-gray-900">{job.projectName}</h1>
                                {job.description && (
                                    <p className="text-xs text-gray-500 max-w-xl leading-relaxed">{job.description}</p>
                                )}
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                    {job.category && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-[#1a4f3a] text-[11px] font-semibold">
                                            <Tag size={11} /> {job.category}
                                        </span>
                                    )}
                                    {job.area && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-50 text-gray-600 text-[11px] font-medium border border-gray-100">
                                            <Maximize2 size={11} /> {job.area} m²
                                        </span>
                                    )}
                                    {job.style && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-50 text-gray-600 text-[11px] font-medium border border-gray-100">
                                            <Layers size={11} /> {job.style}
                                        </span>
                                    )}
                                    {job.address && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-50 text-gray-600 text-[11px] font-medium border border-gray-100">
                                            <MapPin size={11} /> {job.address}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shrink-0 min-w-[180px]">
                                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-0.5">Giá trị hợp đồng</p>
                                <p className="text-lg font-bold text-[#1a4f3a]">{fmt(job.agreedPrice)}</p>
                                {job.customerName && (
                                    <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-2">
                                        <User size={10} /> {job.customerName}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Overall progress */}
                        <div className="mt-4">
                            <div className="flex justify-between items-center mb-1.5">
                                <span className="text-xs font-medium text-gray-500">
                                    Tiến độ tổng thể — {completedCount}/{milestones.length} giai đoạn hoàn thành
                                </span>
                                <span className="text-xs font-bold text-[#1a4f3a] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                    {job.totalProgress ?? 0}%
                                </span>
                            </div>
                            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[#1a4f3a] rounded-full transition-all duration-700"
                                    style={{ width: `${job.totalProgress ?? 0}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── MILESTONES ── */}
                <h2 className="font-bold text-base text-gray-800 px-1">Kế hoạch thi công</h2>

                {milestones.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center text-sm text-gray-400">
                        Chưa có kế hoạch thi công nào được tạo.
                    </div>
                ) : (
                    milestones.map((milestone) => {
                        const isCollapsed = collapsedIds.has(milestone.id);
                        const isFormOpen = openFormId === milestone.id;
                        const updateCount = milestone.updates?.length ?? 0;

                        return (
                            <div key={milestone.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

                                {/* Milestone header */}
                                <div className="p-5 bg-gray-50/40 border-b border-gray-100">
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                        <div className="flex items-start gap-3 flex-1 min-w-0">
                                            <span className="w-7 h-7 shrink-0 rounded-lg bg-[#1a4f3a] text-white flex items-center justify-center text-xs font-bold shadow-sm">
                                                {milestone.stepOrder}
                                            </span>
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                                                    <h3 className="text-sm font-semibold text-gray-800">{milestone.title}</h3>
                                                    <StatusBadge status={milestone.status} />
                                                </div>
                                                {milestone.description && (
                                                    <p className="text-xs text-gray-500 leading-relaxed">{milestone.description}</p>
                                                )}
                                                {milestone.deadline && (
                                                    <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-1">
                                                        <CalendarDays size={10} />
                                                        Hạn: {new Date(milestone.deadline).toLocaleDateString('vi-VN')}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="shrink-0 text-right">
                                            <p className="text-[10px] text-gray-400">Giải ngân giai đoạn</p>
                                            <p className="text-sm font-bold text-gray-800">{fmt(milestone.amount)}</p>
                                            <p className="text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded mt-1 inline-block">
                                                {milestone.progressPercent}% tiến độ
                                            </p>
                                        </div>
                                    </div>

                                    {/* Milestone progress bar — dựa trên progressPercent của plan */}
                                    <div className="mt-3">
                                        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${
                                                    milestone.status === 'COMPLETED' ? 'bg-emerald-500' :
                                                    milestone.status === 'WAITING_CONFIRMATION' ? 'bg-amber-400' :
                                                    milestone.status === 'IN_PROGRESS' ? 'bg-blue-400' : 'bg-gray-300'
                                                }`}
                                                style={{
                                                    width: milestone.status === 'COMPLETED' ? '100%' :
                                                           milestone.status === 'WAITING_CONFIRMATION' ? '90%' :
                                                           milestone.status === 'IN_PROGRESS'
                                                               ? `${Math.min(80, Math.max(10, updateCount * 20))}%`
                                                               : '0%'
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Updates + form */}
                                <div className="p-5">
                                    {/* Collapse toggle */}
                                    {updateCount > 0 && (
                                        <button
                                            onClick={() => toggleCollapse(milestone.id)}
                                            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 mb-3 transition-colors"
                                        >
                                            {isCollapsed ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
                                            {isCollapsed ? `Hiện ${updateCount} nhật ký` : 'Ẩn nhật ký'}
                                        </button>
                                    )}

                                    {/* Update timeline */}
                                    {!isCollapsed && (
                                        updateCount === 0 ? (
                                            <div className="border border-dashed border-gray-200 rounded-xl p-5 text-center text-xs text-gray-400 bg-gray-50/30 mb-3">
                                                Chưa có nhật ký cập nhật nào cho giai đoạn này.
                                            </div>
                                        ) : (
                                            <div className="relative border-l-2 border-gray-100 pl-5 space-y-4 ml-3 mb-4">
                                                {milestone.updates.map((update, idx) => (
                                                    <div key={update.id} className="relative group text-xs">
                                                        <div className="absolute -left-[25px] top-1 w-3 h-3 rounded-full border-2 border-white bg-gray-300 group-hover:bg-[#1a4f3a] transition-colors shadow-sm" />
                                                        <div className="bg-white border border-gray-100 rounded-xl p-3.5 shadow-sm space-y-2 hover:border-gray-200 transition-colors">
                                                            <div className="flex justify-between items-start gap-2">
                                                                <div>
                                                                    <h4 className="font-semibold text-gray-800">{update.title}</h4>
                                                                    <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                                                                        <Clock size={10} />
                                                                        {new Date(update.createdAt).toLocaleString('vi-VN', {
                                                                            hour: '2-digit', minute: '2-digit',
                                                                            day: '2-digit', month: '2-digit', year: 'numeric',
                                                                        })}
                                                                    </p>
                                                                </div>
                                                                <span className="shrink-0 text-[10px] text-gray-300">#{idx + 1}</span>
                                                            </div>
                                                            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{update.content}</p>
                                                            {update.imageUrl && (
                                                                <div className="overflow-hidden rounded-lg border border-gray-100 max-w-sm">
                                                                    <img
                                                                        src={update.imageUrl}
                                                                        alt={`update-${idx}`}
                                                                        className="w-full h-44 object-cover hover:scale-105 transition-transform duration-300"
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )
                                    )}

                                    {/* Inline form */}
                                    {isFormOpen && (
                                        <UpdateForm
                                            milestone={milestone}
                                            onSuccess={() => { setOpenFormId(null); fetchJobDetail(); }}
                                            onCancel={() => setOpenFormId(null)}
                                        />
                                    )}

                                    {/* Actions */}
                                    <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-gray-50 mt-1">
                                        <span className="text-[10px] text-gray-400">{updateCount} cập nhật</span>
                                        <div className="flex flex-wrap gap-2">

                                            {milestone.status === 'IN_PROGRESS' && !isCustomer && (
                                                <>
                                                    {!isFormOpen ? (
                                                        <button
                                                            onClick={() => setOpenFormId(milestone.id)}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#1a4f3a]/30 text-[#1a4f3a] text-xs font-semibold bg-emerald-50/50 hover:bg-emerald-50 transition-colors"
                                                        >
                                                            <PlusCircle size={13} /> Cập nhật tiến độ
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => setOpenFormId(null)}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 text-xs font-medium hover:bg-gray-50"
                                                        >
                                                            <Trash2 size={13} /> Đóng form
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleRequestRelease(milestone.id)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a4f3a] text-white text-xs font-semibold hover:bg-[#143d2d] shadow-sm transition-colors"
                                                    >
                                                        <Wallet size={13} /> Yêu cầu giải ngân
                                                    </button>
                                                </>
                                            )}

                                            {milestone.status === 'WAITING_CONFIRMATION' && (
                                                isCustomer ? (
                                                    <button
                                                        onClick={() => handleConfirmRelease(milestone.id)}
                                                        className="px-3 py-1.5 rounded-lg bg-[#1a4f3a] text-white font-semibold text-xs flex items-center gap-1.5 hover:bg-[#143d2d] transition-colors"
                                                    >
                                                        <CheckCircle2 size={14} /> Nghiệm thu & Giải ngân
                                                    </button>
                                                ) : (
                                                    <div className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 font-semibold text-xs border border-amber-100 flex items-center gap-1.5">
                                                        <Clock size={13} className="animate-pulse" /> Đang chờ khách hàng xác nhận
                                                    </div>
                                                )
                                            )}

                                            {milestone.status === 'COMPLETED' && (
                                                <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg">
                                                    <CheckCircle2 size={14} /> Đã hoàn thành & giải ngân
                                                </div>
                                            )}

                                            {milestone.status === 'PENDING' && (
                                                <div className="flex items-center gap-1.5 text-gray-400 text-xs bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg">
                                                    <Clock size={13} /> Chưa đến lượt
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </Layout>
    );
};

export default ProductionLogDetailPage;
