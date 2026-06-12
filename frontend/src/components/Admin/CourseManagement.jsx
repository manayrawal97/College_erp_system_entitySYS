import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Users, 
  UserPlus, 
  Calendar, 
  FileText 
} from 'lucide-react';
import { coursesApi } from '../../services/api';
import toast from 'react-hot-toast';

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await coursesApi.getAll();
      setCourses(response.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(course => 
    course.course_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.course_code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-sm border border-gray-100 dark:border-navy-700 overflow-hidden">
      <div className="p-6 border-b border-gray-100 dark:border-navy-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <BookOpen className="text-primary" />
          Course Management
        </h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-navy-900 border border-gray-100 dark:border-navy-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all text-sm font-medium shadow-lg shadow-primary/20">
            <Plus size={18} />
            Add Course
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-navy-900 text-gray-500 dark:text-gray-400 text-xs uppercase font-bold tracking-wider">
            <tr>
              <th className="px-6 py-4">Course Code</th>
              <th className="px-6 py-4">Course Name</th>
              <th className="px-6 py-4">Dept / Sem</th>
              <th className="px-6 py-4">Credits</th>
              <th className="px-6 py-4">Enrollments</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-navy-700">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan="6" className="px-6 py-4">
                    <div className="h-10 bg-gray-100 dark:bg-navy-700 rounded-lg"></div>
                  </td>
                </tr>
              ))
            ) : filteredCourses.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                  No courses found.
                </td>
              </tr>
            ) : (
              filteredCourses.map((course) => (
                <tr key={course.id} className="hover:bg-gray-50/50 dark:hover:bg-navy-700/30 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm font-bold text-primary bg-primary/5 px-2 py-1 rounded">
                      {course.course_code}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-gray-800 dark:text-white">{course.course_name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">{course.department}</p>
                    <p className="text-[10px] text-gray-400">Semester {course.semester}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium">{course.credits}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <Users size={14} className="text-gray-400" />
                      <span className="text-sm font-bold">{course.enrolled_count || 0}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all" title="Manage Enrollments">
                        <UserPlus size={16} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all" title="Manage Exams">
                        <Calendar size={16} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all" title="Manage Materials">
                        <FileText size={16} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all" title="Edit">
                        <Edit2 size={16} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CourseManagement;
