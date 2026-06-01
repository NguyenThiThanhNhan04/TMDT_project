import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import {
  Search,
  MapPin,
  Clock,
  ArrowUpRight,
  Filter,
  DollarSign,
  User,
  Briefcase
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const ProjectMarketplacePage = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    fetchOpenProjects();
  }, []);

  const fetchOpenProjects = async () => {
    try {
      const res = await api.get('/projects/open');
      setProjects(res.data.data || []);
    } catch (err) {
      toast.error('Không thể tải dự án');
    } finally {
      setLoading(false);
    }
  };

  const goDetail = (id) => {
    navigate(`/projects-constructor/${id}`);
  };

  const formatMoney = (v) =>
    v ? `${v.toLocaleString('vi-VN')}đ` : 'Thỏa thuận';

  const filteredProjects = projects.filter((p) =>
    p.name?.toLowerCase().includes(keyword.toLowerCase())
  );

  return (
    <Layout title="Sàn dự án">
      {/* ===== HEADER SEARCH ===== */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b mb-6">
        <div className="flex flex-col md:flex-row gap-3 py-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm dự án, nội thất, xây dựng..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border bg-white shadow-sm focus:ring-2 focus:ring-[#1a4f3a] outline-none"
            />
          </div>

          <div className="flex gap-2">
            <button className="px-4 py-3 rounded-xl border hover:bg-gray-50 flex items-center gap-2">
              <Filter size={16} /> Lọc
            </button>

            <button className="px-5 py-3 rounded-xl bg-[#1a4f3a] text-white font-semibold hover:bg-[#145c42]">
              Tìm kiếm
            </button>
          </div>
        </div>
      </div>

      {/* ===== LOADING ===== */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-5 border rounded-2xl animate-pulse bg-white">
              <div className="h-4 bg-gray-200 w-1/3 mb-3 rounded"></div>
              <div className="h-6 bg-gray-200 w-2/3 mb-4 rounded"></div>
              <div className="h-4 bg-gray-200 w-full mb-2 rounded"></div>
              <div className="h-4 bg-gray-200 w-5/6 rounded"></div>
            </div>
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        /* ===== EMPTY STATE ===== */
        <div className="text-center py-20 bg-white rounded-3xl border">
          <Briefcase size={40} className="mx-auto text-gray-300 mb-3" />
          <h3 className="font-bold text-lg">Không có dự án phù hợp</h3>
          <p className="text-gray-500 text-sm mt-1">
            Hãy thử thay đổi từ khóa tìm kiếm
          </p>
        </div>
      ) : (
        /* ===== GRID ===== */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredProjects.map((p) => (
            <div
              key={p.id}
              onClick={() => goDetail(p.id)}
              className="group bg-white border rounded-2xl p-5 hover:shadow-xl transition cursor-pointer"
            >
              {/* TOP BADGE */}
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs px-3 py-1 rounded-full bg-green-50 text-green-700 font-semibold">
                  {p.category || 'Không phân loại'}
                </span>

                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock size={12} />
                  {p.createdAt
                    ? new Date(p.createdAt).toLocaleDateString('vi-VN')
                    : 'Mới'}
                </span>
              </div>

              {/* TITLE */}
              <h2 className="font-bold text-lg group-hover:text-[#1a4f3a] transition line-clamp-2">
                {p.name}
              </h2>

              {/* DESC */}
              <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                {p.description}
              </p>

              {/* META */}
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <MapPin size={14} /> {p.address || 'Toàn quốc'}
                </span>

                <span className="flex items-center gap-1 font-medium text-[#1a4f3a]">
                  <DollarSign size={14} />
                  {formatMoney(p.budgetMin)} - {formatMoney(p.budgetMax)}
                </span>
              </div>

              {/* FOOTER */}
              <div className="mt-5 pt-4 border-t flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600">
                    {p.user?.fullName?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {p.user?.fullName || 'Khách hàng'}
                    </p>
                    <p className="text-xs text-gray-400">Chủ dự án</p>
                  </div>
                </div>

                <button className="flex items-center gap-1 text-[#1a4f3a] font-semibold group-hover:gap-2 transition-all">
                  Xem chi tiết <ArrowUpRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
};

export default ProjectMarketplacePage;