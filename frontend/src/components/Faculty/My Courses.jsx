import React from 'react';
import { BookOpen, MoreVertical } from 'lucide-react';

const MyCourses = ({ courses, setActiveSection }) => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">My Assigned Courses</h2>
                <button className="text-primary font-medium hover:underline text-sm">View All</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {courses.length > 0 ? courses.map((course) => (
                    <div key={course.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:border-primary/30 transition-colors group">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <BookOpen size={18} className="text-primary" />
                                        {course.course_code} - {course.course_name}
                                    </h3>
                                    <p className="text-gray-500 text-sm mt-1">
                                        Department: {course.department} | Section: {course.section || 'A'} | Semester: {course.semester}
                                    </p>
                                </div>
                                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">
                                    Active
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 my-6">
                                <div className="bg-gray-50 p-3 rounded-xl">
                                    <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Students</p>
                                    <p className="text-lg font-bold text-gray-900">{course.student_count || 0}/60</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-xl">
                                    <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Avg Attendance</p>
                                    <p className="text-lg font-bold text-gray-900">{course.attendance_rate || '82%'}</p>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => setActiveSection('attendance')}
                                    className="flex-1 bg-primary text-white py-2 rounded-xl text-xs font-bold hover:bg-primary-dark transition-colors"
                                >
                                    Mark Attendance
                                </button>
                                <button
                                    onClick={() => setActiveSection('grades')}
                                    className="flex-1 border border-gray-200 text-gray-700 py-2 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors"
                                >
                                    Enter Grades
                                </button>
                                <button className="p-2 border border-gray-200 text-gray-500 rounded-xl hover:bg-gray-50 transition-colors">
                                    <MoreVertical size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full py-12 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <BookOpen size={48} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500 font-medium">No courses assigned yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyCourses;
