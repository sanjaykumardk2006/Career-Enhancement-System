const http = require('http');
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = require('../server');
const connectDB = require('../config/db');

// Test suite stats
let passedTests = 0;
let failedTests = 0;
const testResults = [];

const logTest = (name, passed, details = '') => {
  if (passed) {
    passedTests++;
    console.log(`  ✅ [PASS] ${name}`);
    if (details) console.log(`     ↳ ${details}`);
    testResults.push({ name, status: 'PASS', details });
  } else {
    failedTests++;
    console.log(`  ❌ [FAIL] ${name}`);
    if (details) console.log(`     ↳ ${details}`);
    testResults.push({ name, status: 'FAIL', details });
  }
};

const runAllTests = async () => {
  console.log('\n=============================================================');
  console.log('🧪 CAREER ENHANCEMENT SYSTEM - END-TO-END OPERATIONS TEST SUITE');
  console.log('=============================================================\n');

  // Ensure DB is connected
  if (mongoose.connection.readyState === 0) {
    await connectDB();
  }

  // Start test server on random free port
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/api`;
  console.log(`🚀 Test server listening on ${baseUrl}\n`);

  let studentToken = null;
  let adminToken = null;
  let createdInterviewId = null;
  let createdJobId = null;
  const testEmail = `test.student.${Date.now()}@example.com`;
  const testPassword = 'Password123!';

  try {
    // ==========================================
    // 1. HEALTH CHECK
    // ==========================================
    console.log('📡 [1/8] Testing Server & Base Health Check...');
    {
      const res = await fetch(`${baseUrl}/health`);
      const data = await res.json();
      logTest(
        'GET /api/health returns 200 and OK status',
        res.status === 200 && data.status === 'OK',
        `Status: ${res.status}, Message: "${data.message}"`
      );
    }

    // ==========================================
    // 2. AUTHENTICATION & ACCESS CONTROL
    // ==========================================
    console.log('\n🔐 [2/8] Testing Authentication & Authorization Operations...');
    {
      // 2.1 Register new student
      const regRes = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Operational Test Student',
          email: testEmail,
          password: testPassword,
        }),
      });
      const regData = await regRes.json();
      studentToken = regData.token;
      logTest(
        'POST /api/auth/register creates new student account',
        regRes.status === 201 && !!regData.token && regData.role === 'student',
        `Created student: ${regData.email}, role: ${regData.role}`
      );

      // 2.2 Reject duplicate registration
      const dupRes = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Duplicate Student',
          email: testEmail,
          password: testPassword,
        }),
      });
      logTest(
        'POST /api/auth/register prevents duplicate email registration',
        dupRes.status === 400,
        `Status: ${dupRes.status} (Expected 400 Bad Request)`
      );

      // 2.3 Security Guard: Reject public admin registration
      const adminHijackRes = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Sneaky Admin',
          email: `sneaky.${Date.now()}@example.com`,
          password: testPassword,
          role: 'admin',
        }),
      });
      logTest(
        'POST /api/auth/register prevents unauthorized public admin registration',
        adminHijackRes.status === 403,
        `Status: ${adminHijackRes.status} (Security alert triggered)`
      );

      // 2.4 Login with valid credentials
      const loginRes = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
        }),
      });
      const loginData = await loginRes.json();
      logTest(
        'POST /api/auth/login logs in with valid credentials',
        loginRes.status === 200 && !!loginData.token,
        `Logged in user ID: ${loginData._id}`
      );

      // 2.5 Login with invalid password
      const badLoginRes = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: 'WrongPassword!',
        }),
      });
      logTest(
        'POST /api/auth/login rejects incorrect password',
        badLoginRes.status === 401,
        `Status: ${badLoginRes.status} (Expected 401 Unauthorized)`
      );

      // 2.6 Seeded Demo Student Login
      const demoLoginRes = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'alex.chen@example.com',
          password: 'Password123!',
        }),
      });
      const demoData = await demoLoginRes.json();
      logTest(
        'POST /api/auth/login logs in seeded demo user (alex.chen@example.com)',
        demoLoginRes.status === 200 && demoData.email === 'alex.chen@example.com',
        `User: ${demoData.name}, Goal: "${demoData.careerGoal}"`
      );

      // 2.7 Seeded System Administrator Login
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@careerai.com';
      const adminPassword = process.env.ADMIN_PASSWORD || 'AdminSecurePass123!';
      const adminLoginRes = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: adminEmail,
          password: adminPassword,
        }),
      });
      const adminData = await adminLoginRes.json();
      adminToken = adminData.token;
      logTest(
        'POST /api/auth/login logs in system administrator',
        adminLoginRes.status === 200 && adminData.role === 'admin',
        `Admin: ${adminData.email}, Role: ${adminData.role}`
      );

      // 2.8 Get current user profile (GET /api/auth/me)
      const meRes = await fetch(`${baseUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      const meData = await meRes.json();
      logTest(
        'GET /api/auth/me returns authenticated student profile',
        meRes.status === 200 && meData.email === testEmail,
        `Retrieved profile for: ${meData.name}`
      );

      // 2.9 Update profile (PUT /api/auth/profile)
      const updateProfRes = await fetch(`${baseUrl}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${studentToken}`,
        },
        body: JSON.stringify({
          phone: '+1 (555) 999-8877',
          bio: 'Automated test profile bio focusing on high quality systems.',
          careerGoal: 'Full Stack Engineer',
          skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Docker'],
        }),
      });
      const updatedProfData = await updateProfRes.json();
      logTest(
        'PUT /api/auth/profile updates profile info successfully',
        updateProfRes.status === 200 && updatedProfData.careerGoal === 'Full Stack Engineer',
        `Career Goal updated to: "${updatedProfData.careerGoal}", Skills count: ${updatedProfData.skills?.length}`
      );
    }

    // ==========================================
    // 3. RESUME OPERATIONS & AI REVIEW
    // ==========================================
    console.log('\n📄 [3/8] Testing Resume Builder, Upload & AI Analysis...');
    {
      // 3.1 Get resume
      const getResRes = await fetch(`${baseUrl}/resume`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      const getResData = await getResRes.json();
      logTest(
        'GET /api/resume retrieves or initializes user resume',
        getResRes.status === 200 && !!getResData._id,
        `Resume title: "${getResData.title}"`
      );

      // 3.2 Update resume builder data
      const updateResRes = await fetch(`${baseUrl}/resume`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${studentToken}`,
        },
        body: JSON.stringify({
          title: 'Full Stack Engineer Resume',
          summary: 'Motivated software engineer with experience building web apps.',
          skills: [
            { name: 'React', level: 'Advanced' },
            { name: 'Node.js', level: 'Advanced' },
            { name: 'MongoDB', level: 'Intermediate' },
          ],
          education: [
            {
              institution: 'State University',
              degree: 'B.S.',
              field: 'Computer Science',
              startYear: 2020,
              endYear: 2024,
            },
          ],
          experience: [
            {
              company: 'Tech Startup',
              role: 'Junior Engineer',
              startDate: '2023-01-01',
              endDate: '2023-12-31',
              description: 'Built customer-facing features and optimized backend performance.',
            },
          ],
          projects: [
            {
              name: 'Cloud Dashboard',
              description: 'Real-time metrics app.',
              techStack: ['React', 'Express'],
            },
          ],
        }),
      });
      const updateResData = await updateResRes.json();
      logTest(
        'PUT /api/resume saves multi-section resume builder data',
        updateResRes.status === 200 && updateResData.skills?.length === 3,
        `Saved ${updateResData.skills?.length} skills and ${updateResData.experience?.length} experience entries`
      );

      // 3.3 Upload resume document (Multipart PDF simulation)
      const formData = new FormData();
      const fakePdfBlob = new Blob(['%PDF-1.4 Mock resume content for testing purposes'], { type: 'application/pdf' });
      formData.append('resume', fakePdfBlob, 'sample_resume.pdf');

      const uploadRes = await fetch(`${baseUrl}/resume/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}` },
        body: formData,
      });
      const uploadData = await uploadRes.json();
      logTest(
        'POST /api/resume/upload uploads and stores resume file',
        uploadRes.status === 200 && !!uploadData.filename,
        `Uploaded file saved as: ${uploadData.filename}`
      );

      // 3.4 AI Resume Analysis
      const analyzeRes = await fetch(`${baseUrl}/resume/analyze`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      const analyzeData = await analyzeRes.json();
      logTest(
        'POST /api/resume/analyze evaluates resume quality & returns AI insights',
        analyzeRes.status === 200 && typeof analyzeData.score === 'number' && Array.isArray(analyzeData.strengths),
        `Score: ${analyzeData.score}/100, Strengths: ${analyzeData.strengths?.length}, Keywords: ${analyzeData.keywords?.length}`
      );
    }

    // ==========================================
    // 4. AI CAREER GUIDANCE & ROADMAP OPERATIONS
    // ==========================================
    console.log('\n🧭 [4/8] Testing AI Career Guidance, Chatbot & Learning Roadmap...');
    {
      // 4.1 Career Recommendations
      const recRes = await fetch(`${baseUrl}/career/recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${studentToken}`,
        },
        body: JSON.stringify({
          careerGoal: 'Full Stack Engineer',
          currentSkills: ['React', 'Node.js', 'MongoDB'],
          education: [{ degree: 'B.S. Computer Science' }],
        }),
      });
      const recData = await recRes.json();
      logTest(
        'POST /api/career/recommendations returns tailored career paths and salaries',
        recRes.status === 200 && Array.isArray(recData.topCareerPaths) && recData.topCareerPaths.length > 0,
        `Found ${recData.topCareerPaths?.length} paths. Top: "${recData.topCareerPaths?.[0]?.title}" (Match: ${recData.topCareerPaths?.[0]?.matchScore}%)`
      );

      // 4.2 AI Career Chatbot
      const chatRes = await fetch(`${baseUrl}/career/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${studentToken}`,
        },
        body: JSON.stringify({
          message: 'What skills should I learn next to become a senior engineer?',
          history: [
            { role: 'user', content: 'Hi, I want career advice.' },
            { role: 'assistant', content: 'Hello! I am ready to help you.' },
          ],
        }),
      });
      const chatData = await chatRes.json();
      logTest(
        'POST /api/career/chat generates conversational career counseling response',
        chatRes.status === 200 && typeof chatData.reply === 'string' && chatData.reply.length > 15,
        `AI reply snippet: "${chatData.reply?.slice(0, 70)}..."`
      );

      // 4.3 Skill Gap Analysis
      const gapRes = await fetch(`${baseUrl}/career/skill-gap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${studentToken}`,
        },
        body: JSON.stringify({
          careerGoal: 'Cloud Solutions Architect',
          currentSkills: ['JavaScript', 'HTML/CSS'],
        }),
      });
      const gapData = await gapRes.json();
      logTest(
        'POST /api/career/skill-gap assesses missing skills & learning estimates',
        gapRes.status === 200 && (Array.isArray(gapData.missingSkills) || !!gapData.currentSkillsAssessment),
        `Readiness: ${gapData.overallReadiness || 'Evaluated'}, Missing skills identified: ${gapData.missingSkills?.length || 'Yes'}`
      );

      // 4.4 Generate Learning Roadmap
      const roadmapRes = await fetch(`${baseUrl}/career/roadmap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${studentToken}`,
        },
        body: JSON.stringify({
          careerGoal: 'Full Stack Engineer',
          currentSkills: ['React', 'Node.js'],
          skillGaps: ['Docker', 'AWS', 'Redis'],
        }),
      });
      const roadmapData = await roadmapRes.json();
      logTest(
        'POST /api/career/roadmap generates and saves phased learning curriculum',
        roadmapRes.status === 200 && Array.isArray(roadmapData.roadmap) && roadmapData.roadmap.length > 0,
        `Generated ${roadmapData.roadmap?.length} phases, Initial Progress: ${roadmapData.overallProgress}%`
      );

      // 4.5 Get Saved Roadmap
      const getRoadmapRes = await fetch(`${baseUrl}/career/roadmap`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      const getRoadmapData = await getRoadmapRes.json();
      logTest(
        'GET /api/career/roadmap retrieves stored curriculum from database',
        getRoadmapRes.status === 200 && getRoadmapData.careerGoal === 'Full Stack Engineer',
        `Goal: "${getRoadmapData.careerGoal}", Total Phases: ${getRoadmapData.roadmap?.length}`
      );

      // 4.6 Update Topic Progress
      const updateTopicRes = await fetch(`${baseUrl}/career/roadmap/topic`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${studentToken}`,
        },
        body: JSON.stringify({
          phaseIndex: 0,
          topicIndex: 0,
          completed: true,
        }),
      });
      const updateTopicData = await updateTopicRes.json();
      logTest(
        'PUT /api/career/roadmap/topic updates completion & recalculates overall progress %',
        updateTopicRes.status === 200 && updateTopicData.roadmap?.[0]?.topics?.[0]?.completed === true,
        `New overall progress: ${updateTopicData.overallProgress}%, Topic 0 completed: ${updateTopicData.roadmap?.[0]?.topics?.[0]?.completed}`
      );
    }

    // ==========================================
    // 5. AI MOCK INTERVIEW OPERATIONS
    // ==========================================
    console.log('\n🎙️ [5/8] Testing AI Mock Interview System...');
    {
      // 5.1 Start Interview
      const startRes = await fetch(`${baseUrl}/interview/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${studentToken}`,
        },
        body: JSON.stringify({
          jobRole: 'Full Stack Developer',
          difficulty: 'Medium',
        }),
      });
      const startData = await startRes.json();
      createdInterviewId = startData._id;
      logTest(
        'POST /api/interview/start generates questions & creates session',
        startRes.status === 201 && Array.isArray(startData.questions) && startData.questions.length > 0,
        `Interview ID: ${createdInterviewId}, Generated ${startData.questions?.length} questions for "${startData.jobRole}"`
      );

      // 5.2 Fetch Interview by ID
      const getIntRes = await fetch(`${baseUrl}/interview/${createdInterviewId}`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      const getIntData = await getIntRes.json();
      logTest(
        'GET /api/interview/:id fetches interview session details',
        getIntRes.status === 200 && getIntData._id === createdInterviewId,
        `Status: ${getIntData.status}, Difficulty: ${getIntData.difficulty}`
      );

      // 5.3 Submit Answers & Get AI Evaluation
      const answersPayload = (getIntData.questions || []).map((q, idx) => ({
        questionIndex: idx,
        answer: `This is a structured technical answer to "${q.question?.slice(0, 30)}..." implementing asynchronous patterns, error handling, and separation of concerns.`,
      }));

      const submitRes = await fetch(`${baseUrl}/interview/${createdInterviewId}/submit`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${studentToken}`,
        },
        body: JSON.stringify({ answers: answersPayload }),
      });
      const submitData = await submitRes.json();
      logTest(
        'PUT /api/interview/:id/submit evaluates answers, scores, and completes interview',
        submitRes.status === 200 &&
          submitData.status === 'completed' &&
          typeof submitData.overallScore === 'number' &&
          !!submitData.overallFeedback,
        `Overall Score: ${submitData.overallScore}/100, Status: ${submitData.status}, Feedback length: ${submitData.overallFeedback?.length} chars`
      );

      // 5.4 List user interviews
      const listIntRes = await fetch(`${baseUrl}/interview`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      const listIntData = await listIntRes.json();
      logTest(
        'GET /api/interview lists user interview history',
        listIntRes.status === 200 && Array.isArray(listIntData) && listIntData.length > 0,
        `Total user interviews: ${listIntData.length}`
      );
    }

    // ==========================================
    // 6. JOB APPLICATION TRACKER OPERATIONS
    // ==========================================
    console.log('\n💼 [6/8] Testing Job Application Tracker CRUD & Timeline...');
    {
      // 6.1 Create Job Application
      const createJobRes = await fetch(`${baseUrl}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${studentToken}`,
        },
        body: JSON.stringify({
          company: 'Acme Technologies',
          position: 'Full Stack Engineer',
          location: 'Remote',
          jobType: 'Full-time',
          salary: '$120,000 - $140,000',
          status: 'Applied',
          notes: 'Initial application submitted through company website.',
        }),
      });
      const createJobData = await createJobRes.json();
      createdJobId = createJobData._id;
      logTest(
        'POST /api/jobs creates new job application entry',
        createJobRes.status === 201 && !!createJobData._id,
        `Created Job ID: ${createdJobId}, Company: "${createJobData.company}", Status: "${createJobData.status}"`
      );

      // 6.2 Get user job applications
      const getJobsRes = await fetch(`${baseUrl}/jobs`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      const getJobsData = await getJobsRes.json();
      logTest(
        'GET /api/jobs lists applications for logged-in user',
        getJobsRes.status === 200 && Array.isArray(getJobsData) && getJobsData.some((j) => j._id === createdJobId),
        `Found ${getJobsData.length} job applications for user`
      );

      // 6.3 Update job application status and verify timeline tracking
      const updateJobRes = await fetch(`${baseUrl}/jobs/${createdJobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${studentToken}`,
        },
        body: JSON.stringify({
          status: 'Interview',
          note: 'Passed initial screening; technical interview scheduled.',
        }),
      });
      const updateJobData = await updateJobRes.json();
      const timelineUpdated = updateJobData.timeline?.some((t) => t.status === 'Interview');
      logTest(
        'PUT /api/jobs/:id updates job status and automatically records timeline event',
        updateJobRes.status === 200 && updateJobData.status === 'Interview' && timelineUpdated,
        `New status: "${updateJobData.status}", Timeline events count: ${updateJobData.timeline?.length}`
      );

      // 6.4 Delete job application
      const delJobRes = await fetch(`${baseUrl}/jobs/${createdJobId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      const delJobData = await delJobRes.json();
      logTest(
        'DELETE /api/jobs/:id removes job application',
        delJobRes.status === 200 && delJobData.message?.toLowerCase().includes('deleted'),
        `Status: ${delJobRes.status}, Message: "${delJobData.message}"`
      );
    }

    // ==========================================
    // 7. ADMINISTRATOR DASHBOARD & ACCESS CONTROL
    // ==========================================
    console.log('\n🛡️ [7/8] Testing Administrator Operations & Access Control...');
    {
      // 7.1 Student forbidden from accessing admin endpoints
      const forbidRes = await fetch(`${baseUrl}/jobs/admin/stats`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      logTest(
        'GET /api/jobs/admin/stats denies access to regular student token',
        forbidRes.status === 403,
        `Status: ${forbidRes.status} (Forbidden as expected)`
      );

      // 7.2 Admin accessing stats
      const adminStatsRes = await fetch(`${baseUrl}/jobs/admin/stats`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const adminStatsData = await adminStatsRes.json();
      logTest(
        'GET /api/jobs/admin/stats returns aggregate platform statistics for admin',
        adminStatsRes.status === 200 &&
          typeof adminStatsData.totalUsers === 'number' &&
          typeof adminStatsData.totalJobs === 'number',
        `Platform stats -> Students: ${adminStatsData.totalUsers}, Jobs: ${adminStatsData.totalJobs}, Interviews: ${adminStatsData.totalInterviews}, Resumes: ${adminStatsData.totalResumes}`
      );

      // 7.3 Admin accessing all applications across platform
      const adminAllRes = await fetch(`${baseUrl}/jobs/admin/all`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const adminAllData = await adminAllRes.json();
      logTest(
        'GET /api/jobs/admin/all lists all student applications across platform',
        adminAllRes.status === 200 && Array.isArray(adminAllData.jobs) && adminAllData.jobs.length >= 8,
        `Total system applications: ${adminAllData.jobs?.length}, Breakdown: Applied=${adminAllData.stats?.applied}, Interview=${adminAllData.stats?.interview}, Offer=${adminAllData.stats?.offer}`
      );
    }

    // ==========================================
    // 8. ERROR HANDLING & SECURITY RESILIENCE
    // ==========================================
    console.log('\n⚠️ [8/8] Testing Error Handling, Invalid Tokens & Route Fallbacks...');
    {
      // 8.1 No token provided
      const noAuthRes = await fetch(`${baseUrl}/auth/me`);
      logTest(
        'GET /api/auth/me rejects unauthenticated request without token',
        noAuthRes.status === 401,
        `Status: ${noAuthRes.status} Unauthorized`
      );

      // 8.2 Invalid/Malformed token
      const badTokenRes = await fetch(`${baseUrl}/auth/me`, {
        headers: { Authorization: 'Bearer this-is-an-invalid-tampered-token' },
      });
      logTest(
        'GET /api/auth/me rejects invalid / tampered token',
        badTokenRes.status === 401,
        `Status: ${badTokenRes.status} Unauthorized`
      );

      // 8.3 404 on non-existent endpoint
      const nonExistentRes = await fetch(`${baseUrl}/non-existent-route-${Date.now()}`);
      logTest(
        'GET /api/non-existent-route returns 404 Route not found',
        nonExistentRes.status === 404,
        `Status: ${nonExistentRes.status} Not Found`
      );
    }

    // ==========================================
    // TEST SUITE SUMMARY
    // ==========================================
    console.log('\n=============================================================');
    console.log('📊 TEST EXECUTION SUMMARY:');
    console.log('=============================================================');
    console.log(`  Total Operations Tested: ${passedTests + failedTests}`);
    console.log(`  Passed: ${passedTests} ✅`);
    console.log(`  Failed: ${failedTests} ${failedTests === 0 ? '🎉' : '❌'}`);
    console.log(`  Success Rate: ${Math.round((passedTests / (passedTests + failedTests)) * 100)}%`);
    console.log('=============================================================\n');

    return {
      success: failedTests === 0,
      passedTests,
      failedTests,
      results: testResults,
    };
  } finally {
    server.close();
  }
};

// Allow standalone execution: node testOperations.js
if (require.main === module) {
  runAllTests()
    .then((res) => {
      if (!res.success) {
        console.error('❌ Some tests failed.');
        process.exit(1);
      } else {
        console.log('🎉 All system operations tested and verified working perfectly!');
        process.exit(0);
      }
    })
    .catch((err) => {
      console.error('💥 Test suite fatal error:', err);
      process.exit(1);
    });
}

module.exports = runAllTests;
