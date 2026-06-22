import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, FileSpreadsheet, FileText, Download } from 'lucide-react';
import { reportsApi } from '../../services/api';
import toast from 'react-hot-toast';

const ReportCard = ({ title, icon: Icon, onExportPDF, onExportExcel }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col items-center sm:items-start text-center sm:text-left">
    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4 border border-primary/10 shadow-inner">
      <Icon size={24} />
    </div>
    <h3 className="font-bold text-gray-900 mb-4 leading-tight">{title}</h3>
    <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 w-full">
      <button 
        onClick={onExportPDF}
        className="flex items-center justify-center gap-2 px-4 py-3 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-100 transition-all min-h-[44px] cursor-pointer"
      >
        <FileText size={16} />
        PDF
      </button>
      <button 
        onClick={onExportExcel}
        className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-all min-h-[44px] cursor-pointer"
      >
        <FileSpreadsheet size={16} />
        Excel
      </button>
    </div>
  </div>
);

const ReportSection = ({ isDashboard = false }) => {
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

  const reportsData = [
    { id: 'students', title: 'Students Report', icon: FileText },
    { id: 'attendance', title: 'Attendance Report', icon: BarChart3 },
    { id: 'fees', title: 'Fees Report', icon: Download },
    { id: 'grades', title: 'Grades Report', icon: FileSpreadsheet }
  ];

  const displayedReports = isDashboard ? reportsData.slice(0, 3) : reportsData;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 className="text-primary shrink-0" />
          Reports & Analytics
        </h2>
        {isDashboard && (
          <Link to="/admin/reports" className="text-sm text-primary hover:underline font-bold">
            See More Reports →
          </Link>
        )}
      </div>
      
      <div className="p-4 sm:p-6">
        <div className={`grid grid-cols-1 sm:grid-cols-2 ${isDashboard ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-4 sm:gap-6`}>
          {displayedReports.map((report) => (
            <ReportCard 
              key={report.id}
              title={report.title} 
              icon={report.icon} 
              onExportPDF={() => handleExport(report.id, 'pdf')}
              onExportExcel={() => handleExport(report.id, 'excel')}
            />
          ))}
        </div>
      </div>

      {isDashboard && reportsData.length > 3 && (
        <div className="p-4 border-t border-gray-100 flex justify-center bg-gray-50/20">
          <Link to="/admin/reports" className="text-primary hover:text-primary/80 font-bold text-sm flex items-center gap-1 transition-all">
            See More Reports (Total {reportsData.length}) →
          </Link>
        </div>
      )}
    </div>
  );
};

export default ReportSection;
