import React from 'react';
import StudentPageLayout from '../../components/Student/StudentPageLayout';
import StudentAttendance from '../../components/Student/StudentAttendance';

const AttendancePage = () => {
    return (
        <StudentPageLayout>
            <StudentAttendance />
        </StudentPageLayout>
    );
};

export default AttendancePage;
