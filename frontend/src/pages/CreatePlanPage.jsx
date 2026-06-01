import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Plus, X } from 'lucide-react';

const emptyMilestone = {
    title: '',
    description: '',
    amount: '',
    progressPercent: '',
    deadline: ''
};

const CreatePlanPage = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();

    const [note, setNote] = useState('');
    const [milestones, setMilestones] = useState([emptyMilestone]);
    const [loading, setLoading] = useState(false);

    // ================== UPDATE ==================
    const update = (index, field, value) => {
        const copy = [...milestones];
        copy[index][field] = value;
        setMilestones(copy);
    };

    const add = () => {
        setMilestones([...milestones, emptyMilestone]);
    };

    const remove = (i) => {
        const copy = milestones.filter((_, idx) => idx !== i);
        setMilestones(copy.length ? copy : [emptyMilestone]);
    };

    // ================== VALIDATION ==================
    const validate = () => {
        let totalPercent = 0;

        for (let m of milestones) {
            if (!m.title) {
                toast.error('Thiếu tên milestone');
                return false;
            }

            if (!m.amount || Number(m.amount) <= 0) {
                toast.error('Amount phải > 0');
                return false;
            }

            if (!m.progressPercent || Number(m.progressPercent) < 1 || Number(m.progressPercent) > 100) {
                toast.error('Progress phải từ 1 - 100');
                return false;
            }

            if (!m.deadline) {
                toast.error('Thiếu deadline');
                return false;
            }

            totalPercent += Number(m.progressPercent);
        }

        if (totalPercent !== 100) {
            toast.error('Tổng progressPercent phải bằng 100%');
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
                note,
                milestones: milestones.map(m => ({
                    title: m.title,
                    description: m.description,
                    amount: Number(m.amount),
                    progressPercent: Number(m.progressPercent),
                    deadline: m.deadline // YYYY-MM-DD OK
                }))
            };

            await api.post(`/jobs/${jobId}/plan`, payload);

            toast.success('Tạo kế hoạch thành công');
            navigate(-1);
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Lỗi tạo kế hoạch');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout title="Tạo kế hoạch thi công">

            <div className="max-w-4xl mx-auto bg-white border rounded-2xl p-6 space-y-6 text-sm">

                {/* NOTE */}
                <div>
                    <label className="font-semibold text-xs text-gray-600">
                        Ghi chú kế hoạch
                    </label>

                    <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="w-full mt-1 border rounded-xl px-3 py-2"
                        rows={3}
                    />
                </div>

                {/* MILESTONES */}
                <div className="space-y-4">

                    <div className="flex justify-between items-center">
                        <h2 className="font-bold text-base">
                            Quy trình Thi công
                        </h2>

                        <button
                            onClick={add}
                            className="text-xs bg-green-700 text-white px-3 py-1 rounded-lg flex items-center gap-1"
                        >
                            <Plus size={14} />
                            Thêm
                        </button>
                    </div>

                    {milestones.map((m, i) => (
                        <div key={i} className="border rounded-xl p-4 relative space-y-3">

                            <button
                                onClick={() => remove(i)}
                                className="absolute top-2 right-2 text-red-500"
                            >
                                <X size={14} />
                            </button>

                            {/* TITLE */}
                            <input
                                placeholder="Tên quy trình"
                                value={m.title}
                                onChange={(e) => update(i, 'title', e.target.value)}
                                className="w-full border rounded-lg px-3 py-2"
                            />

                            {/* DESC */}
                            <textarea
                                placeholder="Mô tả"
                                value={m.description}
                                onChange={(e) => update(i, 'description', e.target.value)}
                                className="w-full border rounded-lg px-3 py-2"
                            />

                            {/* GRID */}
                            <div className="grid grid-cols-3 gap-2">

                                <input
                                    type="number"
                                    placeholder="số tiền"
                                    value={m.amount}
                                    onChange={(e) => update(i, 'amount', e.target.value)}
                                    className="border rounded-lg px-3 py-2"
                                />

                                <input
                                    type="number"
                                    placeholder="%"
                                    value={m.progressPercent}
                                    onChange={(e) => update(i, 'progressPercent', e.target.value)}
                                    className="border rounded-lg px-3 py-2"
                                />

                                <input
                                    type="date"
                                    value={m.deadline}
                                    onChange={(e) => update(i, 'deadline', e.target.value)}
                                    className="border rounded-lg px-3 py-2"
                                />
                            </div>

                        </div>
                    ))}
                </div>

                {/* ACTIONS */}
                <div className="flex justify-end gap-2 border-t pt-4">

                    <button
                        onClick={() => navigate(-1)}
                        className="px-4 py-2 border rounded-xl"
                    >
                        Hủy
                    </button>

                    <button
                        onClick={submit}
                        disabled={loading}
                        className="px-6 py-2 bg-[#1a4f3a] text-white rounded-xl"
                    >
                        {loading ? 'Đang gửi...' : 'Tạo kế hoạch'}
                    </button>

                </div>

            </div>
        </Layout>
    );
};

export default CreatePlanPage;