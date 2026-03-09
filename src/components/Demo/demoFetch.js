/**
 * demoFetch.js
 *
 * Installs a global fetch interceptor + axios interceptor during demo mode.
 * Every API call made with the demo token gets a realistic mock response.
 */
import axios from 'axios';
import { DEMO_STUDENTS, DEMO_EXAM, DEMO_QUESTIONS, DEMO_RUBRICS } from './demoData';

// ──────────────────────────────────────────────────────────────────────────────
// Axios interceptor IDs (so we can eject on cleanup)
// ──────────────────────────────────────────────────────────────────────────────
let _axiosRequestId = null;
let _axiosResponseId = null;

export const DEMO_ACCESS_TOKEN = 'DEMO_MODE_FAKE_TOKEN_DO_NOT_USE';
export const DEMO_COURSE_ID = 'demo-course-1';
export const DEMO_EXAM_ID = 'demo-exam-1';

// ──────────────────────────────────────────────────────────────────────────────
// Response builders
// ──────────────────────────────────────────────────────────────────────────────
const jsonResponse = (data, status = 200, code = 200) =>
    new Response(JSON.stringify({ code, data, message: 'success' }), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });

// ──────────────────────────────────────────────────────────────────────────────
// Pre-built question objects in the exact shape each modal expects
// ──────────────────────────────────────────────────────────────────────────────

// Model answers for each question
const MODEL_ANSWERS = [
    `Circuit switching establishes a dedicated, reserved path between sender and receiver for the entire communication session. The path remains reserved even during silence, guaranteeing bandwidth but wasting it when idle. Example: PSTN (Public Switched Telephone Network) — calls require a fixed circuit, ideal for real-time voice.

Packet switching breaks data into independent packets, each routed separately through the network. Bandwidth is shared among all users, making it highly efficient for bursty and data traffic. Example: The Internet — web browsing involves bursts of data where shared bandwidth is optimal.

Circuit switching is preferred for real-time, low-latency applications (voice/video calls); packet switching is preferred for data networks with varying traffic loads.`,

    `The OSI (Open Systems Interconnection) model has 7 layers:
1. Physical — transmits raw bits over a physical medium (bits)
2. Data Link — node-to-node delivery, error detection, MAC addressing (frames)
3. Network — logical addressing and routing (packets, IP)
4. Transport — end-to-end delivery, flow control (segments, TCP/UDP)
5. Session — manages sessions and synchronisation
6. Presentation — data formatting, encryption, compression
7. Application — user-facing interfaces and protocols (HTTP, SMTP)

Encapsulation: As data moves from Application to Physical, each layer adds its own header (and trailer at Data Link). At the receiver, headers are stripped in reverse (decapsulation).`,

    `The TCP three-way handshake establishes a reliable, connection-oriented communication channel and synchronises sequence numbers.

Steps:
1. SYN: The client selects an Initial Sequence Number (ISN=x) and sends a SYN segment. Client state → SYN_SENT.
2. SYN-ACK: The server responds with its own ISN (y) and acknowledges the client (ACK=x+1). Server state → SYN_RCVD.
3. ACK: The client sends ACK=y+1 confirming the server's ISN. Both sides → ESTABLISHED.

After this, both parties know each other's sequence numbers and data transfer can begin reliably.`,

    `IPv4 uses 32-bit addresses (e.g., 192.168.1.1) providing ~4.3 billion unique addresses. IPv6 uses 128-bit addresses (e.g., 2001:0db8::1) providing ~3.4×10³⁸ addresses.

IPv4 limitations:
• Address exhaustion — the pool was depleted around 2011
• No mandatory security (IPsec optional)
• Complex routing tables due to classful/classless notation

IPv6 improvements:
• Vastly larger address space
• Mandatory IPsec for end-to-end security
• Stateless Address Autoconfiguration (SLAAC)
• Simplified, fixed-size headers for faster routing

NAT (Network Address Translation) allows many private addresses (e.g., 192.168.x.x) to share a single public IPv4 address, significantly extending IPv4 lifespan as a transitional mechanism until IPv6 adoption is complete.`,
];

// Questions formatted for UploadQnAModal (reads: question_body, answer_body, max_marks, question_type, answer_type)
const UPLOAD_QUESTIONS = DEMO_QUESTIONS.map((q, i) => ({
    question_number: q.number,
    question_text: `Question ${q.number}`,          // short label
    question_body: q.text,                           // ← shown in the text editor
    question_type: 'text',
    answer_text: `Model Answer ${q.number}`,
    answer_body: MODEL_ANSWERS[i],                 // ← shown in the answer editor
    answer_type: 'text',
    max_marks: q.marks,
    domain: 'Networks',
    num_rubric_items: 4,
    professor_instructions: '',
    question_file_url: '',
    answer_file_url: '',
}));

// Add rubric_items so RubricModal can detect "has rubric" and show Edit Rubric button
const UPLOAD_QUESTIONS_WITH_RUBRICS = UPLOAD_QUESTIONS.map((q, i) => {
    const rubric = DEMO_RUBRICS[i];
    return {
        ...q,
        rubric_items: rubric
            ? rubric.criteria.map(c => ({
                id: c.id,
                description: c.description,
                max_marks: c.marks,
                reasoning: 'Based on standard computer networks evaluation criteria',
                grading_guidelines: `Award ${c.marks} marks for complete and accurate answer; partial marks for partial understanding`,
                score_options: [c.marks, c.marks * 0.75, c.marks * 0.5, 0],
            }))
            : [],
        problem_feedback: 'Evaluate based on conceptual accuracy, appropriate examples, and clarity of explanation.',
    };
});

// ──────────────────────────────────────────────────────────────────────────────
// Per-question rubric responses for /exams/{id}/questions/{n}/rubric
// ──────────────────────────────────────────────────────────────────────────────
const RUBRIC_RESPONSES = DEMO_RUBRICS.map(r => ({
    question_number: r.question_number,
    rubric_items: r.criteria.map(c => ({
        id: c.id,
        description: c.description,
        max_marks: c.marks,
        reasoning: 'Assesses depth of understanding and ability to apply concepts accurately',
        grading_guidelines: `Full marks (${c.marks}) for complete, accurate answer. Partial for partially correct. 0 for incorrect or missing.`,
        score_options: [c.marks, Math.round(c.marks * 0.5 * 2) / 2, 0],
    })),
    problem_feedback: 'Good answer should demonstrate conceptual clarity and use of real-world examples.',
    total_marks: r.total_marks,
}));

// ──────────────────────────────────────────────────────────────────────────────
// Route table
// ──────────────────────────────────────────────────────────────────────────────
function matchRoute(url, method) {
    const u = url.replace(/^https?:\/\/[^/]+/, '').replace(/\?.*/, ''); // strip origin + querystring

    // ── Questions ──────────────────────────────────────────────────────────────

    // GET questions for the demo exam (used by UploadQnAModal & RubricModal via ExamsTab)
    if (method === 'GET' && u.includes(`/exams/${DEMO_EXAM_ID}/question-answer`)) {
        return jsonResponse({ questions: UPLOAD_QUESTIONS_WITH_RUBRICS });
    }

    // GET rubric for a specific question  (used by RubricModal.generateAllRubrics)
    const rubricMatch = u.match(/\/exams\/demo-exam-1\/questions\/(\d+)\/rubric/);
    if (method === 'GET' && rubricMatch) {
        const qNum = parseInt(rubricMatch[1], 10);
        const rubricData = RUBRIC_RESPONSES.find(r => r.question_number === qNum);
        if (rubricData) return jsonResponse(rubricData);
        return jsonResponse(RUBRIC_RESPONSES[0]); // fallback
    }

    // POST save rubric
    if (method === 'POST' && u.includes(`/exams/${DEMO_EXAM_ID}/questions`) && u.endsWith('/rubric')) {
        return jsonResponse({ saved: true });
    }

    // PUT exam update
    if (method === 'PUT' && u.includes(`/exams/${DEMO_EXAM_ID}`)) {
        return jsonResponse(DEMO_EXAM);
    }

    // POST question/answer PDF uploads
    if (method === 'POST' && (u.includes('question-pdf') || u.includes('golden-pdf') || u.includes('/upload'))) {
        return jsonResponse({ success: true });
    }

    // ── Enrollments ────────────────────────────────────────────────────────────
    // GET enrollments/list — ExamEvaluation expects data = { enrollments:[...], pagination:{...} }
    if (method === 'GET' && u.includes(`${DEMO_EXAM_ID}/enrollments/list`)) {
        const marks = [18, 18, 11, 20, 14.5, 18, 8, 16.5];
        const enrollments = DEMO_STUDENTS.map((s, i) => ({
            id: `enr-${s.id}`,
            student_id: s.id,
            exam_id: DEMO_EXAM_ID,
            student_name: s.user_name,
            roll_number: s.roll_number,
            status: 'evaluated',
            marks_obtained: marks[i] ?? 15,
            max_marks: DEMO_EXAM.full_marks,
            feedback: 'Good understanding of core networking concepts.',
            recheck_requested: false,
            recheck_count: 0,
            answer_sheet_url: null,
        }));
        return jsonResponse({
            enrollments,
            pagination: { page: 1, page_size: 50, total: 8, total_pages: 1 },
            status_counts: { not_uploaded: 0, uploaded: 0, evaluated: 8, recheck_requested: 0 },
        });
    }
    // GET generic enrollments (manage enrollments modal)
    if (method === 'GET' && u.includes(`${DEMO_EXAM_ID}/enrollments`)) {
        return jsonResponse([{
            enrollments: DEMO_STUDENTS.map(s => ({
                student_id: s.id,
                student_name: s.user_name,
                status: 'evaluated',
                marks_obtained: 15,
                max_marks: DEMO_EXAM.full_marks,
            })),
            status_counts: { not_uploaded: 0, uploaded: 0, evaluated: 8, recheck_requested: 0 },
        }]);
    }
    if ((method === 'POST' || method === 'DELETE') && u.includes(`${DEMO_EXAM_ID}/enrollments`)) {
        return jsonResponse({});
    }

    // ── Answer Upload (UploadAnswersModal) ─────────────────────────────────────

    // Presign — return a fake S3 upload URL
    if (method === 'POST' && u.includes('answers-zip-presign')) {
        return jsonResponse({
            upload: {
                url: 'https://demo-s3.invalid/upload',
                fields: { key: 'demo/fake.zip', policy: 'fakepolicy', signature: 'fakesig' },
            },
            zip_key: 'demo/fake.zip',
        });
    }

    // S3 direct upload (axios POST to S3 – allow it to "succeed" instantly)
    if (method === 'POST' && url.includes('demo-s3.invalid')) {
        return new Response('', { status: 204 });
    }

    // Verify S3 object exists
    if (method === 'GET' && u.includes('answers-zip-exists')) {
        return jsonResponse({ exists: true });
    }

    // Backend fallback upload
    if (method === 'POST' && u.includes('upload-answers-zip')) {
        return jsonResponse({ zip_key: 'demo/fake.zip' });
    }

    // Start async processing — MUST return code 202 per UploadAnswersModal logic
    if (method === 'POST' && u.includes('process-uploaded-answers-async')) {
        return new Response(
            JSON.stringify({ code: 202, data: { job_id: 'demo-job-001', status: 'processing' }, message: 'started' }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    }

    // Single-student answer-pages upload
    if (method === 'POST' && u.includes('answer-pages')) {
        return jsonResponse({ pages_uploaded: 1 });
    }
    // Clear answer pages
    if (method === 'POST' && u.includes('answer-pages/clear')) {
        return jsonResponse({ cleared: true });
    }

    // Evaluation stats (used by ExamEvaluation.fetchOverallProgress)
    if (method === 'GET' && u.includes('evaluation-stats')) {
        return jsonResponse({
            kpi: {
                total_students: 8,
                evaluated_students: 8,
                uploaded_students: 8,
                not_uploaded_students: 0,
                pending_evaluation_students: 0,
                average_score: 15.5,
                percent_complete: 100,
            },
            distribution: {
                mode: 'marks',
                bin_size: 10,
                max_marks: 20,
                count: 8,
                avg: 15.5,
                min: 8,
                max: 20,
                std_dev: 3.8,
                bins: [
                    { label: '0-9', count: 1 },
                    { label: '10-19', count: 5 },
                    { label: '20', count: 2 },
                ],
            },
        });
    }

    // Start evaluation job — called when user clicks "Evaluate All"
    if (method === 'POST' && u.includes(`/exams/${DEMO_EXAM_ID}/evaluations/jobs`)) {
        return jsonResponse({ job_id: 'demo-eval-job-001', status: 'pending' });
    }

    // Poll evaluation job status
    if (method === 'GET' && u.includes('jobs/evaluations')) {
        return jsonResponse({
            status: 'completed',
            progress: { completed: 8, total: 8, failed: 0, current_enrollment_id: null },
        });
    }

    // Cancel / resume evaluation job
    if (method === 'POST' && u.includes('jobs/evaluations') && (u.includes('/cancel') || u.includes('/resume'))) {
        return jsonResponse({ job_id: 'demo-eval-job-001', status: 'pending' });
    }

    // Publish results
    if (method === 'POST' && u.includes('/publish')) {
        return jsonResponse({ published: true });
    }

    // Export
    if (method === 'GET' && u.includes('/export')) {
        return jsonResponse({ url: '#' });
    }

    // Recheck window
    if ((method === 'POST' || method === 'GET') && u.includes('recheck')) {
        return jsonResponse({ enabled: false });
    }

    // ── Students ───────────────────────────────────────────────────────────────
    if (method === 'GET' && u.includes(`courses/${DEMO_COURSE_ID}/students`)) {
        return jsonResponse(DEMO_STUDENTS);
    }

    // ── Profile ────────────────────────────────────────────────────────────────
    if (method === 'GET' && u.includes('/users/me')) {
        return jsonResponse({ name: 'Demo Professor', email: 'demo@smartqna.app', role: 'professor' });
    }

    // AI answer generation for UploadQnAModal
    if (method === 'POST' && u.includes('generate-answer')) {
        return jsonResponse({ answer: MODEL_ANSWERS[0] });
    }

    return null; // not intercepted
}

// ──────────────────────────────────────────────────────────────────────────────
// Install / uninstall
// ──────────────────────────────────────────────────────────────────────────────
let _originalFetch = null;
let _installed = false;

export function installDemoFetch() {
    if (_installed) return;
    _installed = true;
    _originalFetch = window.fetch.bind(window);

    window.fetch = async (input, init = {}) => {
        const url = typeof input === 'string' ? input : input?.url ?? String(input);
        const method = ((init?.method) || 'GET').toUpperCase();
        const auth = init?.headers?.Authorization || init?.headers?.authorization || '';

        // Intercept demo requests: demo token OR demo IDs in URL
        const isDemo = auth.includes(DEMO_ACCESS_TOKEN)
            || url.includes(DEMO_COURSE_ID)
            || url.includes(DEMO_EXAM_ID)
            || url.includes('demo-s3.invalid');

        if (isDemo) {
            const mock = matchRoute(url, method);
            if (mock) {
                console.debug('[DemoFetch]', method, url, '→ mocked');
                return mock;
            }
            // Unknown demo route — return empty success to avoid errors
            console.warn('[DemoFetch] unmapped demo route:', method, url);
            return jsonResponse({});
        }

        return _originalFetch(input, init);
    };

    // Also intercept axios (used by UploadAnswersModal for S3 and fallback zip upload)
    _axiosRequestId = axios.interceptors.request.use((config) => {
        const url = config?.url || '';
        const method = (config?.method || 'get').toUpperCase();

        // Intercept S3 direct upload or fallback zip upload
        if (url.includes('demo-s3.invalid') || url.includes('upload-answers-zip')) {
            console.debug('[DemoFetch axios]', method, url, '→ mocked');
            // Cancel the real request and use a custom adapter
            config.adapter = async () => ({
                data: JSON.stringify({ code: 200, data: { zip_key: 'demo/fake.zip' }, message: 'success' }),
                status: 200,
                statusText: 'OK',
                headers: { 'content-type': 'application/json' },
                config,
                request: {},
            });
        }
        return config;
    });
}

export function uninstallDemoFetch() {
    if (!_installed || !_originalFetch) return;
    window.fetch = _originalFetch;
    _originalFetch = null;
    _installed = false;

    if (_axiosRequestId !== null) {
        axios.interceptors.request.eject(_axiosRequestId);
        _axiosRequestId = null;
    }
    if (_axiosResponseId !== null) {
        axios.interceptors.response.eject(_axiosResponseId);
        _axiosResponseId = null;
    }
}
