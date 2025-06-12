# CPRM - Centralized Patient & Resource Management System

<div style="display: flex; align-items: center; gap: 16px; border: 1px solid #ccc; padding: 12px; border-radius: 8px; width: fit-content;">
  <img src="./public/logo.png" alt="Logo" style="width: 80px; height: 80px; object-fit: contain; border-radius: 8px;" />
  <div style="display: flex; flex-direction: column;">
    <a href="https://cprm-prototype.vercel.app" target="_blank" style="font-weight: bold; font-size: 16px; text-decoration: none; color: #007acc;">
      🌐 cprm-prototype.vercel.app
    </a>
  </div>
</div>

## Smart Display System for Wenlock Hospital

## 📋 Overview

CPRM is a comprehensive hospital management system designed to unify 73 display screens across Wenlock Hospital's departments (Cardiology, OT, Pharmacy) into a centralized platform for real-time updates, emergency alerts, and synchronized data display.

### 🎯 Problem Addressed

- **Fragmented Display Management**: 73 screens showing disconnected information
- **No Real-time Synchronization**: OT schedules and pharmacy inventory operate independently
- **Emergency Alert Gaps**: No unified system for Code Blue/Red broadcasts
- **Department Silos**: Cardiology, OT, and Pharmacy lack integrated communication
- **Patient Privacy Concerns**: Full patient names displayed on public screens

## 🚀 Key Features

- **Smart Display Management**: Centralized control of 73 displays across departments
- **Real-Time Data Synchronization**: Instant updates across all connected systems
- **Emergency Alert System**: Code Blue/Red broadcasts with location-specific information
- **Privacy-First Design**: Token-based patient identification (P001, P002) instead of full names
- **Role-Based Access**: Different interfaces for Admin, Doctor, Nurse, Pharmacist, and Technician
- **Department Integration**: Seamless workflow between OT, Pharmacy, and Cardiology

## 👥 User Roles

- **Admin**: System management, user administration, and display control
- **Doctor**: Patient management, OT scheduling, and medical records
- **Nurse**: Token queue management and patient care coordination
- **Pharmacist**: Drug inventory and prescription management
- **Technician**: Blood bank management and display maintenance
- **Public**: Patient portal with privacy-protected information

## 🛠️ Technical Implementation

- **Frontend**: Next.js with App Router, React, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui component library
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Role-based access control
- **Real-time Updates**: Polling-based updates every 5 seconds

## 📊 Expected Outcomes

- **Display Update Time**: From 30+ minutes to 5 seconds
- **Emergency Response**: From 8 minutes to 3 minutes average
- **Medication Preparation**: 40% faster with advance OT notifications
- **Staff Coordination**: 50% reduction in miscommunication incidents
- **Patient Privacy**: 100% compliance with token-based system

## 🚀 Getting Started

### Prerequisites

- Node.js (LTS version)
- PostgreSQL database
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/gaureshpai/cprm-prototype.git
   cd cprm-prototype
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp example.env .env.local
   ```
   Edit `.env.local` with your database and authentication settings.

4. Set up the database:
   ```bash
   npx prisma migrate dev
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📚 Documentation

- [Setup Guide](Setup.md)
- [Concept Note](submission/concept-note.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Contributing Guidelines](contributing.md)
- [Security Policy](SECURITY.md)

## 🔒 Security

Please review our [Security Policy](SECURITY.md) for information on reporting vulnerabilities.

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guidelines](contributing.md) and [Code of Conduct](CODE_OF_CONDUCT.md) before submitting a pull request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.txt](LICENSE.txt) file for details.

## 🙏 Acknowledgments

- Wenlock Hospital for the opportunity to address their display management challenges