// ─── Demo Tour Static Data ────────────────────────────────────────────────────
// All data here is pre-existing mock data used for the onboarding demo tour.
// No real API calls are made in demo mode.

export const DEMO_COURSE = {
    id: 'demo-course-1',
    course_name: 'Computer Networks',
    course_code: 'CS F303',
    description: 'Fundamentals of data communication, network protocols, and internet architecture.',
    is_active: true,
    start_date: '2024-01-08',
    end_date: '2024-05-15',
    semester: 'Spring',
    year: 2024,
    sections: ['L1', 'L2', 'T1', 'T2'],
};

export const DEMO_STUDENTS = [
    { id: 's1', user_name: 'Aarav Mehta', user_email: 'aarav.mehta@bits.ac.in', roll_number: '2021A7PS0234G', section: 'L1' },
    { id: 's2', user_name: 'Priya Sharma', user_email: 'priya.sharma@bits.ac.in', roll_number: '2021A7PS0291G', section: 'L1' },
    { id: 's3', user_name: 'Rohan Verma', user_email: 'rohan.verma@bits.ac.in', roll_number: '2021A7PS0318G', section: 'L2' },
    { id: 's4', user_name: 'Sneha Patel', user_email: 'sneha.patel@bits.ac.in', roll_number: '2021A7PS0402G', section: 'L2' },
    { id: 's5', user_name: 'Kiran Reddy', user_email: 'kiran.reddy@bits.ac.in', roll_number: '2021A7PS0456G', section: 'T1' },
    { id: 's6', user_name: 'Ananya Singh', user_email: 'ananya.singh@bits.ac.in', roll_number: '2021A7PS0512G', section: 'T1' },
    { id: 's7', user_name: 'Dev Malhotra', user_email: 'dev.malhotra@bits.ac.in', roll_number: '2021A7PS0589G', section: 'T2' },
    { id: 's8', user_name: 'Ishaan Kapoor', user_email: 'ishaan.kapoor@bits.ac.in', roll_number: '2021A7PS0621G', section: 'T2' },
];

export const DEMO_EXAM = {
    id: 'demo-exam-1',
    exam_name: 'Quiz 1 – Network Fundamentals',
    full_marks: 20,
    created_at: '2024-02-10T09:00:00Z',
    start_time: '2024-02-10T10:00:00Z',
    duration_minutes: 45,
};

// 4 questions × 5 marks each = 20 marks
export const DEMO_QUESTIONS = [
    {
        id: 'q1',
        number: 1,
        marks: 5,
        text: 'Explain the difference between Circuit Switching and Packet Switching. Discuss one real-world scenario where each approach is preferred and justify your answer.',
        image: null,
    },
    {
        id: 'q2',
        number: 2,
        marks: 5,
        text: 'Describe the OSI model layers with the primary function of each layer. How does encapsulation occur as data travels from the Application layer down to the Physical layer?',
        image: null,
    },
    {
        id: 'q3',
        number: 3,
        marks: 5,
        text: 'What is the purpose of the TCP three-way handshake? Walk through each step (SYN, SYN-ACK, ACK) and explain the state of both client and server at each stage.',
        image: null,
    },
    {
        id: 'q4',
        number: 4,
        marks: 5,
        text: 'Compare IPv4 and IPv6 addressing schemes. What are the key limitations of IPv4 that led to the development of IPv6? How does NAT help as a transitional mechanism?',
        image: null,
    },
];

// Rubric for each question – criteria-based breakdown
export const DEMO_RUBRICS = [
    {
        question_id: 'q1',
        question_number: 1,
        total_marks: 5,
        criteria: [
            { id: 'r1a', description: 'Correct definition of Circuit Switching with dedicated path concept', marks: 1.5 },
            { id: 'r1b', description: 'Correct definition of Packet Switching with store-and-forward concept', marks: 1.5 },
            { id: 'r1c', description: 'Appropriate real-world example for each (e.g., PSTN vs Internet)', marks: 1 },
            { id: 'r1d', description: 'Clear justification with trade-offs (latency, bandwidth, reliability)', marks: 1 },
        ],
    },
    {
        question_id: 'q2',
        question_number: 2,
        total_marks: 5,
        criteria: [
            { id: 'r2a', description: 'Names and primary functions of all 7 OSI layers correctly stated', marks: 2 },
            { id: 'r2b', description: 'Correct explanation of encapsulation (headers added at each layer)', marks: 1.5 },
            { id: 'r2c', description: 'Accurate data unit names per layer (bit, frame, packet, segment, data)', marks: 1 },
            { id: 'r2d', description: 'Logical flow and clarity of explanation', marks: 0.5 },
        ],
    },
    {
        question_id: 'q3',
        question_number: 3,
        total_marks: 5,
        criteria: [
            { id: 'r3a', description: 'Purpose of handshake: reliable connection establishment and sequence sync', marks: 1 },
            { id: 'r3b', description: 'SYN step: client sends ISN, moves to SYN_SENT state', marks: 1.5 },
            { id: 'r3c', description: 'SYN-ACK step: server acknowledges and sends its ISN', marks: 1.5 },
            { id: 'r3d', description: 'ACK step: client confirms, both move to ESTABLISHED state', marks: 1 },
        ],
    },
    {
        question_id: 'q4',
        question_number: 4,
        total_marks: 5,
        criteria: [
            { id: 'r4a', description: 'IPv4 32-bit vs IPv6 128-bit addressing correctly described', marks: 1.5 },
            { id: 'r4b', description: 'IPv4 limitations: address exhaustion, no inherent security, limited QoS', marks: 1.5 },
            { id: 'r4c', description: 'IPv6 improvements: larger space, IPsec, stateless autoconfiguration', marks: 1 },
            { id: 'r4d', description: 'NAT purpose: private-to-public translation, conserves address space', marks: 1 },
        ],
    },
];

// Pre-uploaded answer sheets with realistic student answers and per-question marks
export const DEMO_ANSWERS = [
    {
        student_id: 's1',
        student_name: 'Aarav Mehta',
        upload_status: 'evaluated',
        answers: [
            { question_id: 'q1', text: 'Circuit switching reserves a dedicated path for the entire call duration, providing guaranteed bandwidth — as used in traditional PSTN telephone networks. Packet switching breaks data into packets routed independently, making it efficient for bursty internet traffic.', marks_awarded: 4.5 },
            { question_id: 'q2', text: 'The OSI model has 7 layers: Physical (bits), Data Link (frames/MAC), Network (packets/IP), Transport (segments/TCP), Session (sessions), Presentation (encryption/formatting), Application (user interface). Encapsulation adds headers at each layer going down.', marks_awarded: 4 },
            { question_id: 'q3', text: 'Three-way handshake establishes a reliable connection. Client sends SYN with ISN=100 (SYN_SENT). Server responds SYN-ACK with its ISN=300 and ACK=101 (SYN_RCVD). Client sends ACK=301 and both enter ESTABLISHED state.', marks_awarded: 5 },
            { question_id: 'q4', text: 'IPv4 uses 32-bit addresses (4.3 billion). IPv6 uses 128-bit (3.4×10³⁸). IPv4 ran out due to internet growth. IPv6 adds IPsec natively, better QoS, and autoconfiguration. NAT maps private IPs to one public IP to extend IPv4 life.', marks_awarded: 4.5 },
        ],
        total_marks: 18,
    },
    {
        student_id: 's2',
        student_name: 'Priya Sharma',
        upload_status: 'evaluated',
        answers: [
            { question_id: 'q1', text: 'Circuit switching creates a fixed path for the duration of communication, wasteful if no data is sent. Packet switching sends data in packets and shares network resources, ideal for internet. Circuit switching is better for voice calls; packet switching for web.', marks_awarded: 5 },
            { question_id: 'q2', text: 'OSI layers: Application, Presentation, Session, Transport, Network, Data Link, Physical. Encapsulation works top-down adding headers to the payload. Each layer adds its own header; at the receiver, headers are removed (decapsulation).', marks_awarded: 4.5 },
            { question_id: 'q3', text: 'Handshake synchronizes sequence numbers. Step 1: SYN - client initiates. Step 2: SYN-ACK - server acknowledges client and sends its own seq number. Step 3: ACK - client confirms server seq number. Connection is now established.', marks_awarded: 4.5 },
            { question_id: 'q4', text: 'IPv4: 32-bit, ~4.3B addresses. IPv6: 128-bit, virtually unlimited. IPv4 limited by address exhaustion. NAT helps by allowing multiple devices share one public IP. IPv6 also has built-in security and better header efficiency.', marks_awarded: 4 },
        ],
        total_marks: 18,
    },
    {
        student_id: 's3',
        student_name: 'Rohan Verma',
        upload_status: 'evaluated',
        answers: [
            { question_id: 'q1', text: 'Circuit switching: dedicated link (telephone). Packet switching: data broken into packets (internet). Packet switching is more efficient for data networks.', marks_awarded: 3 },
            { question_id: 'q2', text: 'OSI has 7 layers. Application layer is topmost. Physical layer is lowest. Data encapsulated at each layer with headers.', marks_awarded: 2.5 },
            { question_id: 'q3', text: 'Three-way handshake: SYN, SYN-ACK, ACK. Establishes connection between client and server before data transfer.', marks_awarded: 2.5 },
            { question_id: 'q4', text: 'IPv4 is 32-bit, IPv6 is 128-bit. NAT maps internal private addresses to external public IP. IPv6 solves address exhaustion problem.', marks_awarded: 3 },
        ],
        total_marks: 11,
    },
    {
        student_id: 's4',
        student_name: 'Sneha Patel',
        upload_status: 'evaluated',
        answers: [
            { question_id: 'q1', text: 'Circuit switching establishes a dedicated physical circuit before transmission (e.g., traditional telephone networks). Packet switching divides data into packets sent via best available path (e.g., internet). Circuit switching has lower latency once connected; packet switching is more efficient for variable traffic.', marks_awarded: 5 },
            { question_id: 'q2', text: 'OSI 7 layers from bottom: Physical, Data Link, Network, Transport, Session, Presentation, Application. Encapsulation: Application data → Transport adds TCP header → Network adds IP header → Data Link adds frame header/trailer → Physical sends bits. Each header contains control information for that layer.', marks_awarded: 5 },
            { question_id: 'q3', text: 'TCP three-way handshake establishes reliable connection. (1) SYN: Client sends segment with SYN flag, ISN=x, state becomes SYN_SENT. (2) SYN-ACK: Server replies SYN flag + ACK=x+1, sends its ISN=y, state is SYN_RCVD. (3) ACK: Client sends ACK=y+1, both move to ESTABLISHED. Ensures sequence number agreement.', marks_awarded: 5 },
            { question_id: 'q4', text: 'IPv4: 32-bit (4,294,967,296 addresses), dotted decimal. IPv6: 128-bit (3.4×10³⁸ addresses), hex colon notation. IPv4 limitations: address exhaustion, no mandatory security, complex routing tables. IPv6 improvements: huge space, mandatory IPsec, stateless autoconfiguration, simplified header. NAT: translates private addresses to single public IP; delays IPv6 adoption.', marks_awarded: 5 },
        ],
        total_marks: 20,
    },
    {
        student_id: 's5',
        student_name: 'Kiran Reddy',
        upload_status: 'evaluated',
        answers: [
            { question_id: 'q1', text: 'Circuit switching maintains a dedicated channel throughout the conversation. Used in PSTN. Packet switching sends packets independently through the network. Used for internet data. Packet switching utilizes bandwidth better for bursty data.', marks_awarded: 4 },
            { question_id: 'q2', text: 'OSI layers: Physical, Data Link, Network, Transport, Session, Presentation, Application. Encapsulation: app data gets segment header, then packet header, then frame header as it moves down. Physical sends raw bits.', marks_awarded: 3.5 },
            { question_id: 'q3', text: 'Handshake establishes TCP connection. Client sends SYN. Server responds with SYN-ACK. Client sends final ACK. After this, data transfer begins. It synchronizes sequence numbers between both ends.', marks_awarded: 3.5 },
            { question_id: 'q4', text: 'IPv4 has 32-bit addresses with limited space. IPv6 has 128-bit with huge space. IPv4 address space exhausted around 2011. NAT extends IPv4 by sharing one public IP. IPv6 also has better security and autoconfiguration.', marks_awarded: 3.5 },
        ],
        total_marks: 14.5,
    },
    {
        student_id: 's6',
        student_name: 'Ananya Singh',
        upload_status: 'evaluated',
        answers: [
            { question_id: 'q1', text: 'Circuit switching: fixed dedicated path (voice calls, low latency). Packet switching: packets routed independently (internet, efficient bandwidth use). Circuit switching wastes capacity; packet switching better for bursty traffic.', marks_awarded: 4.5 },
            { question_id: 'q2', text: 'Seven OSI layers: Application (HTTP), Presentation (SSL), Session (SOCKS), Transport (TCP/UDP), Network (IP), Data Link (Ethernet), Physical (cables). Encapsulation adds headers layer by layer. At receiver, headers are stripped (decapsulation).', marks_awarded: 4.5 },
            { question_id: 'q3', text: 'Three-way handshake: client sends SYN (seq=100). Server replies SYN+ACK (ack=101, seq=200). Client sends ACK (ack=201). Connection established. Purpose: agree on initial sequence numbers and verify connectivity.', marks_awarded: 4.5 },
            { question_id: 'q4', text: 'IPv4 32-bit (~4.3B), IPv6 128-bit. IPv4 limitations: exhaustion, no auth, NAT complexity. IPv6: larger space, IPsec mandatory, flow labels for QoS, no need for NAT. NAT translates multiple private to one public IP, temporarily solving IPv4 exhaustion.', marks_awarded: 4.5 },
        ],
        total_marks: 18,
    },
    {
        student_id: 's7',
        student_name: 'Dev Malhotra',
        upload_status: 'evaluated',
        answers: [
            { question_id: 'q1', text: 'Circuit switching: dedicated line for calls. Packet switching: packets sent separately. Packet switching is better for internet.', marks_awarded: 2.5 },
            { question_id: 'q2', text: 'OSI has 7 layers. They help different parts of network communicate. Each layer has specific functions.', marks_awarded: 1.5 },
            { question_id: 'q3', text: 'TCP handshake connects two computers. SYN, SYN-ACK, ACK are the steps.', marks_awarded: 2 },
            { question_id: 'q4', text: 'IPv4 is older, IPv6 is newer. IPv6 has more addresses. NAT is used to share IP addresses.', marks_awarded: 2 },
        ],
        total_marks: 8,
    },
    {
        student_id: 's8',
        student_name: 'Ishaan Kapoor',
        upload_status: 'evaluated',
        answers: [
            { question_id: 'q1', text: 'Circuit switching reserves a physical path for entire duration. Good for time-sensitive communication like phone calls. Packet switching uses routing tables to forward packets. Better for data as bandwidth is shared efficiently. Internet uses packet switching.', marks_awarded: 4 },
            { question_id: 'q2', text: 'OSI Model layers and functions: Application (user apps/HTTP), Presentation (data format/encryption), Session (session management), Transport (end-to-end delivery/TCP), Network (logical addressing/routing/IP), Data Link (node-to-node/Ethernet), Physical (bits on wire). Encapsulation adds PDU from top down.', marks_awarded: 4 },
            { question_id: 'q3', text: 'Three-way handshake purpose: establish reliable connection, sync sequence numbers. SYN: client → server (seq=x, SYN_SENT). SYN-ACK: server → client (seq=y, ack=x+1, SYN_RCVD). ACK: client → server (ack=y+1, ESTABLISHED). Both sides confirm they can send/receive.', marks_awarded: 4.5 },
            { question_id: 'q4', text: 'IPv4: 32-bit, 4.3B addresses, exhausted. IPv6: 128-bit, ample space. IPv4 problems: address scarcity, no built-in security, inefficient routing. IPv6 fixes: stateless autoconfiguration, IPsec required, extension headers. NAT: private network shares single public IP, enabling IPv4 to survive longer.', marks_awarded: 4 },
        ],
        total_marks: 16.5,
    },
];

// Evaluation summary stats
export const DEMO_EVALUATION_SUMMARY = {
    total_students: 8,
    evaluated: 8,
    average_marks: 15.5,
    highest_marks: 20,
    lowest_marks: 8,
    pass_count: 7,
    fail_count: 1,
};

// Tour step definitions
export const DEMO_STEPS = [
    { id: 0, label: 'Courses', description: 'View your course' },
    { id: 1, label: 'Students', description: 'Manage enrolled students' },
    { id: 2, label: 'Exam', description: 'View the exam card' },
    { id: 3, label: 'Questions', description: 'Upload question paper' },
    { id: 4, label: 'Rubrics', description: 'Generate marking rubrics' },
    { id: 5, label: 'Answers', description: 'Upload answer sheets' },
    { id: 6, label: 'Evaluate', description: 'View AI evaluation' },
];
