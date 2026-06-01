// src/pages/BidPage.jsx

import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, X, Plus, ArrowLeft } from 'lucide-react';

const emptyItem = {
    itemName: '',
    unit: '',
    quantity: 1,
    unitPrice: '',
    description: '',
};

const BidPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        estimatedDays: '',
        message: '',
        designImage: '',
        items: [emptyItem],
    });

    useEffect(() => {
        fetchProject();
    }, [id]);

    const fetchProject = async () => {
        try {
            const res = await api.get(`/projects/v2/${id}`);
            setProject(res.data.data.project);
        } catch {
            toast.error('Không thể tải dự án');
        } finally {
            setLoading(false);
        }
    };

    // ================= UPLOAD =================
    const uploadImage = async (file) => {
        const cloudName = import.meta.env.VITE_CLOUD_NAME;
        const uploadPreset = import.meta.env.VITE_UPLOAD_PRESET;

        const fd = new FormData();
        fd.append('file', file);
        fd.append('upload_preset', uploadPreset);

        const res = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            { method: 'POST', body: fd }
        );

        const data = await res.json();
        return data.secure_url;
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        toast.loading('Uploading...', { id: 'upload' });

        const url = await uploadImage(file);

        toast.dismiss('upload');

        if (url) {
            setForm((p) => ({ ...p, designImage: url }));
            toast.success('Upload thành công');
        }
    };

    // ================= ITEMS =================
    const addItem = () => {
        setForm((p) => ({
            ...p,
            items: [...p.items, { ...emptyItem }],
        }));
    };

    const removeItem = (index) => {
        const copy = [...form.items];
        copy.splice(index, 1);
        setForm((p) => ({
            ...p,
            items: copy.length ? copy : [emptyItem],
        }));
    };

    const updateItem = (index, field, value) => {
        const copy = [...form.items];
        copy[index][field] = value;
        setForm((p) => ({ ...p, items: copy }));
    };

    // ================= SUBMIT =================
    const handleSubmit = async () => {
        try {
            setSubmitting(true);

            const payload = {
                projectId: Number(id),
                estimatedDays: Number(form.estimatedDays),
                message: form.message,
                designImage: form.designImage,
                details: form.items.map((i) => ({
                    itemName: i.itemName,
                    unit: i.unit,
                    quantity: Number(i.quantity),
                    unitPrice: Number(i.unitPrice),
                    description: i.description,
                })),
            };

            await api.post('/bids', payload);

            toast.success('Gửi báo giá thành công');
            navigate(`/projects-constructor/${id}`);
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Lỗi gửi báo giá');
        } finally {
            setSubmitting(false);
        }
    };

    // ================= UI =================
    if (loading) {
        return (
            <Layout title="Bid">
                <div className="h-64 flex items-center justify-center text-sm text-gray-400">
                    Loading...
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="Gửi báo giá">
            <div className=" mx-auto text-sm space-y-6">

                {/* HEADER */}
                <div className="bg-white border rounded-2xl p-5 flex justify-between items-center">
                    <div>
                        <button
                            onClick={() => navigate(-1)}
                            className="text-xs text-gray-500 flex items-center gap-1 mb-2"
                        >
                            <ArrowLeft size={14} /> Quay lại
                        </button>

                        <h1 className="text-base font-bold">
                            {project?.name}
                        </h1>
                        <p className="text-xs text-gray-400">
                            Gửi báo giá cho dự án này
                        </p>
                    </div>
                </div>

                {/* FORM */}
                <div className="bg-white border rounded-2xl p-6 space-y-6">

                    {/* BASIC */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        <div>
                            <label className="text-xs font-semibold text-gray-600">
                                Số ngày thi công
                            </label>
                            <input
                                type="number"
                                value={form.estimatedDays}
                                onChange={(e) =>
                                    setForm((p) => ({ ...p, estimatedDays: e.target.value }))
                                }
                                className="w-full mt-1 border rounded-xl px-3 py-2 text-sm"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-gray-600">
                                Ảnh thiết kế tổng
                            </label>

                            <label className="mt-1 flex items-center justify-center gap-2 border border-dashed rounded-xl py-3 cursor-pointer hover:bg-gray-50">
                                <Upload size={16} />
                                Upload
                                <input type="file" hidden onChange={handleUpload} />
                            </label>
                        </div>
                    </div>

                    {form.designImage && (
                        <img
                            src={form.designImage}
                            className="w-full h-64 object-cover rounded-xl"
                        />
                    )}

                    {/* MESSAGE */}
                    <div>
                        <label className="text-xs font-semibold text-gray-600">
                            Lời nhắn
                        </label>

                        <textarea
                            rows={3}
                            value={form.message}
                            onChange={(e) =>
                                setForm((p) => ({ ...p, message: e.target.value }))
                            }
                            className="w-full mt-1 border rounded-xl px-3 py-2 text-sm"
                        />
                    </div>

                    {/* ITEMS */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <p className="font-semibold text-sm">
                                Hạng mục báo giá
                            </p>

                            <button
                                onClick={addItem}
                                className="text-xs bg-green-700 text-white px-3 py-1 rounded-lg flex items-center gap-1"
                            >
                                <Plus size={14} /> Thêm
                            </button>
                        </div>

                        <div className="space-y-4">
                            {form.items.map((item, index) => (
                                <div
                                    key={index}
                                    className="border rounded-xl p-4 relative space-y-3"
                                >
                                    <button
                                        onClick={() => removeItem(index)}
                                        className="absolute top-2 right-2 text-red-500"
                                    >
                                        <X size={16} />
                                    </button>

                                    <div className="grid grid-cols-2 gap-3">
                                        <input
                                            placeholder="Tên hạng mục"
                                            value={item.itemName}
                                            onChange={(e) =>
                                                updateItem(index, 'itemName', e.target.value)
                                            }
                                            className="border rounded-lg px-3 py-2 text-sm"
                                        />

                                        <input
                                            placeholder="Đơn vị"
                                            value={item.unit}
                                            onChange={(e) =>
                                                updateItem(index, 'unit', e.target.value)
                                            }
                                            className="border rounded-lg px-3 py-2 text-sm"
                                        />

                                        <input
                                            type="number"
                                            placeholder="Số lượng"
                                            value={item.quantity}
                                            onChange={(e) =>
                                                updateItem(index, 'quantity', e.target.value)
                                            }
                                            className="border rounded-lg px-3 py-2 text-sm"
                                        />

                                        <input
                                            type="number"
                                            placeholder="Đơn giá"
                                            value={item.unitPrice}
                                            onChange={(e) =>
                                                updateItem(index, 'unitPrice', e.target.value)
                                            }
                                            className="border rounded-lg px-3 py-2 text-sm"
                                        />
                                    </div>

                                    <textarea
                                        placeholder="Mô tả"
                                        value={item.description}
                                        onChange={(e) =>
                                            updateItem(index, 'description', e.target.value)
                                        }
                                        className="w-full border rounded-lg px-3 py-2 text-sm"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* SUBMIT */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            onClick={() => navigate(-1)}
                            className="px-4 py-2 text-sm border rounded-xl"
                        >
                            Hủy
                        </button>

                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="px-6 py-2 text-sm bg-green-700 text-white rounded-xl font-semibold"
                        >
                            {submitting ? 'Đang gửi...' : 'Gửi báo giá'}
                        </button>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default BidPage;