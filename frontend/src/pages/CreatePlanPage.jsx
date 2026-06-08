import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Plus, X, Loader2, Calendar, DollarSign, Percent } from 'lucide-react';

const CreatePlanPage = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();

    const [note, setNote] = useState('');
    // Khởi tạo phần tử đầu tiên bằng một Object độc lập hoàn toàn
    const [milestones, setMilestones] = useState([
        { title: '', description: '', amount: '', progressPercent: '', deadline: '' }
    ]);
    const [loading, setLoading] = useState(false);

    // ================== UPDATE (IMMUTABLE) ==================
    const update = (index, field, value) => {
        setMilestones(prev =>
            prev.map((item, idx) =>
                idx === index ? { ...item, [field]: value } : item
            )
        );
    };

    // Tạo Object mới tinh khi bấm thêm để tránh dính chung ô nhớ
    const add = () => {
        setMilestones(prev => [
            ...prev,
            { title: '', description: '', amount: '', progressPercent: '', deadline: '' }
        ]);
    };

    const remove = (i) => {
        if (milestones.length === 1) {
            setMilestones([{ title: '', description: '', amount: '', progressPercent: '', deadline: '' }]);
            return;
        }
        setMilestones(prev => prev.filter((_, idx) => idx !== i));
    };

    // ================== VALIDATION ==================
    const validate = () => {
        let totalPercent = 0;

        for (let i = 0; i < milestones.length; i++) {
            const m = milestones[i];
            const stt = i + 1;

            if (!m.title?.trim()) {
                toast.error(`Quy trình số ${stt}: Thiếu tên quy trình`);
                return false;
            }

            if (!m.amount || Number(m.amount) <= 0) {
                toast.error(`Quy trình số ${stt}: Số tiền phải lớn hơn 0đ`);
                return false;
            }

            if (!m.progressPercent || Number(m.progressPercent) < 1 || Number(m.progressPercent) > 100) {
                toast.error(`Quy trình số ${stt}: Tiến độ (%) phải từ 1 đến 100`);
                return false;
            }

            if (!m.deadline) {
                toast.error(`Quy trình số ${stt}: Vui lòng chọn hạn chót (Deadline)`);
                return false;
            }

            totalPercent += Number(m.progressPercent);
        }

        if (totalPercent !== 100) {
            toast.error(`Tổng tiến độ hiện tại là ${totalPercent}%. Tổng bắt buộc phải đạt 100%`);
            return false;
        }

        return true;
    };

    // ================== SUBMIT ==================
    const submit = async () => {
        if (!validate()) return;

        try {
            setLoading(true);

            const payload = {
                note: note.trim(),
                milestones: milestones.map(m => ({
                    title: m.title.trim(),
                    description: m.description?.trim() || '',
                    amount: Number(m.amount),
                    progressPercent: Number(m.progressPercent),
                    deadline: m.deadline
                }))
            };

            await api.post(`/jobs/${jobId}/plan`, payload);

            toast.success('Tạo kế hoạch thi công thành công');
            navigate(-1);
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Có lỗi xảy ra khi tạo kế hoạch');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout title="Lập Kế Hoạch Thi Công">
            <div className="max-w-3xl mx-auto px-4 py-4 font-sans text-gray-700 antialiased">
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 space-y-5 text-sm">

                    {/* GHI CHÚ TỔNG QUAN */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                            Ghi chú / Mô tả kế hoạch tổng thể
                        </label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Nhập ghi chú chung cho toàn bộ kế hoạch thi công này..."
                            className="w-full border border-gray-200 focus:border-[#1a4f3a] focus:ring-1 focus:ring-[#1a4f3a] outline-none rounded-xl px-3 py-2 transition-all text-xs"
                            rows={3}
                        />
                    </div>

                    {/* QUY TRÌNH / GIAI ĐOẠN */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                            <div>
                                <h2 className="font-bold text-sm text-gray-800">Các giai đoạn thi công</h2>
                                <p className="text-[11px] text-gray-400 mt-0.5">Thiết lập các cột mốc thanh toán và tiến độ thực tế</p>
                            </div>

                            <button
                                type="button"
                                onClick={add}
                                className="text-xs bg-[#1a4f3a] hover:bg-[#145c42] text-white px-3 py-1.5 font-semibold rounded-lg flex items-center gap-1 shadow-sm transition-colors"
                            >
                                <Plus size={14} />
                                Thêm giai đoạn
                            </button>
                        </div>

                        {milestones.map((m, i) => (
                            <div key={i} className="border border-gray-200/80 rounded-xl p-4 relative space-y-3 bg-gray-50/30 hover:border-gray-300 transition-colors">

                                {/* NÚT XÓA */}
                                <button
                                    type="button"
                                    onClick={() => remove(i)}
                                    className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors p-1 hover:bg-gray-100 rounded-md"
                                    title="Xóa giai đoạn này"
                                >
                                    <X size={14} />
                                </button>

                                <div className="pr-6">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                                        Giai đoạn #{i + 1}
                                    </span>
                                    {/* TIÊU ĐỀ MILESTONE */}
                                    <input
                                        placeholder="Ví dụ: Hoàn thành thi công phần móng công trình"
                                        value={m.title}
                                        onChange={(e) => update(i, 'title', e.target.value)}
                                        className="w-full border border-gray-200 focus:border-[#1a4f3a] focus:ring-1 focus:ring-[#1a4f3a] outline-none rounded-lg px-3 py-1.5 text-xs font-semibold"
                                    />
                                </div>

                                {/* MÔ TẢ CHI TIẾT */}
                                <textarea
                                    placeholder="Mô tả chi tiết khối lượng công việc cần đạt được trong giai đoạn này..."
                                    value={m.description}
                                    onChange={(e) => update(i, 'description', e.target.value)}
                                    className="w-full border border-gray-200 focus:border-[#1a4f3a] focus:ring-1 focus:ring-[#1a4f3a] outline-none rounded-lg px-3 py-1.5 text-xs"
                                    rows={2}
                                />

                                {/* LƯỚI THÔNG SỐ (SỐ TIỀN - PHẦN TRĂM - DEADLINE) */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {/* Số tiền */}
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-gray-400">
                                            <DollarSign size={13} />
                                        </div>
                                        <input
                                            type="number"
                                            placeholder="Số tiền tạm ứng"
                                            value={m.amount}
                                            onChange={(e) => update(i, 'amount', e.target.value)}
                                            className="w-full pl-7 pr-3 border border-gray-200 focus:border-[#1a4f3a] focus:ring-1 focus:ring-[#1a4f3a] outline-none rounded-lg py-1.5 text-xs"
                                        />
                                    </div>

                                    {/* % Tiến độ */}
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-gray-400">
                                            <Percent size={13} />
                                        </div>
                                        <input
                                            type="number"
                                            placeholder="Tỷ trọng tiến độ (%)"
                                            value={m.progressPercent}
                                            onChange={(e) => update(i, 'progressPercent', e.target.value)}
                                            className="w-full pl-7 pr-3 border border-gray-200 focus:border-[#1a4f3a] focus:ring-1 focus:ring-[#1a4f3a] outline-none rounded-lg py-1.5 text-xs"
                                        />
                                    </div>

                                    {/* Ngày hạn chót */}
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-gray-400">
                                            <Calendar size={13} />
                                        </div>
                                        <input
                                            type="date"
                                            value={m.deadline}
                                            onChange={(e) => update(i, 'deadline', e.target.value)}
                                            className="w-full pl-7 pr-3 border border-gray-200 focus:border-[#1a4f3a] focus:ring-1 focus:ring-[#1a4f3a] outline-none rounded-lg py-1.5 text-xs text-gray-600"
                                        />
                                    </div>
                                </div>

                            </div>
                        ))}
                    </div>

                    {/* HÀNH ĐỘNG DƯỚI FOOTER */}
                    <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-4 py-1.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
                        >
                            Hủy bỏ
                        </button>

                        <button
                            type="button"
                            onClick={submit}
                            disabled={loading}
                            className="px-5 py-1.5 bg-[#1a4f3a] hover:bg-[#145c42] text-white font-semibold rounded-xl text-xs inline-flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                        >
                            {loading && <Loader2 size={13} className="animate-spin" />}
                            {loading ? 'Đang gửi bản thảo...' : 'Ký duyệt kế hoạch'}
                        </button>
                    </div>

                </div>
            </div>
        </Layout>
    );
};

export default CreatePlanPage;