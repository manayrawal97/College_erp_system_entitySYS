import React from 'react';
import StudentPageLayout from '../../components/Student/StudentPageLayout';
import AdmissionDetails from '../../components/Student/AdmissionDetails';

const AdmissionPage = () => {
    return (
        <StudentPageLayout>
            <AdmissionDetails />
        </StudentPageLayout>
    );
};

export default AdmissionPage;
