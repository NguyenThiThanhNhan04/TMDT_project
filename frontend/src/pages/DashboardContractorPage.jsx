import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import {
    TrendingUp,
    Wallet,
    ClipboardList,
    CheckCircle2,
    Eye,
    CalendarDays,
    PlusCircle,
    ArrowRight
} from 'lucide-react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ icon, label, value }) => (
    <div className="bg-white p-5 rounded-2xl border shadow-sm">
        <div className="flex items-center gap-2 text-gray-500 text-xs uppercase mb-3">
            {icon}
            {label}
        </div>
        <div className="text-2xl font-bold text-gray-800">{value}</div>
    </div>
);

const DashboardContractorPage = () => {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [wallet, setWallet] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [j, w] = await Promise.all([
                api.get('/contracts/jobs'),
                api.get('/wallet')
            ]);
            setJobs(j.data.data || []);
            setWallet(w.data.data);
        } finally {
            setLoading(false);
        }
    };

    const format = (v) =>
        v ? v.toLocaleString('vi-VN') + 'đ' : '0đ';

    const getStatusColor = (status) => {
        switch (status) {
            case 'IN_PROGRESS':
                return 'bg-amber-50 text-amber-700';
            case 'COMPLETED':
                return 'bg-green-50 text-green-700';
            default:
                return 'bg-gray-50 text-gray-600';
        }
    };

    if (loading) {
        return (
            <Layout title="Dashboard">
                <div className="h-64 flex items-center justify-center text-sm text-gray-400">
                    Loading...
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="Workspace">

            {/* STATS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

                <StatCard
                    icon={<TrendingUp size={14} />}
                    label="Đang làm"
                    value={jobs.filter(j => j.status === 'IN_PROGRESS').length}
                />

                <StatCard
                    icon={<Wallet size={14} />}
                    label="Số dư"
                    value={format(wallet?.balance)}
                />

                <StatCard
                    icon={<ClipboardList size={14} />}
                    label="Chờ nhận"
                    value={format(wallet?.lockedAmount)}
                />

                <StatCard
                    icon={<CheckCircle2 size={14} />}
                    label="Hoàn thành"
                    value={jobs.filter(j => j.status === 'COMPLETED').length}
                />
            </div>

            {/* JOB LIST */}
            <div className="bg-white border rounded-2xl overflow-hidden">

                <div className="p-5 border-b">
                    <h2 className="font-bold text-base">Dự án của bạn</h2>
                    <p className="text-xs text-gray-400">
                        Workspace quản lý công việc
                    </p>
                </div>

                {jobs.length === 0 ? (
                    <div className="p-16 text-center text-gray-400 text-sm">
                        Chưa có dự án nào
                    </div>
                ) : (
                    <div className="divide-y">

                        {jobs.map(job => (
                            <div
                                key={job.jobId}
                                className="p-5 hover:bg-gray-50 transition"
                            >

                                {/* HEADER */}
                                <div className="flex justify-between items-start mb-3">

                                    <div>
                                        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${getStatusColor(job.status)}`}>
                                            {job.status}
                                        </span>

                                        <h3 className="font-bold text-base mt-2">
                                            {job.projectName}
                                        </h3>
                                    </div>

                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                        <CalendarDays size={12} />
                                        {new Date(job.createdAt).toLocaleDateString('vi-VN')}
                                    </span>

                                </div>

                                {/* INFO */}
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">

                                    <div>
                                        <p className="text-xs text-gray-400">Khách hàng</p>
                                        <p className="font-medium">{job.customerName}</p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-400">Danh mục</p>
                                        <p className="font-medium">{job.category}</p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-400">Giá trị</p>
                                        <p className="font-bold text-[#1a4f3a]">
                                            {format(job.agreedPrice)}
                                        </p>
                                    </div>
                                </div>

                                {/* ACTIONS */}
                                <div className="flex gap-2 mt-4">

                                    <button
                                        onClick={() => navigate(`/contractor/jobs/${job.jobId}`)}
                                        className="px-4 py-2 text-sm border rounded-xl flex items-center gap-1"
                                    >
                                        <Eye size={14} />
                                        Chi tiết
                                    </button>

                                    {!job.hasPlan && (
                                        <button
                                            onClick={() =>
                                                navigate(`/contractor/jobs/${job.jobId}/plan`)
                                            }
                                            className="px-4 py-2 text-sm bg-[#1a4f3a] text-white rounded-xl flex items-center gap-1"
                                        >
                                            <PlusCircle size={14} />
                                            Kế hoạch
                                        </button>
                                    )}

                                    {job.planApproved && (
                                        <button
                                            onClick={() =>
                                                navigate(`/contractor/jobs/${job.jobId}/progress`)
                                            }
                                            className="px-4 py-2 text-sm bg-amber-500 text-white rounded-xl"
                                        >
                                            Tiến độ
                                        </button>
                                    )}

                                </div>

                            </div>
                        ))}
                    </div>
                )}
            </div>

        </Layout>
    );
};

export default DashboardContractorPage;