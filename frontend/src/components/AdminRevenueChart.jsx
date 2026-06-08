import React from 'react';
import { BarChart3 } from 'lucide-react';

const formatCurrency = (amount) => {
  if (!amount) return '0đ';

  if (amount >= 1000000000) {
    return `${(amount / 1000000000).toFixed(1)} tỷ`;
  }

  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}tr`;
  }

  return `${amount.toLocaleString('vi-VN')}đ`;
};

const AdminRevenueChart = ({ data = [], period, onPeriodChange }) => {
  const maxValue = Math.max(
    1,
    ...data.flatMap((item) => [item.gmv || 0, item.platformRevenue || 0])
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-5 border-b border-gray-100 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
            <BarChart3 size={18} className="text-[#1a4f3a]" />
            Biểu đồ doanh thu nền tảng
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Doanh thu nền tảng được ước tính từ GMV và cấu hình phí hiện tại.
          </p>
        </div>

        <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
          <button
            type="button"
            onClick={() => onPeriodChange('month')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
              period === 'month'
                ? 'bg-white text-[#1a4f3a] shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Theo tháng
          </button>
          <button
            type="button"
            onClick={() => onPeriodChange('quarter')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
              period === 'quarter'
                ? 'bg-white text-[#1a4f3a] shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Theo quý
          </button>
        </div>
      </div>

      <div className="p-5">
        {data.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">
            Chưa có dữ liệu doanh thu để hiển thị.
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mb-5">
              <span className="inline-flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#1a4f3a]" />
                GMV
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                Platform Fee
              </span>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[720px]">
                <div className="flex items-end gap-4 h-64">
                  {data.map((item) => {
                    const gmvHeight = ((item.gmv || 0) / maxValue) * 100;
                    const platformHeight = ((item.platformRevenue || 0) / maxValue) * 100;

                    return (
                      <div key={item.label} className="flex-1 flex flex-col items-center justify-end h-full min-w-[56px]">
                        <div className="w-full flex items-end justify-center gap-2 h-52">
                          <div
                            className="w-4 md:w-5 rounded-t-md bg-[#1a4f3a]"
                            style={{ height: `${Math.max(gmvHeight, 4)}%` }}
                            title={`GMV: ${formatCurrency(item.gmv || 0)}`}
                          />
                          <div
                            className="w-4 md:w-5 rounded-t-md bg-amber-500"
                            style={{ height: `${Math.max(platformHeight, 4)}%` }}
                            title={`Platform Fee: ${formatCurrency(item.platformRevenue || 0)}`}
                          />
                        </div>

                        <div className="mt-3 text-[11px] font-semibold text-gray-700 text-center">
                          {item.label}
                        </div>

                        <div className="mt-1 text-[10px] text-gray-400 text-center leading-tight">
                          <div>{formatCurrency(item.gmv || 0)}</div>
                          <div>{item.transactionCount || 0} giao dịch</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminRevenueChart;
