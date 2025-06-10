# UDAL - Centralized Patient & Resource Management System
## Concept Note

### Problem Statement
Wenlock Hospital faces fragmented communication across departments, with no unified platform to manage OT schedules, display real-time updates, or broadcast emergency alerts despite having 73 display screens and existing systems.

### Solution Overview
Our Centralized Patient & Resource Management System (CPRM) creates a unified digital ecosystem that connects all hospital departments and displays through a modular web application. The system synchronizes critical data in real-time, including patient queues, OT schedules, drug inventory, blood bank status, and emergency alerts.

### Key Components

#### 1. Unified Dashboard
- **Central Control Hub**: Administrators can monitor and manage all hospital resources from a single interface
- **Role-Based Access**: Specialized views for doctors, nurses, pharmacists, and technicians
- **Real-Time Updates**: All data changes propagate instantly across the system

#### 2. Smart Display Management
- **Content Rotation**: Displays automatically cycle between patient queues, OT status, and other relevant information
- **Emergency Override**: Critical alerts immediately appear on all screens when triggered
- **Location-Aware Content**: Displays show content relevant to their physical location

#### 3. Department Synchronization
- **OT-Pharmacy Integration**: Surgery schedules trigger inventory checks to ensure medication availability
- **Token Queue System**: Patient flow is tracked across departments with estimated wait times
- **Resource Allocation**: Staff can see where resources are needed most urgently

#### 4. Emergency Response System
- **Code Broadcasting**: Emergency codes (Blue/Red/etc.) appear on all displays with location information
- **Alert Management**: Administrators can trigger, monitor, and clear alerts from the admin panel
- **Response Coordination**: System tracks response times and resource allocation during emergencies

### Technical Implementation

#### Architecture
- **Frontend**: Next.js with React components and Tailwind CSS for responsive design
- **Backend**: Next.js API routes and server actions for data processing
- **Data Storage**: Currently using CSV files, with database integration planned
- **Real-Time Updates**: Fetch data every 5 seconds directly from the database

#### Data Flow
1. Department systems generate data (patient arrivals, inventory changes, etc.)
2. CPRM system processes and normalizes this data
3. Updates are pushed to all relevant displays and user dashboards
4. User actions trigger further updates across the system

### Key Challenges Addressed

1. **Information Silos**: By centralizing all data, we eliminate the fragmentation between departments
2. **Emergency Response**: Critical alerts now reach all staff simultaneously through the display network
3. **Resource Optimization**: Real-time inventory tracking prevents shortages and optimizes ordering
4. **Patient Experience**: Token system with accurate wait times improves patient satisfaction
5. **Staff Efficiency**: Doctors and nurses spend less time searching for information and more time on patient care

### Implementation Roadmap

1. **Phase 1**: Core dashboard and display system with CSV data integration (current prototype)
2. **Phase 2**: Database integration and real-time synchronization via WebSockets
3. **Phase 3**: Mobile application for staff and expanded administrative tools
4. **Phase 4**: Integration with existing hospital systems (EHR, PACS, etc.)

### Privacy & Security Considerations
- Patient information is anonymized on public displays (using initials or token IDs)
- Role-based access ensures staff only see information relevant to their responsibilities
- All emergency alerts include only essential information needed for response

### Conclusion
The UDAL Centralized Patient & Resource Management System transforms Wenlock Hospital's fragmented displays into a cohesive information network that improves communication, enhances patient care, and optimizes resource utilization. By connecting departments that previously operated in isolation, we create a more efficient and responsive healthcare environment.