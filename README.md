# CPRM Prototype - Centralized Patient & Resource Management System

The **Centralized Patient & Resource Management System (CPRM)** is a comprehensive hospital management solution developed for Wenlock Hospital as part of the UDAL Fellowship challenge. This prototype demonstrates a scalable, real-time system that connects different departments and streamlines patient care, resource management, and operational efficiency.

## 🎯 Challenge Overview

This project addresses the **inunity UDAL Fellowship** challenge requirements, focusing on:

- **Systems Design & Architecture**: Scalable system connecting Cardiology, OT, Inventory departments
- **Real-time Data Flow**: Live updates for patient queues, emergency alerts, and resource tracking
- **Backend Development**: APIs for inter-department communication and secure data storage
- **Frontend/UI Design**: Intuitive interfaces for medical staff and administrators
- **Real-Time Systems**: WebSocket integration for live updates
- **Cybersecurity & Privacy**: Role-based access controls (RBAC) and medical data compliance

## 🚀 Features

### 🔐 Authentication & Security
- **Role-based Authentication** (Admin, Doctor, Nurse, Technician, Pharmacist)
- **Secure Login System** with demo credentials
- **Route Protection** with AuthGuard components
- **Session Management** with automatic validation
- **Medical Data Privacy** compliance ready

### 👨‍⚕️ Doctor Module
- **Patient Management**: View patient records, medical history, and current status
- **Appointment Scheduling**: Today's schedule with real-time updates
- **OT Status Monitoring**: Operating theater availability and scheduling
- **Prescription Management**: Create and manage patient prescriptions
- **Emergency Alerts**: Real-time notifications for critical situations

### 👩‍⚕️ Nurse Module
- **Ward Management**: Monitor patients in assigned wards
- **Medication Administration**: Track and administer medications with safety checks
- **Vital Signs Monitoring**: Record and track patient vitals
- **Task Management**: Daily tasks with priority levels and completion tracking
- **Emergency Response**: Quick access to assistance requests

### 💊 Pharmacist Module
- **Inventory Management**: Real-time drug stock monitoring with alerts
- **Prescription Processing**: Queue management for prescription dispensing
- **Purchase Orders**: Automated reordering and supplier management
- **Stock Alerts**: Critical and low stock notifications
- **Compliance Tracking**: Medication dispensing audit trails

### 🔧 Technician Module
- **Display Network Management**: Monitor 73+ displays across hospital departments
- **System Performance**: Real-time network and hardware monitoring
- **Alert Management**: System alerts with severity levels and resolution tracking
- **Maintenance Scheduling**: Proactive maintenance and issue resolution
- **Performance Analytics**: Network uptime and response time monitoring

### ⚙️ Admin Module
- **System Overview**: Comprehensive dashboard with all department metrics
- **User Management**: Role-based user account administration
- **Emergency Broadcasting**: Hospital-wide alert and announcement system
- **Content Management**: Display content and scheduling management
- **Analytics & Reporting**: System usage and performance reports

## 🛠 Technology Stack

### Frontend
- **Next.js 15** with App Router
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **Lucide React** for icons

### Backend (Ready for Integration)
- **Next.js API Routes** for backend services
- **WebSocket** support for real-time updates
- **Database Ready**: Supabase/Neon integration prepared
- **Authentication**: JWT-ready session management

### Design System
- **inunity Branding** integration
- **Medical-focused UI/UX**
- **Responsive Design** for all devices
- **Accessibility** compliant components

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd cprm-prototype
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   # or
   yarn install
   \`\`\`

3. **Run the development server**
   \`\`\`bash
   npm run dev
   # or
   yarn dev
   \`\`\`

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Demo Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | ADM001 | admin123 |
| Doctor | DOC001 | doctor123 |
| Nurse | NUR001 | nurse123 |
| Technician | TEC001 | tech123 |
| Pharmacist | PHR001 | pharma123 |

## 📱 User Interfaces

### 🏠 Main Dashboard
- **Real-time Overview**: Patient flow, OT status, emergency alerts
- **Department Metrics**: Live statistics from all hospital departments
- **Quick Actions**: Role-based quick access buttons
- **Notification Center**: System-wide alerts and updates

### 📺 Display System
- **73+ Digital Displays**: Distributed across hospital departments
- **Content Rotation**: Automated content switching (queues, alerts, info)
- **Real-time Updates**: Live data synchronization
- **Emergency Override**: Instant emergency alert broadcasting

### 📱 Mobile Interface
- **Patient-focused**: Token tracking and department navigation
- **Emergency Contacts**: Quick access to emergency services
- **Responsive Design**: Optimized for mobile devices
- **Offline Capability**: Essential features work offline

## 🏗 System Architecture

### Frontend Architecture
\`\`\`
app/
├── (auth)/
│   └── login/              # Authentication pages
├── admin/                  # Admin dashboard and management
├── doctor/                 # Doctor interface and patient management
├── nurse/                  # Nurse ward and medication management
├── pharmacist/             # Pharmacy and inventory management
├── technician/             # System monitoring and maintenance
├── display/                # Public display interfaces
├── mobile/                 # Mobile-optimized interfaces
└── api/                    # Backend API routes
\`\`\`

### Component Structure
\`\`\`
components/
├── ui/                     # shadcn/ui base components
├── auth-guard.tsx          # Route protection
├── navbar.tsx              # Navigation system
├── emergency-alert.tsx     # Emergency alert system
├── patient-flow.tsx        # Patient queue management
└── staff-directory.tsx     # Staff information system
\`\`\`

## 🔄 Real-time Features

### WebSocket Integration (Ready)
- **Live Patient Updates**: Real-time patient status changes
- **Emergency Alerts**: Instant hospital-wide notifications
- **Queue Management**: Live patient queue updates
- **System Monitoring**: Real-time system health monitoring

### Data Synchronization
- **Cross-department Updates**: Automatic data sync between departments
- **Conflict Resolution**: Smart conflict handling for concurrent updates
- **Offline Support**: Local data caching with sync on reconnection

## 🛡 Security & Compliance

### Role-Based Access Control (RBAC)
- **Granular Permissions**: Fine-tuned access control per role
- **Data Segregation**: Department-specific data access
- **Audit Trails**: Comprehensive logging for compliance
- **Session Security**: Secure session management with timeout

### Medical Data Compliance
- **HIPAA-like Standards**: Privacy protection for Indian healthcare
- **Data Encryption**: Secure data transmission and storage
- **Access Logging**: Complete audit trail for data access
- **Consent Management**: Patient consent tracking and management

## 📊 Performance & Monitoring

### System Metrics
- **Response Time**: Average API response time monitoring
- **Uptime Tracking**: System availability monitoring
- **Error Rates**: Error tracking and alerting
- **User Analytics**: Usage patterns and optimization insights

### Display Network Monitoring
- **73+ Displays**: Real-time status of all hospital displays
- **Network Health**: Connectivity and performance monitoring
- **Content Delivery**: Successful content distribution tracking
- **Maintenance Alerts**: Proactive maintenance scheduling

## 🔮 Future Enhancements

### Phase 2 Features
- **AI-Powered Analytics**: Predictive analytics for patient flow
- **IoT Integration**: Medical device connectivity
- **Telemedicine**: Remote consultation capabilities
- **Mobile App**: Native mobile applications

### Integration Roadmap
- **Hospital Information System (HIS)**: Legacy system integration
- **Laboratory Information System (LIS)**: Lab result integration
- **Picture Archiving System (PACS)**: Medical imaging integration
- **Electronic Health Records (EHR)**: Comprehensive patient records

## 🤝 Contributing

This project is part of the UDAL Fellowship challenge. For contributions:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is developed for the UDAL Fellowship challenge and follows the terms specified in the challenge guidelines.

## 🏆 UDAL Fellowship

This prototype demonstrates the technical capabilities required for the UDAL Fellowship challenge:

- **Innovation**: Modern web technologies with real-time capabilities
- **Scalability**: Microservices-ready architecture
- **User Experience**: Intuitive interfaces for medical professionals
- **Security**: Enterprise-grade security and compliance
- **Impact**: Measurable improvements in hospital efficiency

## 📞 Contact

**Developer**: [Your Name]  
**Challenge**: UDAL Fellowship - Centralized Patient & Resource Management  
**Organization**: inunity  
**Hospital Partner**: Wenlock Hospital  

---

**Built with ❤️ for better healthcare delivery**