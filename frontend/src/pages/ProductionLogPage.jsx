import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { ChevronRight, Hammer, MapPin, Loader2, LayoutGrid, ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const STATUS_LABEL = {
    IN_PROGRESS: { label: 'Đang thi công', cls: 'bg-blue-50 text-blue-600 border-blue-100' },
    COMPLETED: { label: 'Hoàn thành', cls: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    PENDING: { label: 'Chờ xử lý', cls: 'bg-gray-50 text-gray-500 border-gray-200' },
};

const ProductionLogPage = () => {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchJobs(); }, []);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const res = await api.get('/contracts/jobs');
            setJobs(res.data.data || []);
            console.log(res.data.data)
        } catch {
            toast.error('Không thể tải danh sách dự án');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout title="Nhật ký thi công">
            <div className="max-w-5xl mx-auto space-y-5 pb-8">

                <div>
                    <h1 className="text-xl font-bold text-gray-900 tracking-tight">Dự án đang thi công</h1>
                    <p className="text-xs text-gray-400 mt-1">
                        Theo dõi và cập nhật tiến độ thi công các công trình của bạn
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-24">
                        <Loader2 size={32} className="animate-spin text-[#1a4f3a]" />
                    </div>
                ) : jobs.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
                        <Hammer size={36} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-xs text-gray-400 font-medium">
                            Bạn chưa có dự án nào đang thi công.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {jobs.map((job) => {
                            const progress = job.totalProgress ?? 0;
                            const status = STATUS_LABEL[job.status] ?? { label: job.status, cls: 'bg-gray-50 text-gray-500 border-gray-200' };
                            const coverImage = job.imageUrls?.[0];

                            return (
                                <div
                                    key={job.jobId}
                                    onClick={() => navigate(`/production-log/${job.jobId}`)}
                                    className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all cursor-pointer group overflow-hidden"
                                >
                                    <div className="flex flex-col sm:flex-row">

                                        {/* PROJECT IMAGE */}
                                        <div className="sm:w-44 h-40 sm:h-auto shrink-0 bg-gray-100 overflow-hidden">
                                            {coverImage ? (
                                                <img
                                                    src={coverImage}
                                                    alt={job.projectName}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <ImageIcon size={28} className="text-gray-300" />
                                                </div>
                                            )}
                                        </div>

                                        {/* CONTENT */}
                                        <div className="flex-1 p-4 flex flex-col justify-between">
                                            <div>
                                                {/* BADGES */}
                                                <div className="flex flex-wrap items-center gap-1.5 mb-2">
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-[#1a4f3a] rounded-md text-[10px] font-bold uppercase tracking-wider border border-emerald-100">
                                                        <LayoutGrid size={10} /> {job.category}
                                                    </span>
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${status.cls}`}>
                                                        {status.label}
                                                    </span>
                                                    {job.imageUrls?.length > 1 && (
                                                        <span className="text-[10px] text-gray-400 bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded">
                                                            +{job.imageUrls.length - 1} ảnh
                                                        </span>
                                                    )}
                                                </div>

                                                {/* TITLE */}
                                                <h3 className="font-bold text-base text-gray-800 group-hover:text-[#1a4f3a] transition-colors leading-snug mb-1">
                                                    {job.projectName}
                                                </h3>

                                                {/* ADDRESS */}
                                                {job.address && (
                                                    <p className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                                                        <MapPin size={12} className="shrink-0 text-gray-400" />
                                                        <span className="truncate">{job.address}</span>
                                                    </p>
                                                )}

                                                {/* DESCRIPTION */}
                                                {job.description && (
                                                    <p className="text-xs text-gray-400 line-clamp-1">{job.description}</p>
                                                )}
                                            </div>

                                            {/* PROGRESS + ACTION */}
                                            <div className="mt-3">
                                                <div className="flex justify-between items-center mb-1 text-xs">
                                                    <span className="text-gray-400 font-medium">Tiến độ kế hoạch</span>
                                                    <span className="font-bold text-[#1a4f3a]">{progress}%</span>
                                                </div>
                                                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden mb-3">
                                                    <div
                                                        className="bg-[#1a4f3a] h-2 rounded-full transition-all duration-500"
                                                        style={{ width: `${progress}%` }}
                                                    />
                                                </div>
                                                <div className="flex justify-end">
                                                    <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#1a4f3a] bg-emerald-50/60 group-hover:bg-[#1a4f3a] group-hover:text-white transition-all">
                                                        Xem chi tiết
                                                        <ChevronRight size={13} />
                                                    </button>
                                                </div>
                                            </div>
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

export default ProductionLogPage;
