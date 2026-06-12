import React from 'react';
import { BarChart3, FileSpreadsheet, FileText, Download } from 'lucide-react';
import { reportsApi } from '../../services/api';
import toast from 'react-hot-toast';

const ReportCard = ({ title, icon: Icon, onExportPDF, onExportExcel }) => (
  <div className="bg-white dark:bg-navy-800 p-6 rounded-2xl border border-gray-100 dark:border-navy-700 shadow-sm hover:shadow-md transition-all">
    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4">
      <Icon size={24} />
    </div>
    <h3 className="font-bold text-gray-800 dark:text-white mb-4">{title}</h3>
    <div className="grid grid-cols-2 gap-2">
      <button 
        onClick={onExportPDF}
        className="flex items-center justify-center gap-2 px-3 py-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-lg text-xs font-bold hover:bg-rose-100 transition-all"
      >
        <FileText size={14} />
        PDF
      </button>
      <button 
        onClick={onExportExcel}
        className="flex items-center justify-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-all"
      >
        <FileSpreadsheet size={14} />
        Excel
      </button>
    </div>
  </div>
);

const ReportSection = () => {
  const handleExport = async (type, format) => {
    try {
      let response;
      const data = { format };
      
      switch (type) {
        case 'students': response = await reportsApi.exportStudents(data); break;
        case 'attendance': response = await reportsApi.exportAttendance(data); break;
        case 'fees': response = await reportsApi.exportFees(data); break;
        case 'grades': response = await reportsApi.exportGrades(data); break;
        default: return;
      }

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}-report.${format === 'pdf' ? 'pdf' : 'xlsx'}`);
      document.body.appendChild(link);
      link.click();
      toast.success(`${type} report exported successfully`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export report');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="text-primary" />
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Reports & Analytics</h2>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <ReportCard 
          title="Students Report" 
          icon={FileText} 
          onExportPDF={() => handleExport('students', 'pdf')}
          onExportExcel={() => handleExport('students', 'excel')}
        />
        <ReportCard 
          title="Attendance Report" 
          icon={BarChart3} 
          onExportPDF={() => handleExport('attendance', 'pdf')}
          onExportExcel={() => handleExport('attendance', 'excel')}
        />
        <ReportCard 
          title="Fees Report" 
          icon={Download} 
          onExportPDF={() => handleExport('fees', 'pdf')}
          onExportExcel={() => handleExport('fees', 'excel')}
        />
        <ReportCard 
          title="Grades Report" 
          icon={FileSpreadsheet} 
          onExportPDF={() => handleExport('grades', 'pdf')}
          onExportExcel={() => handleExport('grades', 'excel')}
        />
      </div>
    </div>
  );
};

export default ReportSection;
