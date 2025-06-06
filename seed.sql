INSERT INTO users (id, username, email, name, role, department, permissions, "createdAt", "updatedAt") VALUES
('clhk2m3n40000356c8l2x9q1a', 'ADM001', 'admin@hospital.com', 'Admin User', 'ADMIN', 'Administration', ARRAY['manage_users', 'view_reports', 'system_config'], NOW(), NOW()),
('clhk2m3n40001356c8l2x9q1b', 'DOC001', 'sharath@hospital.com', 'Dr. Sharath Kumar', 'DOCTOR', 'Cardiology', ARRAY['prescribe', 'view_patients', 'create_appointments'], NOW(), NOW()),
('clhk2m3n40002356c8l2x9q1c', 'NUR001', 'priya@hospital.com', 'Nurse Priya', 'NURSE', 'General Ward', ARRAY['view_patients', 'update_records'], NOW(), NOW()),
('clhk2m3n40003356c8l2x9q1d', 'TEC001', 'tech@hospital.com', 'Tech Support', 'TECHNICIAN', 'IT Department', ARRAY['system_maintenance', 'display_management'], NOW(), NOW()),
('clhk2m3n40004356c8l2x9q1e', 'PHR001', 'pharmacist@hospital.com', 'Pharmacist Kumar', 'PHARMACIST', 'Pharmacy', ARRAY['manage_inventory', 'dispense_drugs'], NOW(), NOW())
ON CONFLICT (username) DO NOTHING;

INSERT INTO departments (id, department_name, location, current_tokens, avg_wait_time) VALUES
('clhk2m3n40005356c8l2x9q1f', 'Cardiology', 'Block A - Floor 2', 5, 45),
('clhk2m3n40006356c8l2x9q1g', 'Orthopedics', 'Block B - Floor 1', 8, 30),
('clhk2m3n40007356c8l2x9q1h', 'Pediatrics', 'Block C - Floor 1', 12, 25),
('clhk2m3n40008356c8l2x9q1i', 'Emergency', 'Block A - Ground Floor', 3, 15),
('clhk2m3n40009356c8l2x9q1j', 'Pharmacy', 'Block A - Ground Floor', 0, 10)
ON CONFLICT (id) DO NOTHING;

INSERT INTO drug_inventory (id, drug_name, stock_qty, reorder_level, status, category, last_updated) VALUES
('clhk2m3n4000a356c8l2x9q1k', 'Paracetamol 500mg', 2500, 500, 'available', 'Analgesic', NOW()),
('clhk2m3n4000b356c8l2x9q1l', 'Amoxicillin 250mg', 150, 200, 'low', 'Antibiotic', NOW()),
('clhk2m3n4000c356c8l2x9q1m', 'Insulin Injection', 45, 100, 'critical', 'Hormone', NOW()),
('clhk2m3n4000d356c8l2x9q1n', 'Aspirin 75mg', 1800, 300, 'available', 'Antiplatelet', NOW()),
('clhk2m3n4000e356c8l2x9q1o', 'Atenolol 50mg', 320, 200, 'available', 'Beta Blocker', NOW()),
('clhk2m3n4000f356c8l2x9q1p', 'Metformin 500mg', 680, 150, 'available', 'Antidiabetic', NOW()),
('clhk2m3n4000g356c8l2x9q1q', 'Lisinopril 10mg', 420, 100, 'available', 'ACE Inhibitor', NOW()),
('clhk2m3n4000h356c8l2x9q1r', 'Omeprazole 20mg', 890, 200, 'available', 'Proton Pump Inhibitor', NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO patients (id, name, age, gender, phone, address, condition, status, "createdAt", "updatedAt") VALUES
('clhk2m3n4000i356c8l2x9q1s', 'Rajesh Kumar', 45, 'Male', '+91 98765 43210', '123 MG Road, Mangalore', 'Hypertension', 'Active', NOW(), NOW()),
('clhk2m3n4000j356c8l2x9q1t', 'Priya Sharma', 32, 'Female', '+91 87654 32109', '456 Car Street, Mangalore', 'Pregnancy - 28 weeks', 'Active', NOW(), NOW()),
('clhk2m3n4000k356c8l2x9q1u', 'Mohammed Ali', 28, 'Male', '+91 76543 21098', '789 Lighthouse Hill, Mangalore', 'Fractured Radius', 'Active', NOW(), NOW()),
('clhk2m3n4000l356c8l2x9q1v', 'Sunita Rao', 55, 'Female', '+91 65432 10987', '321 Kadri Hills, Mangalore', 'Diabetes Type 2', 'Active', NOW(), NOW()),
('clhk2m3n4000m356c8l2x9q1w', 'Arjun Shetty', 38, 'Male', '+91 54321 09876', '654 Bejai, Mangalore', 'Chronic Back Pain', 'Active', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO blood_bank (id, blood_type, units_available, critical_level, status, expiry_date) VALUES
('clhk2m3n4000n356c8l2x9q1x', 'A+', 25, 10, 'available', '2025-07-01'),
('clhk2m3n4000o356c8l2x9q1y', 'B+', 8, 10, 'low', '2025-06-15'),
('clhk2m3n4000p356c8l2x9q1z', 'O+', 35, 15, 'available', '2025-06-30'),
('clhk2m3n4000q356c8l2x9q20', 'AB+', 5, 8, 'critical', '2025-06-20'),
('clhk2m3n4000r356c8l2x9q21', 'O-', 12, 10, 'available', '2025-07-05'),
('clhk2m3n4000s356c8l2x9q22', 'A-', 18, 8, 'available', '2025-06-25'),
('clhk2m3n4000t356c8l2x9q23', 'B-', 6, 8, 'critical', '2025-06-18'),
('clhk2m3n4000u356c8l2x9q24', 'AB-', 3, 5, 'critical', '2025-06-12')
ON CONFLICT (id) DO NOTHING;

INSERT INTO token_queue (id, dept_id, patient_name, status, timestamp, estimated_wait) VALUES
('clhk2m3n4000v356c8l2x9q25', 'clhk2m3n40005356c8l2x9q1f', 'Rajesh Kumar', 'waiting', NOW() - INTERVAL '15 minutes', 30),
('clhk2m3n4000w356c8l2x9q26', 'clhk2m3n40005356c8l2x9q1f', 'Sunita Rao', 'waiting', NOW() - INTERVAL '5 minutes', 40),
('clhk2m3n4000x356c8l2x9q27', 'clhk2m3n40006356c8l2x9q1g', 'Mohammed Ali', 'in_progress', NOW() - INTERVAL '45 minutes', 0),
('clhk2m3n4000y356c8l2x9q28', 'clhk2m3n40007356c8l2x9q1h', 'Baby Kumar', 'waiting', NOW() - INTERVAL '10 minutes', 15),
('clhk2m3n4000z356c8l2x9q29', 'clhk2m3n40008356c8l2x9q1i', 'Emergency Patient', 'in_progress', NOW() - INTERVAL '2 minutes', 0)
ON CONFLICT (id) DO NOTHING;

INSERT INTO appointments (id, "patientId", "doctorId", date, time, status, type, notes, "createdAt") VALUES
('clhk2m3n40010356c8l2x9q2a', 'clhk2m3n4000i356c8l2x9q1s', 'clhk2m3n40001356c8l2x9q1b', '2025-06-07', '10:00 AM', 'Scheduled', 'Consultation', 'Routine checkup for hypertension', NOW()),
('clhk2m3n40011356c8l2x9q2b', 'clhk2m3n4000j356c8l2x9q1t', 'clhk2m3n40001356c8l2x9q1b', '2025-06-07', '11:30 AM', 'Scheduled', 'Prenatal', 'Regular prenatal checkup', NOW()),
('clhk2m3n40012356c8l2x9q2c', 'clhk2m3n4000l356c8l2x9q1v', 'clhk2m3n40001356c8l2x9q1b', '2025-06-08', '09:15 AM', 'Scheduled', 'Follow-up', 'Diabetes management review', NOW()),
('clhk2m3n40013356c8l2x9q2d', 'clhk2m3n4000k356c8l2x9q1u', 'clhk2m3n40001356c8l2x9q1b', '2025-06-06', '02:00 PM', 'Completed', 'Emergency', 'Fracture treatment completed', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

INSERT INTO prescriptions (id, "patientId", "doctorId", status, "createdAt", notes) VALUES
('clhk2m3n40014356c8l2x9q2e', 'clhk2m3n4000i356c8l2x9q1s', 'clhk2m3n40001356c8l2x9q1b', 'Active', NOW(), 'Hypertension management'),
('clhk2m3n40015356c8l2x9q2f', 'clhk2m3n4000l356c8l2x9q1v', 'clhk2m3n40001356c8l2x9q1b', 'Active', NOW(), 'Diabetes control'),
('clhk2m3n40016356c8l2x9q2g', 'clhk2m3n4000k356c8l2x9q1u', 'clhk2m3n40001356c8l2x9q1b', 'Dispensed', NOW() - INTERVAL '1 day', 'Pain management for fracture')
ON CONFLICT (id) DO NOTHING;

INSERT INTO prescription_items (id, "prescriptionId", "drugId", dosage, frequency, duration, instructions) VALUES
('clhk2m3n40017356c8l2x9q2h', 'clhk2m3n40014356c8l2x9q2e', 'clhk2m3n4000e356c8l2x9q1o', '50mg', 'Once daily', '30 days', 'Take in morning with food'),
('clhk2m3n40018356c8l2x9q2i', 'clhk2m3n40014356c8l2x9q2e', 'clhk2m3n4000g356c8l2x9q1q', '10mg', 'Once daily', '30 days', 'Take before bedtime'),
('clhk2m3n40019356c8l2x9q2j', 'clhk2m3n40015356c8l2x9q2f', 'clhk2m3n4000f356c8l2x9q1p', '500mg', 'Twice daily', '30 days', 'Take with meals'),
('clhk2m3n4001a356c8l2x9q2k', 'clhk2m3n40016356c8l2x9q2g', 'clhk2m3n4000a356c8l2x9q1k', '500mg', 'Three times daily', '7 days', 'Take for pain relief')
ON CONFLICT (id) DO NOTHING;

INSERT INTO purchase_orders (id, supplier, status, "orderDate", "totalCost") VALUES
('clhk2m3n4001b356c8l2x9q2l', 'MedSupply Corp', 'Ordered', NOW() - INTERVAL '2 days', 15000.50),
('clhk2m3n4001c356c8l2x9q2m', 'Pharma Distributors Ltd', 'Delivered', NOW() - INTERVAL '7 days', 8750.75),
('clhk2m3n4001d356c8l2x9q2n', 'Global Medical Supplies', 'Pending', NOW(), 22500.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO purchase_order_items (id, "purchaseOrderId", "drugId", quantity, "unitCost") VALUES
('clhk2m3n4001e356c8l2x9q2o', 'clhk2m3n4001b356c8l2x9q2l', 'clhk2m3n4000b356c8l2x9q1l', 500, 12.50),
('clhk2m3n4001f356c8l2x9q2p', 'clhk2m3n4001b356c8l2x9q2l', 'clhk2m3n4000c356c8l2x9q1m', 200, 45.75),
('clhk2m3n4001g356c8l2x9q2q', 'clhk2m3n4001c356c8l2x9q2m', 'clhk2m3n4000a356c8l2x9q1k', 1000, 8.75),
('clhk2m3n4001h356c8l2x9q2r', 'clhk2m3n4001d356c8l2x9q2n', 'clhk2m3n4000f356c8l2x9q1p', 750, 15.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO emergency_alerts (id, code_type, department, timestamp, status, severity) VALUES
('clhk2m3n4001i356c8l2x9q2s', 'Code Blue', 'Emergency', NOW() - INTERVAL '30 minutes', 'Resolved', 'Critical'),
('clhk2m3n4001j356c8l2x9q2t', 'Code Red', 'Cardiology', NOW() - INTERVAL '2 hours', 'Resolved', 'High'),
('clhk2m3n4001k356c8l2x9q2u', 'Code Yellow', 'Pediatrics', NOW() - INTERVAL '45 minutes', 'Active', 'Medium')
ON CONFLICT (id) DO NOTHING;

INSERT INTO ot_status (id, patient_name, procedure, status, progress, start_time, estimated_end, surgeon) VALUES
('clhk2m3n4001l356c8l2x9q2v', 'Mohammed Ali', 'Radius Fracture Repair', 'In Progress', 75, NOW() - INTERVAL '2 hours', NOW() + INTERVAL '30 minutes', 'Dr. Orthopedic Surgeon'),
('clhk2m3n4001m356c8l2x9q2w', 'Emergency Patient', 'Appendectomy', 'Scheduled', 0, NOW() + INTERVAL '30 minutes', NOW() + INTERVAL '2 hours', 'Dr. General Surgeon'),
('clhk2m3n4001n356c8l2x9q2x', 'Cardiac Patient', 'Angioplasty', 'Completed', 100, NOW() - INTERVAL '4 hours', NOW() - INTERVAL '1 hour', 'Dr. Sharath Kumar')
ON CONFLICT (id) DO NOTHING;

INSERT INTO displays (id, location, status, content, uptime, "lastUpdate") VALUES
('clhk2m3n4001o356c8l2x9q2y', 'Main Lobby', 'Online', 'Queue Display', '99.8%', NOW()),
('clhk2m3n4001p356c8l2x9q2z', 'OT Complex', 'Online', 'Surgery Status', '98.5%', NOW()),
('clhk2m3n4001q356c8l2x9q30', 'Cardiology Wing', 'Offline', 'Department Info', '95.2%', NOW() - INTERVAL '15 minutes'),
('clhk2m3n4001r356c8l2x9q31', 'Pharmacy', 'Online', 'Drug Inventory', '99.1%', NOW()),
('clhk2m3n4001s356c8l2x9q32', 'Emergency Ward', 'Warning', 'Emergency Alerts', '97.8%', NOW() - INTERVAL '8 minutes'),
('clhk2m3n4001t356c8l2x9q33', 'Reception Desk', 'Online', 'General Information', '99.5%', NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO system_alerts (id, type, message, severity, time, resolved) VALUES
('clhk2m3n4001u356c8l2x9q34', 'Hardware', 'Display in Cardiology Wing is offline', 'Medium', NOW() - INTERVAL '15 minutes', false),
('clhk2m3n4001v356c8l2x9q35', 'Inventory', 'Low stock alert: Amoxicillin 250mg', 'High', NOW() - INTERVAL '1 hour', false),
('clhk2m3n4001w356c8l2x9q36', 'Inventory', 'Critical stock alert: Insulin Injection', 'Critical', NOW() - INTERVAL '30 minutes', false),
('clhk2m3n4001x356c8l2x9q37', 'Blood Bank', 'Low blood stock: B+ units', 'High', NOW() - INTERVAL '45 minutes', false),
('clhk2m3n4001y356c8l2x9q38', 'Blood Bank', 'Critical blood stock: AB+ units', 'Critical', NOW() - INTERVAL '2 hours', false),
('clhk2m3n4001z356c8l2x9q39', 'System', 'Database backup completed successfully', 'Info', NOW() - INTERVAL '6 hours', true),
('clhk2m3n40020356c8l2x9q3a', 'Network', 'Intermittent connectivity issues in Block C', 'Medium', NOW() - INTERVAL '3 hours', true)
ON CONFLICT (id) DO NOTHING;