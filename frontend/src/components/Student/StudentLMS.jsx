import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Download, FileText, Calendar, User, HelpCircle, Loader2 } from 'lucide-react';
import studentService from '../../services/studentService';
import toast from 'react-hot-toast';

const StudentLMS = () => {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('all');

    useEffect(() => {
        fetchMaterials();
    }, []);

    const fetchMaterials = async () => {
        try {
            setLoading(true);
            const response = await studentService.getCourseMaterials();
            if (response.data.success) {
                setMaterials(response.data.data);
            }
        } catch (err) {
            console.error(err);
            setError('Failed to fetch course materials.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = (fileUrl, title) => {
        toast.success(`Downloading ${title}...`);
        const backendUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';
        const link = document.createElement('a');
        link.href = `${backendUrl}${fileUrl}`;
        link.setAttribute('target', '_blank');
        link.setAttribute('download', fileUrl.split('/').pop());
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Filter course codes dynamically for tab selection
    const courseCodes = ['all', ...new Set(materials.map(m => m.course_code))];

    const filteredMaterials = materials.filter(item => {
        const matchesSearch = 
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.course_name.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesCourse = selectedCourse === 'all' || item.course_code === selectedCourse;

        return matchesSearch && matchesCourse;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-secondary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-20 bg-red-50 rounded-3xl border border-dashed border-red-200 p-6">
                <HelpCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 font-bold">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            {/* Header + Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 leading-tight">Learning Management (LMS)</h2>
                    <p className="text-gray-500 font-bold mt-1">Access lecture notes, syllabus blueprints, and uploaded coursework.</p>
                </div>
                
                {/* Search Bar */}
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                        type="text"
                        placeholder="Search materials..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-150 rounded-2xl outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-sm font-bold text-gray-800"
                    />
                </div>
            </div>

            {/* Course Filter Tabs */}
            {courseCodes.length > 1 && (
                <div className="flex flex-wrap gap-2 pb-2">
                    {courseCodes.map(code => (
                        <button
                            key={code}
                            onClick={() => setSelectedCourse(code)}
                            className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer border ${
                                selectedCourse === code 
                                    ? 'bg-secondary text-white border-secondary shadow-lg shadow-secondary/15' 
                                    : 'bg-white text-gray-600 border-gray-100 hover:border-gray-200'
                            }`}
                        >
                            {code.toUpperCase()}
                        </button>
                    ))}
                </div>
            )}

            {/* LMS Materials List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredMaterials.length === 0 ? (
                    <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-gray-150">
                        <BookOpen size={48} className="text-gray-200 mx-auto mb-4" />
                        <h4 className="text-lg font-black text-gray-900 mb-1">No Materials Found</h4>
                        <p className="text-sm text-gray-400 font-bold">No lecture uploads match your current filters.</p>
                    </div>
                ) : (
                    filteredMaterials.map(mat => (
                        <div 
                            key={mat.id} 
                            className="bg-white rounded-3xl border border-gray-100 p-6 flex flex-col justify-between hover:shadow-xl transition-all group"
                        >
                            <div>
                                {/* Category Badge + Date */}
                                <div className="flex items-center justify-between gap-3 mb-4">
                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                                        mat.file_type === 'syllabus' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                        mat.file_type === 'assignment' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                        'bg-blue-50 text-blue-600 border-blue-100'
                                    }`}>
                                        {mat.file_type || 'notes'}
                                    </span>
                                    <span className="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-1">
                                        <Calendar size={12} />
                                        {mat.uploaded_at ? new Date(mat.uploaded_at).toLocaleDateString() : 'Just now'}
                                    </span>
                                </div>

                                <h3 className="text-lg font-black text-gray-900 mb-1 leading-tight group-hover:text-secondary transition-colors">
                                    {mat.title}
                                </h3>
                                <p className="text-xs text-secondary font-black uppercase tracking-wider mb-3">
                                    {mat.course_code} : {mat.course_name}
                                </p>
                                <p className="text-sm text-gray-500 mb-6 line-clamp-2 leading-relaxed">
                                    {mat.description || 'No description provided by faculty.'}
                                </p>
                            </div>

                            {/* Footer: Uploaded by + Download */}
                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary text-[10px] font-bold">
                                        {mat.uploaded_by ? mat.uploaded_by.charAt(0) : 'F'}
                                    </div>
                                    <div>
                                        <p className="text-[9px] text-gray-400 font-black uppercase">Faculty</p>
                                        <p className="text-xs font-bold text-gray-700">{mat.uploaded_by || 'Professor'}</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleDownload(mat.file_url, mat.title)}
                                    className="flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-100 rounded-xl text-xs font-black cursor-pointer transition-colors"
                                >
                                    <Download size={14} />
                                    Download Doc
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default StudentLMS;
