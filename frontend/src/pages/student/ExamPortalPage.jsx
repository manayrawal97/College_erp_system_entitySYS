import React from 'react';
import StudentPageLayout from '../../components/Student/StudentPageLayout';
import StudentExamPortal from '../../components/Student/StudentExamPortal';

const ExamPortalPage = () => {
    return (
        <StudentPageLayout>
            <StudentExamPortal />
        </StudentPageLayout>
    );
};

export default ExamPortalPage;
