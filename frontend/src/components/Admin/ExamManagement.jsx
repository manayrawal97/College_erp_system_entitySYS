import React, { useState, useEffect } from 'react';
import { FileText, Plus, Search, Calendar, Award } from 'lucide-react';
import { gradesApi } from '../../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const ExamManagement = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await gradesApi.getExams();
      setExams(response.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching exams:', error);
      toast.error('Failed to load exams');
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-sm border border-gray-100 dark:border-navy-700 overflow-hidden">
      <div className="p-6 border-b border-gray-100 dark:border-navy-700 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <FileText className="text-primary" />
          Exam Management
        </h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all text-sm font-medium">
          <Plus size={18} />
          Create Exam
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-navy-900 text-gray-500 dark:text-gray-400 text-xs uppercase font-bold tracking-wider">
            <tr>
              <th className="px-6 py-4">Exam Name</th>
              <th className="px-6 py-4">Course</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Total Marks</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-navy-700">
            {loading ? (
              [...Array(2)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan="6" className="px-6 py-4"><div className="h-10 bg-gray-50 dark:bg-navy-900 rounded-lg"></div></td>
                </tr>
              ))
            ) : exams.length === 0 ? (
              <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-500">No exams scheduled.</td></tr>
            ) : (
              exams.map((exam) => (
                <tr key={exam.id} className="hover:bg-gray-50/50 dark:hover:bg-navy-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-gray-800 dark:text-white">{exam.exam_name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-gray-600 dark:text-gray-400">{exam.course_name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Calendar size={12} />
                      {format(new Date(exam.exam_date), 'MMM dd, yyyy')}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">{exam.total_marks}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-navy-700 text-[10px] font-bold uppercase text-gray-600 dark:text-gray-400">
                      {exam.exam_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all" title="Manage Grades">
                        <Award size={16} />
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

export default ExamManagement;
