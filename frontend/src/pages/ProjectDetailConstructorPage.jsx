import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import {
    MapPin,
    Clock,
    DollarSign,
    User,
    ArrowRight
} from 'lucide-react';

const ProjectDetailConstructorPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch();
    }, [id]);

    const fetch = async () => {
        try {
            const res = await api.get(`/projects/v2/${id}`);
            setData(res.data.data);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Layout title="Loading...">
                <div className="h-64 flex items-center justify-center text-sm text-gray-400">
                    Loading...
                </div>
            </Layout>
        );
    }

    const project = data.project;
    const bids = data.bids;

    return (
        <Layout title="Chi tiết dự án">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-sm">

                {/* LEFT CONTENT */}
                <div className="lg:col-span-2 space-y-6">

                    {/* PROJECT INFO */}
                    <div className="bg-white rounded-2xl p-6 border">
                        <h1 className="text-lg font-bold mb-2">
                            {project.name}
                        </h1>

                        <p className="text-gray-500 text-sm mb-4 leading-6">
                            {project.description}
                        </p>

                        <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                                <MapPin size={14} />
                                {project.address || 'Toàn quốc'}
                            </span>

                            <span className="flex items-center gap-1">
                                <DollarSign size={14} />
                                {project.budgetMin?.toLocaleString()} - {project.budgetMax?.toLocaleString()}
                            </span>

                            <span className="flex items-center gap-1">
                                <Clock size={14} />
                                {new Date(project.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>

                    {/* BIDS */}
                    <div className="space-y-3">
                        <h2 className="font-semibold text-base">
                            Báo giá ({bids.length})
                        </h2>

                        {bids.map(bid => (
                            <div
                                key={bid.id}
                                className="bg-white border rounded-xl p-4 hover:shadow-sm transition"
                            >
                                <div className="flex justify-between">
                                    <div>
                                        <p className="font-semibold text-sm">
                                            {bid.contractorName}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {bid.contractorPhone}
                                        </p>
                                    </div>

                                    <div className="text-right">
                                        <p className="font-bold text-green-700 text-sm">
                                            {bid.totalPrice.toLocaleString()}đ
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {bid.estimatedDays} ngày
                                        </p>
                                    </div>
                                </div>

                                {bid.message && (
                                    <p className="text-xs text-gray-500 mt-2">
                                        {bid.message}
                                    </p>
                                )}

                                <div className="mt-3 flex justify-end">
                                    <button className="text-xs text-green-700 font-semibold">
                                        Xem chi tiết →
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT SIDEBAR */}
                <div className="space-y-4">

                    <div className="bg-white border rounded-2xl p-5 sticky top-4">
                        <p className="text-xs text-gray-400">Chủ dự án</p>
                        <p className="font-semibold text-sm">
                            {project.ownerName}
                        </p>

                        <p className="text-xs text-gray-400 mt-2">
                            {project.ownerPhone}
                        </p>

                        <button
                            onClick={() => navigate(`/projects/${id}/bid`)}
                            className="w-full mt-4 bg-green-700 text-white text-sm py-2 rounded-xl"
                        >
                            Gửi báo giá
                        </button>
                    </div>

                </div>
            </div>
        </Layout>
    );
};

export default ProjectDetailConstructorPage;