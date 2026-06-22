import React from 'react';
import StudentPageLayout from '../../components/Student/StudentPageLayout';
import StudentLMS from '../../components/Student/StudentLMS';

const LMSPage = () => {
    return (
        <StudentPageLayout>
            <StudentLMS />
        </StudentPageLayout>
    );
};

export default LMSPage;
