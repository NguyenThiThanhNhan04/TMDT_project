import React, { useState, useRef, useEffect } from 'react';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import { 
  Info, 
  MapPin, 
  Banknote, 
  FileText, 
  ChevronRight, 
  ChevronLeft,
  Upload,
  X,
  File,
  LayoutTemplate
} from 'lucide-react';

const CreateProjectPage = () => {
  const [step, setStep] = useState(0);
  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    district: '',
    street: '',
    description: '',
    budgetMin: 50000000,
    budgetMax: 100000000,
    bidType: 'OPEN',
    imageUrls: []
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await api.get('/project-templates');
        if (response.data && response.data.data) {
          setTemplates(response.data.data);
        }
      } catch (error) {
        console.error('Lỗi khi lấy danh sách mẫu dự án:', error);
      } finally {
        setLoadingTemplates(false);
      }
    };
    const fetchProvinces = async () => {
      try {
        const response = await fetch('https://provinces.open-api.vn/api/?depth=2');
        const data = await response.json();
        setProvinces(data);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách tỉnh thành:', error);
      }
    };
    fetchTemplates();
    fetchProvinces();
  }, []);

  const handleCityChange = (e) => {
    const cityName = e.target.value;
    setFormData({ ...formData, city: cityName, district: '' });
    const selectedProvince = provinces.find(p => p.name === cityName);
    if (selectedProvince) {
      setDistricts(selectedProvince.districts);
    } else {
      setDistricts([]);
    }
  };

  const uploadImageToCloudinary = async (file) => {
    try {
      const cloudName = 'dtufvt361';
      const apiKey = '891517336858882';
      const apiSecret = 'Sp6F1ZaE4r4dYMi5Lo-goe6TBMQ';
      
      const timestamp = Math.round((new Date).getTime() / 1000);
      const signatureString = `timestamp=${timestamp}${apiSecret}`;
      
      // Mã hoá SHA-1 cho signature
      const encoder = new TextEncoder();
      const data = encoder.encode(signatureString);
      const hashBuffer = await crypto.subtle.digest('SHA-1', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('api_key', apiKey);
      uploadData.append('timestamp', timestamp);
      uploadData.append('signature', signature);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: uploadData,
        }
      );

      const dataRes = await response.json();
      if (!response.ok) {
        console.error('Cloudinary API Error:', dataRes);
        toast.error('Cloudinary từ chối ảnh: ' + (dataRes.error?.message || 'Không rõ nguyên nhân'));
        return null;
      }
      return dataRes.secure_url;
    } catch (error) {
      console.error('Upload ảnh thất bại (Lỗi Code/Mạng):', error);
      toast.error('Lỗi khi tải ảnh lên: ' + error.message);
      return null;
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles([...selectedFiles, ...files]);
  };

  const removeFile = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      let uploadedImageUrls = [];
      
      if (selectedFiles.length > 0) {
        toast.loading('Đang upload ảnh đính kèm...', { id: 'upload-project-images' });
        
        // Upload tuần tự từng ảnh lên Cloudinary
        for (const file of selectedFiles) {
          const url = await uploadImageToCloudinary(file);
          if (url) {
            uploadedImageUrls.push(url);
          }
        }
        
        toast.dismiss('upload-project-images');
      }

      // Ghép địa chỉ đầy đủ từ các trường con
      const fullAddress = [formData.street, formData.district, formData.city]
        .filter(Boolean)
        .join(', ');

      // Chỉ gửi các trường mà Backend ProjectRequest hỗ trợ
      const projectData = {
        name: formData.name,
        category: formData.category || null,
        area: formData.area ? Number(formData.area) : null,
        style: formData.style || null,
        address: fullAddress || formData.address || null,
        description: formData.description || null,
        budgetMin: formData.budgetMin ? Number(formData.budgetMin) : null,
        budgetMax: formData.budgetMax ? Number(formData.budgetMax) : null,
        bidType: formData.bidType || 'OPEN',
        imageUrls: [...(formData.imageUrls || []), ...uploadedImageUrls]
      };

      await api.post('/projects', projectData);
      toast.success('Đăng dự án thành công!');
      navigate('/projects');
    } catch (error) {
      console.error('Lỗi khi submit:', error);
      const errMsg = error.response?.data?.message || error.message || 'Lỗi khi tạo dự án';
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 1, label: 'Thông tin cơ bản', icon: <Info size={16} /> },
    { id: 2, label: 'Ngân sách & Đấu giá', icon: <Banknote size={16} /> },
    { id: 3, label: 'Chi tiết & Tài liệu', icon: <FileText size={16} /> },
  ];

  const handleSelectTemplate = (template) => {
    setFormData({
      ...formData,
      name: template.title,
      description: template.description,
      budgetMin: template.budgetMin,
      budgetMax: template.budgetMax,
      imageUrls: template.imageUrl ? [template.imageUrl] : []
    });
    setStep(1);
  };

  return (
    <Layout title="Tạo dự án mới">
      <div className="max-w-3xl mx-auto">
        {/* Step Indicator */}
        {step > 0 && (
          <div className="flex items-center justify-between mb-8 px-4">
            {steps.map((s, index) => (
              <React.Fragment key={s.id}>
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    step >= s.id ? 'bg-[#1a4f3a] border-[#1a4f3a] text-white' : 'bg-white border-gray-200 text-gray-300'
                  }`}>
                    {s.icon}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${
                    step >= s.id ? 'text-[#1a4f3a]' : 'text-gray-300'
                  }`}>{s.label}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${step > s.id ? 'bg-[#1a4f3a]' : 'bg-gray-200'}`}></div>
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
          {step === 0 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                  <LayoutTemplate size={32} />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Bắt đầu dự án của bạn</h2>
                <p className="text-gray-500 text-sm">Chọn một mẫu có sẵn để điền nhanh thông tin hoặc tự tạo dự án mới từ đầu.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {loadingTemplates ? (
                  <div className="col-span-3 text-center py-10 text-gray-400">Đang tải các mẫu dự án...</div>
                ) : (
                  templates.map((template) => (
                    <div 
                      key={template.id}
                      onClick={() => handleSelectTemplate(template)}
                      className="border border-gray-200 rounded-xl hover:border-primary hover:shadow-md cursor-pointer transition-all bg-white hover:bg-gray-50 group overflow-hidden flex flex-col"
                    >
                      {template.imageUrl && (
                        <div className="h-40 w-full overflow-hidden bg-gray-100">
                          <img 
                            src={template.imageUrl} 
                            alt={template.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <div className="p-5 flex-1 flex flex-col">
                        <h3 className="font-bold text-gray-800 mb-2 group-hover:text-primary transition-colors">{template.title}</h3>
                        <p className="text-xs text-gray-500 mb-4 line-clamp-3 flex-1">{template.description}</p>
                        <div className="text-xs font-semibold text-gray-700 bg-gray-50 border border-gray-100 px-3 py-2 rounded-lg inline-block w-fit mt-auto">
                          {(template.budgetMin / 1000000).toLocaleString('vi-VN')} - {(template.budgetMax / 1000000).toLocaleString('vi-VN')} Triệu VNĐ
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-500 mb-4">Hoặc</p>
                <button 
                  onClick={() => setStep(1)}
                  className="btn bg-white border-2 border-gray-200 text-gray-700 hover:border-primary hover:text-primary px-8 py-3"
                >
                  Tự nhập thông tin dự án mới
                </button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Tên dự án</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Ví dụ: Nội thất phòng khách chung cư Vinhomes"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-[#1a4f3a] focus:bg-white transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Tỉnh / Thành phố</label>
                  <select 
                    value={formData.city}
                    onChange={handleCityChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#1a4f3a] focus:bg-white"
                  >
                    <option value="">Chọn Tỉnh / Thành phố</option>
                    {provinces.map((p) => (
                      <option key={p.code} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Quận / Huyện</label>
                  <select 
                    value={formData.district}
                    onChange={(e) => setFormData({...formData, district: e.target.value})}
                    disabled={!formData.city}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#1a4f3a] focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Chọn Quận / Huyện</option>
                    {districts.map((d) => (
                      <option key={d.code} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Địa chỉ chi tiết (Số nhà, Tên đường...)</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-400"><MapPin size={18} /></span>
                  <input 
                    type="text" 
                    value={formData.street}
                    onChange={(e) => setFormData({...formData, street: e.target.value})}
                    placeholder="Ví dụ: 123 Đường Lê Lợi, Phường Bến Thành"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary focus:bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Ngân sách tối thiểu (VNĐ)</label>
                  <input 
                    type="number" 
                    value={formData.budgetMin}
                    onChange={(e) => setFormData({...formData, budgetMin: Number(e.target.value)})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold outline-none focus:border-primary focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Ngân sách tối đa (VNĐ)</label>
                  <input 
                    type="number" 
                    value={formData.budgetMax}
                    onChange={(e) => setFormData({...formData, budgetMax: Number(e.target.value)})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold outline-none focus:border-primary focus:bg-white"
                  />
                </div>
              </div>
              <p className="text-[10px] text-gray-400 italic">* Lưu ý: Dự án của bạn sẽ được công khai để tất cả nhà thầu có thể gửi báo giá cạnh tranh.</p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Mô tả chi tiết yêu cầu</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="5"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-[#1a4f3a] focus:bg-white transition-all resize-none"
                  placeholder="Mô tả về vật liệu, phong cách, thời gian mong muốn..."
                ></textarea>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Tải lên mặt bằng / Ảnh mẫu</label>
                
                {/* File Input Ẩn */}
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  multiple
                  className="hidden"
                  accept=".pdf,.png,.jpg,.jpeg"
                />

                <div 
                  onClick={() => fileInputRef.current.click()}
                  className="border-2 border-dashed border-gray-200 rounded-2xl p-10 flex flex-col items-center gap-2 bg-gray-50 hover:bg-gray-100 hover:border-[#1a4f3a]/30 transition-all cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400">
                    <Upload size={24} />
                  </div>
                  <p className="text-sm font-medium text-gray-600">Nhấn để chọn hoặc kéo thả file</p>
                  <p className="text-[10px] text-gray-400">PDF, PNG, JPG lên đến 10MB</p>
                </div>

                {/* Danh sách file đã chọn */}
                {selectedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded-lg text-primary"><File size={16} /></div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
                            <p className="text-[10px] text-gray-400">{(file.size / 1024).toFixed(0)} KB</p>
                          </div>
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                          className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {step > 0 && (
          <div className="flex items-center justify-between px-4">
            <button 
              onClick={() => setStep(s => s - 1)}
              className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-800"
            >
              <ChevronLeft size={18} /> Quay lại
            </button>
            
            {step < 3 ? (
              <button 
                onClick={() => setStep(s => s + 1)}
                className="btn btn-primary px-8 py-3 flex items-center gap-2 shadow-lg shadow-[#1a4f3a]/20"
              >
                Tiếp theo <ChevronRight size={18} />
              </button>
            ) : (
              <button 
                onClick={handleSubmit}
                disabled={loading}
                className="btn btn-primary px-10 py-3 shadow-lg shadow-[#1a4f3a]/20"
              >
                {loading ? 'Đang đăng bài...' : 'Đăng dự án ngay'}
              </button>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CreateProjectPage;
