import React from 'react';
import StudentWelcome from './StudentWelcome';
import StudentNoticeBoard from './StudentNoticeBoard';
import StudentQuickActions from './StudentQuickActions';

const StudentDashboardView = ({
    user,
    notices,
    noticesLoading,
    noticesError,
    activeCategory,
    setActiveCategory,
    setSelectedNotice,
    fetchNotices,
    formatDate,
    getRelativeTime
}) => {
    return (
        <main className="container mx-auto px-4 md:px-6 py-6 md:py-10 flex-grow">
            {/* Responsive Layout Grid using CSS Areas for precision mobile ordering */}
            <div className="dashboard-grid">
                <StudentWelcome user={user} />
                
                <StudentNoticeBoard
                    notices={notices}
                    noticesLoading={noticesLoading}
                    noticesError={noticesError}
                    activeCategory={activeCategory}
                    setActiveCategory={setActiveCategory}
                    setSelectedNotice={setSelectedNotice}
                    fetchNotices={fetchNotices}
                    formatDate={formatDate}
                    getRelativeTime={getRelativeTime}
                />
                
                <StudentQuickActions />
            </div>
            
            <style dangerouslySetInnerHTML={{
                __html: `
                    .dashboard-grid {
                        display: grid;
                        grid-template-areas: "welcome" "notices" "cards";
                        grid-template-columns: 1fr;
                    }

                    @media (min-width: 768px) {
                        .dashboard-grid {
                            grid-template-areas: "welcome notices" "cards notices";
                            grid-template-columns: 40% 60%;
                            gap: 1.5rem 2.5rem;
                        }
                    }

                    @media (min-width: 1024px) {
                        .dashboard-grid {
                            grid-template-areas: "welcome notices" "cards notices";
                            grid-template-columns: 50% 50%;
                            gap: 1.5rem 2.5rem;
                        }
                    }

                    .area-welcome { grid-area: welcome; }
                    .area-notices { grid-area: notices; }
                    .area-cards { grid-area: cards; }

                    .custom-scrollbar::-webkit-scrollbar {
                        width: 5px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: transparent;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: #e2e8f0;
                        border-radius: 20px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                        background: #cbd5e1;
                    }
                    
                    @media (max-width: 768px) {
                        .container {
                            padding-left: 1rem;
                            padding-right: 1rem;
                        }
                    }
                `
            }} />
        </main>
    );
};

export default StudentDashboardView;
