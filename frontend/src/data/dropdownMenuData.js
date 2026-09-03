// Official IIT Bombay Navigational Data for EntitySYS Dropdown Menu
// Data Source: https://www.iitb.ac.in/

export const dropdownMenuData = [
    {
        title: "About Institute",
        icon: "landmark",
        description: "Explore IIT Bombay's legacy, leadership, and campus vision.",
        items: [
            {
                name: "Overview & Legacy",
                path: "/about-overview",
                desc: "Established in 1958, an Institute of Eminence in Powai, Mumbai.",
                detail: "IIT Bombay was founded in 1958 with assistance from UNESCO and the Soviet Union. Declared an Institute of National Importance in 1961 and granted Institute of Eminence status in 2018."
            },
            {
                name: "Leadership & Director",
                path: "/leadership",
                desc: "Board of Governors, Director's Office, and Deans.",
                detail: "Guided by the Board of Governors and Director Prof. Shireesh Kedare, overseeing 17 academic departments, 35+ centers, and administrative divisions."
            },
            {
                name: "Heritage & Milestones",
                path: "/heritage",
                desc: "65+ years of pioneering scientific and technical education.",
                detail: "Over 65 years of academic leadership, graduating 65,000+ alumni driving global technology and entrepreneurship."
            },
            {
                name: "Contact & Location",
                path: "/location-contact",
                desc: "Powai Campus map, visitors' info, and directory.",
                detail: "Located in Powai, Mumbai - 545 acres bordered by Powai and Vihar Lakes. Easily accessible from CSMI Airport Mumbai."
            }
        ]
    },
    {
        title: "Academics",
        icon: "book",
        description: "Departments, degree programs, and academic server portal.",
        items: [
            {
                name: "Departments & Schools",
                path: "/departments",
                desc: "17 Engineering, Science & Management departments.",
                detail: "Including Computer Science (CSE), Electrical, Mechanical, Aerospace, Chemical, SJMSOM (Management), and IDC (Design)."
            },
            {
                name: "Degree Programs",
                path: "/degree-programs",
                desc: "B.Tech, B.S., M.Tech, M.Sc, M.Des, MBA & Ph.D.",
                detail: "Offering 50+ undergraduate, postgraduate, dual-degree, and doctoral programs across engineering and interdisciplinary fields."
            },
            {
                name: "ASC Academic Server",
                path: "/asc-portal",
                desc: "Integrated ERP for course registration, grades & transcripts.",
                detail: "Academic Server Cell (ASC) manages real-time course registration, semester credit allocations, student grade sheets, and automated transcripts."
            },
            {
                name: "Central Library",
                path: "/central-library",
                desc: "Central Library with 500,000+ print and digital resources.",
                detail: "Equipped with automated RFID circulation, access to IEEE, ScienceDirect, Springer journals, and 24/7 digital learning spaces."
            }
        ]
    },
    {
        title: "Admissions",
        icon: "graduation",
        description: "Admission procedures, eligibility, and fee structure.",
        items: [
            {
                name: "UG Admissions (JEE)",
                path: "/ug-admissions",
                desc: "Admission to B.Tech, B.S., and B.Des via JEE Advanced.",
                detail: "Admissions to B.Tech and Dual Degree programs through JEE Advanced and JoSAA counseling for top rankers."
            },
            {
                name: "PG Admissions (GATE/JAM)",
                path: "/pg-admissions",
                desc: "M.Tech, M.Sc, M.Des, and MBA admissions.",
                detail: "Admissions through GATE (M.Tech), JAM (M.Sc), CEED (M.Des), and CAT (MBA at SJMSOM) with COAP portal coordination."
            },
            {
                name: "Doctoral (Ph.D.) Admissions",
                path: "/phd-admissions",
                desc: "Ph.D. research fellowships across all departments.",
                detail: "Bi-annual Ph.D. admissions with Teaching Assistantships (TA), Research Assistantships (RA), and Prime Minister Research Fellowship (PMRF)."
            },
            {
                name: "Fees & Scholarships",
                path: "/fees-scholarships",
                desc: "Academic fee structure, merit & SC/ST scholarships.",
                detail: "Comprehensive fee structure with Merit-cum-Means (MCM) scholarships, fee concessions, and education loan assistance."
            }
        ]
    },
    {
        title: "Research & R&D",
        icon: "research",
        description: "Industrial research, startup incubator, and research parks.",
        items: [
            {
                name: "IRCC Research Projects",
                path: "/ircc-research",
                desc: "₹350+ Cr annual sponsored research & consultancy.",
                detail: "Industrial Research and Consultancy Centre (IRCC) coordinates 1,000+ active projects funded by DST, ISRO, DRDO, and global industry partners."
            },
            {
                name: "SINE Startup Incubator",
                path: "/sine-incubator",
                desc: "Society for Innovation and Entrepreneurship backing 200+ startups.",
                detail: "SINE provides incubation, seed funding, patent support, and laboratory space for deep-tech student and faculty spin-offs."
            },
            {
                name: "IITB Research Park",
                path: "/research-park",
                desc: "Corporate R&D hub for technology innovation.",
                detail: "Connecting industry giants with faculty and student talent for co-located research, prototype development, and patent creation."
            },
            {
                name: "IITB-Monash Academy",
                path: "/monash-academy",
                desc: "Joint PhD research partnership with Monash University.",
                detail: "Collaborative research academy offering dual PhD degrees jointly supervised by IIT Bombay and Monash University, Australia."
            }
        ]
    },
    {
        title: "Campus Life",
        icon: "trophy",
        description: "Hostels, student activities, festivals, and career placements.",
        items: [
            {
                name: "Placement Office",
                path: "/placement-office",
                desc: "95%+ Placement rate with 360+ top recruiters.",
                detail: "Central Placement Office coordinating campus recruitment for domestic and international offers with ₹23.5 LPA average package."
            },
            {
                name: "Hostels & Dining",
                path: "/hostels-facilities",
                desc: "18 On-campus residential hostels and mess facilities.",
                detail: "Self-contained student residential ecosystem with high-speed internet, sports rooms, 24/7 night canteens, and dining halls."
            },
            {
                name: "Mood Indigo & Techfest",
                path: "/festivals-events",
                desc: "Asia's largest cultural and science festivals.",
                detail: "Annual flagship events attracting 100,000+ participants from across India and international universities."
            },
            {
                name: "Student Gymkhana",
                path: "/student-gymkhana",
                desc: "Sports complex, swimming pools, and cultural clubs.",
                detail: "Hub for student governance, athletic competitions, music, drama, robotics, and astronomy clubs."
            }
        ]
    }
];

// Helper to lookup menu item details by route path
export const getMenuItemByPath = (path) => {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    for (const menu of dropdownMenuData) {
        const item = menu.items.find(i => i.path === cleanPath);
        if (item) {
            return { ...item, category: menu.title };
        }
    }
    // Fallback default item
    return {
        name: "IIT Bombay Academic Portal",
        path: cleanPath,
        desc: "Institutional information and academic services.",
        detail: "Welcome to the EntitySYS institutional portal powered by authentic IIT Bombay data and digital governance systems.",
        category: "Information"
    };
};
