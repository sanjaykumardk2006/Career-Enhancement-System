const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = require('../config/db');
const User = require('../models/User');
const Resume = require('../models/Resume');
const LearningRoadmap = require('../models/LearningRoadmap');
const Interview = require('../models/Interview');
const JobApplication = require('../models/JobApplication');

const fakeUsers = [
  {
    name: 'Alex Chen',
    email: 'alex.chen@example.com',
    password: 'Password123!',
    role: 'student',
    phone: '+1 (555) 234-5678',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces',
    bio: 'Passionate full-stack cloud engineer dedicated to building scalable web services, microservices, and elegant user interfaces.',
    careerGoal: 'Full Stack Cloud Engineer',
    skills: ['React', 'Node.js', 'Express', 'TypeScript', 'MongoDB', 'Docker', 'AWS', 'TailwindCSS', 'REST APIs', 'Git'],
    education: [
      {
        institution: 'University of California, Berkeley',
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        startYear: 2020,
        endYear: 2024,
      },
    ],
    experience: [
      {
        company: 'NovaTech Solutions',
        role: 'Full Stack Software Engineer Intern',
        startDate: new Date('2023-05-15'),
        endDate: new Date('2023-09-01'),
        description: 'Engineered high-throughput RESTful microservices in Node.js and revamped React dashboard components, cutting load time by 35%.',
      },
      {
        company: 'Campus Dev Labs',
        role: 'Lead Frontend Developer',
        startDate: new Date('2022-09-01'),
        endDate: new Date('2023-05-01'),
        description: 'Led a team of 4 student developers to build an internal campus event platform serving 3,000+ active students.',
      },
    ],
  },
  {
    name: 'Priya Patel',
    email: 'priya.patel@example.com',
    password: 'Password123!',
    role: 'student',
    phone: '+1 (555) 876-5432',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=faces',
    bio: 'AI & Data Science researcher focused on Large Language Models, prompt engineering, and semantic information retrieval.',
    careerGoal: 'AI / Machine Learning Engineer',
    skills: ['Python', 'PyTorch', 'TensorFlow', 'FastAPI', 'Pandas', 'LangChain', 'Scikit-Learn', 'Vector Databases', 'SQL'],
    education: [
      {
        institution: 'Georgia Institute of Technology',
        degree: 'Master of Science',
        field: 'Artificial Intelligence & Machine Learning',
        startYear: 2022,
        endYear: 2024,
      },
    ],
    experience: [
      {
        company: 'NeuralCraft AI',
        role: 'Machine Learning Research Intern',
        startDate: new Date('2023-06-01'),
        endDate: new Date('2024-01-15'),
        description: 'Developed semantic search retrieval pipeline using vector embeddings and LangChain, improving answer accuracy by 40%.',
      },
    ],
  },
  {
    name: 'Marcus Vance',
    email: 'marcus.vance@example.com',
    password: 'Password123!',
    role: 'student',
    phone: '+1 (555) 432-1098',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces',
    bio: 'DevOps & Site Reliability engineer passionate about automated CI/CD pipelines, container orchestration, and zero-downtime deployments.',
    careerGoal: 'DevOps & Platform Engineer',
    skills: ['Kubernetes', 'Docker', 'Terraform', 'AWS', 'GitHub Actions', 'Linux', 'Go', 'Prometheus', 'Grafana'],
    education: [
      {
        institution: 'Purdue University',
        degree: 'Bachelor of Science',
        field: 'Computer Engineering',
        startYear: 2019,
        endYear: 2023,
      },
    ],
    experience: [
      {
        company: 'CloudScale Systems',
        role: 'Junior DevOps Engineer',
        startDate: new Date('2023-06-01'),
        endDate: new Date('2024-04-01'),
        description: 'Automated infrastructure provisioning with Terraform and managed Kubernetes clusters across multi-region AWS environments.',
      },
    ],
  },
];

const seedFakeData = async () => {
  console.log('🌱 ========================================');
  console.log('🌱 Starting Career Enhancement System Seeder');
  console.log('🌱 ========================================');

  // Ensure database connection
  if (mongoose.connection.readyState === 0) {
    await connectDB();
  }

  const createdUsers = [];

  // 1. Seed or update Students
  for (const userData of fakeUsers) {
    let user = await User.findOne({ email: userData.email });
    if (!user) {
      user = await User.create(userData);
      console.log(`👤 Created Demo Student: ${user.name} (${user.email})`);
    } else {
      user.name = userData.name;
      user.phone = userData.phone;
      user.bio = userData.bio;
      user.careerGoal = userData.careerGoal;
      user.skills = userData.skills;
      user.education = userData.education;
      user.experience = userData.experience;
      user.avatar = userData.avatar;
      user.password = userData.password; // Triggers password hash pre-save hook
      await user.save();
      console.log(`👤 Updated Demo Student: ${user.name} (${user.email})`);
    }
    createdUsers.push(user);
  }

  const [alex, priya, marcus] = createdUsers;

  // 2. Seed Resumes
  console.log('📄 Seeding realistic multi-section Resumes...');
  await Resume.deleteMany({ user: { $in: createdUsers.map((u) => u._id) } });

  // Alex's Resume
  await Resume.create({
    user: alex._id,
    title: 'Alex Chen - Full Stack Software Engineer Resume',
    personalInfo: {
      name: alex.name,
      email: alex.email,
      phone: alex.phone,
      address: 'San Francisco, CA',
      linkedin: 'https://linkedin.com/in/alexchen-demo',
      github: 'https://github.com/alexchen-demo',
      portfolio: 'https://alexchen.dev',
    },
    summary:
      'Proactive and results-oriented Full Stack Cloud Engineer with solid experience in building responsive web applications, scalable REST APIs, and microservices. Skilled in React, Node.js, TypeScript, Docker, and AWS deployments.',
    education: [
      {
        institution: 'University of California, Berkeley',
        degree: 'Bachelor of Science in Computer Science',
        field: 'Computer Science',
        startYear: 2020,
        endYear: 2024,
        gpa: '3.82 / 4.00',
      },
    ],
    experience: [
      {
        company: 'NovaTech Solutions',
        role: 'Full Stack Software Engineer Intern',
        startDate: 'May 2023',
        endDate: 'Sep 2023',
        current: false,
        description: 'Engineered backend microservices and modern React user interfaces for an enterprise analytics dashboard.',
        achievements: [
          'Decreased API query response times by 35% through indexing and caching optimizations',
          'Built end-to-end authentication workflows using JWT and bcrypt',
          'Participated in daily agile standups and code reviews with senior engineering leads',
        ],
      },
      {
        company: 'Campus Dev Labs',
        role: 'Frontend Engineering Lead',
        startDate: 'Sep 2022',
        endDate: 'May 2023',
        current: false,
        description: 'Led architecture and design for student portal supporting 3,000+ daily sessions.',
        achievements: [
          'Migrated legacy UI codebase to React 18 and TailwindCSS',
          'Achieved 98% Lighthouse accessibility and performance ratings',
        ],
      },
    ],
    skills: [
      { name: 'React.js', level: 'Expert' },
      { name: 'Node.js & Express', level: 'Advanced' },
      { name: 'TypeScript', level: 'Advanced' },
      { name: 'MongoDB & Mongoose', level: 'Advanced' },
      { name: 'Docker & Containers', level: 'Intermediate' },
      { name: 'AWS Cloud Services', level: 'Intermediate' },
      { name: 'TailwindCSS', level: 'Expert' },
      { name: 'Git & GitHub Actions', level: 'Expert' },
    ],
    projects: [
      {
        name: 'CloudPulse - Distributed Metrics Monitor',
        description: 'Real-time telemetry monitor built with React, Node.js, WebSockets, and Dockerized microservices.',
        techStack: ['React', 'Node.js', 'WebSockets', 'Docker', 'Chart.js'],
        link: 'https://cloudpulse-demo.app',
        github: 'https://github.com/alexchen-demo/cloudpulse',
      },
      {
        name: 'AI Career Companion',
        description: 'AI-assisted resume analysis and mock interview simulator built on top of Gemini AI.',
        techStack: ['MERN', 'Gemini AI', 'TailwindCSS', 'JWT'],
        link: 'https://careerai-demo.app',
        github: 'https://github.com/alexchen-demo/career-companion',
      },
    ],
    certifications: [
      {
        name: 'AWS Certified Cloud Practitioner',
        issuer: 'Amazon Web Services',
        date: '2024-01-15',
        url: 'https://aws.amazon.com/certification',
      },
      {
        name: 'Meta Front-End Developer Professional Certificate',
        issuer: 'Meta / Coursera',
        date: '2023-08-20',
        url: 'https://coursera.org/verify/meta-frontend',
      },
    ],
    aiAnalysis: {
      score: 88,
      strengths: [
        'Well-balanced technical portfolio highlighting both frontend and backend expertise',
        'Strong quantifiable achievements with measurable performance impacts',
        'Modern, relevant technology stack well aligned with Full Stack Cloud Engineering',
      ],
      weaknesses: [
        'Could include more details regarding automated unit/integration testing coverage (e.g. Jest, Vitest)',
        'Cloud infrastructure cost reduction figures could be explicitly stated in intern bullet points',
      ],
      suggestions: [
        'Add a dedicated section detailing automated testing and CI/CD pipelines',
        'Emphasize experience with database indexing, schema migrations, and concurrency',
        'Link directly to live deployed demonstrations for all featured open-source repositories',
      ],
      keywords: [
        'React', 'Node.js', 'TypeScript', 'MongoDB', 'AWS', 'Docker', 'RESTful APIs',
        'Microservices', 'Git', 'Agile', 'Performance Optimization', 'Full Stack'
      ],
      analyzedAt: new Date(),
    },
  });

  // Priya's Resume
  await Resume.create({
    user: priya._id,
    title: 'Priya Patel - Machine Learning Engineer Resume',
    personalInfo: {
      name: priya.name,
      email: priya.email,
      phone: priya.phone,
      address: 'Atlanta, GA',
      linkedin: 'https://linkedin.com/in/priyapatel-demo',
      github: 'https://github.com/priyapatel-demo',
    },
    summary:
      'AI & Machine Learning Engineer with research focus on natural language processing, vector retrieval, and Large Language Model fine-tuning.',
    skills: [
      { name: 'Python', level: 'Expert' },
      { name: 'PyTorch', level: 'Advanced' },
      { name: 'LangChain & LLMs', level: 'Advanced' },
      { name: 'Vector DBs (Pinecone, Chroma)', level: 'Advanced' },
      { name: 'FastAPI', level: 'Intermediate' },
    ],
    aiAnalysis: {
      score: 92,
      strengths: ['Specialized expertise in state-of-the-art Generative AI and vector search'],
      weaknesses: ['Could demonstrate broader cloud deployment architectures for ML models'],
      suggestions: ['Add Docker containerization examples for serving models on Kubernetes'],
      keywords: ['Python', 'PyTorch', 'LLMs', 'LangChain', 'FastAPI', 'Vector Search', 'NLP'],
      analyzedAt: new Date(),
    },
  });

  console.log('✅ Resumes seeded successfully.');

  // 3. Seed Learning Roadmaps
  console.log('🗺️ Seeding structured Learning Roadmaps...');
  await LearningRoadmap.deleteMany({ user: { $in: createdUsers.map((u) => u._id) } });

  await LearningRoadmap.create({
    user: alex._id,
    careerGoal: 'Full Stack Cloud Engineer',
    skillGaps: ['Redis Caching', 'Docker Orchestration', 'AWS ECS / Lambda', 'System Design'],
    roadmap: [
      {
        phase: 1,
        title: 'Phase 1: Advanced Backend Architecture & Caching',
        duration: '3 weeks',
        topics: [
          {
            name: 'Redis In-Memory Caching & Session Store',
            resources: [
              { title: 'Redis University - Caching Essentials', url: 'https://university.redis.com', type: 'Course' },
              { title: 'Node.js Redis Implementation Guide', url: 'https://redis.io/docs/clients/nodejs/', type: 'Article' },
            ],
            completed: true,
            completedAt: new Date('2024-02-10'),
          },
          {
            name: 'Database Indexing, Aggregation & Query Profiling',
            resources: [
              { title: 'MongoDB University - Performance Optimization', url: 'https://learn.mongodb.com', type: 'Course' },
              { title: 'Deep Dive: B-Tree Indexing Strategies', url: 'https://use-the-index-luke.com', type: 'Book' },
            ],
            completed: true,
            completedAt: new Date('2024-02-25'),
          },
          {
            name: 'Message Queues & Event-Driven Architecture (RabbitMQ/Kafka)',
            resources: [
              { title: 'Event-Driven Microservices Patterns', url: 'https://microservices.io/patterns/data/event-driven-architecture.html', type: 'Article' },
            ],
            completed: false,
          },
        ],
      },
      {
        phase: 2,
        title: 'Phase 2: Containerization & Cloud Infrastructure',
        duration: '4 weeks',
        topics: [
          {
            name: 'Docker Multi-Stage Builds & Image Optimization',
            resources: [
              { title: 'Official Docker Best Practices Guide', url: 'https://docs.docker.com/develop/develop-images/dockerfile_best-practices/', type: 'Article' },
              { title: 'Full Stack Containerization Hands-On', url: 'https://docker-curriculum.com', type: 'Practice' },
            ],
            completed: true,
            completedAt: new Date('2024-03-05'),
          },
          {
            name: 'AWS Container Deployment (ECS / Fargate / ECR)',
            resources: [
              { title: 'Deploying Node.js Containers on AWS ECS', url: 'https://aws.amazon.com/ecs/', type: 'Video' },
            ],
            completed: false,
          },
          {
            name: 'Infrastructure as Code with Terraform Basics',
            resources: [
              { title: 'Terraform Associate Certification Path', url: 'https://developer.hashicorp.com/terraform/tutorials', type: 'Course' },
            ],
            completed: false,
          },
        ],
      },
      {
        phase: 3,
        title: 'Phase 3: System Design & Production Observability',
        duration: '3 weeks',
        topics: [
          {
            name: 'Scalable System Design & Load Balancing',
            resources: [
              { title: 'System Design Primer', url: 'https://github.com/donnemartin/system-design-primer', type: 'Practice' },
            ],
            completed: false,
          },
          {
            name: 'Application Monitoring with OpenTelemetry & Prometheus',
            resources: [
              { title: 'Observability Fundamentals', url: 'https://opentelemetry.io', type: 'Article' },
            ],
            completed: false,
          },
        ],
      },
    ],
    overallProgress: 38,
    generatedAt: new Date(),
  });

  console.log('✅ Learning Roadmaps seeded successfully.');

  // 4. Seed AI Mock Interviews
  console.log('🎙️ Seeding AI Mock Interviews...');
  await Interview.deleteMany({ user: { $in: createdUsers.map((u) => u._id) } });

  // Alex's completed interview
  await Interview.create({
    user: alex._id,
    jobRole: 'Full Stack Cloud Engineer',
    difficulty: 'Medium',
    status: 'completed',
    overallScore: 86,
    overallFeedback:
      'Alex exhibited strong foundational command over asynchronous JavaScript, REST design, and containerization tradeoffs. Answers were structured, articulate, and cited real-world practical examples. Further refinement can focus on estimating scaling numbers and database shard distribution.',
    completedAt: new Date('2024-03-12'),
    questions: [
      {
        question: 'Can you explain the differences between SQL and NoSQL databases, and when you would select MongoDB over PostgreSQL?',
        answer:
          'I choose MongoDB when the schema evolves rapidly or when dealing with hierarchical documents such as product catalogs or user profiles where co-locating data avoids costly multi-table joins. I favor PostgreSQL when strict ACID transactions, complex relational integrity constraints, and strict mathematical aggregations are top priorities.',
        feedback: 'Excellent breakdown of relational vs document model tradeoffs. Clear and concise reasoning. Improvement: You could mention indexing cost differences.',
        score: 9,
      },
      {
        question: 'How do you handle authentication, session state, and route protection in a production MERN application?',
        answer:
          'In my applications, I issue short-lived JWT tokens on authentication containing the user ID and role, verified via Express middleware. Sensitive routes check authorization roles before executing controller logic. Passwords are salted and hashed using bcrypt with an appropriate work factor.',
        feedback: 'Great understanding of stateless JWT architecture and security hygiene. Improvement: Consider mentioning refresh token rotation in HTTP-only cookies.',
        score: 8,
      },
      {
        question: 'What strategies do you employ to prevent common web security vulnerabilities like XSS, CSRF, and Injection attacks?',
        answer:
          'I utilize parameterized queries and Mongoose schemas to prevent NoSQL injection, sanitize user inputs, apply Helmet headers for CSP policies, and avoid directly inserting user strings into dangerouslySetInnerHTML in React.',
        feedback: 'Thorough coverage of essential web application security vectors. Highlighted both frontend and backend protections effectively.',
        score: 9,
      },
    ],
  });

  // Alex's in-progress interview (for testing in-progress state)
  await Interview.create({
    user: alex._id,
    jobRole: 'DevOps & Site Reliability Engineer',
    difficulty: 'Hard',
    status: 'in-progress',
    questions: [
      {
        question: 'Describe how you would design a zero-downtime blue/green deployment strategy for a containerized microservice on AWS.',
        answer: '',
      },
      {
        question: 'How do you troubleshoot a Kubernetes pod that is repeatedly crashing with an OOMKilled error?',
        answer: '',
      },
    ],
  });

  // Priya's completed interview
  await Interview.create({
    user: priya._id,
    jobRole: 'AI / Machine Learning Engineer',
    difficulty: 'Hard',
    status: 'completed',
    overallScore: 92,
    overallFeedback:
      'Priya demonstrated deep expertise in transformer architectures, attention mechanisms, and retrieval augmented generation (RAG). Highly impressive technical clarity and depth.',
    completedAt: new Date('2024-03-14'),
    questions: [
      {
        question: 'How does Retrieval-Augmented Generation (RAG) address LLM hallucination and knowledge cutoff issues?',
        answer:
          'RAG retrieves relevant external documents via vector similarity search against domain chunks, prepending these context chunks directly into the model prompt before synthesis.',
        feedback: 'Spot-on technical explanation. Clearly communicated how grounding prompts with vector context suppresses hallucinations.',
        score: 10,
      },
    ],
  });

  console.log('✅ AI Mock Interviews seeded successfully.');

  // 5. Seed Job Applications
  console.log('💼 Seeding Job Tracker Applications...');
  await JobApplication.deleteMany({ user: { $in: createdUsers.map((u) => u._id) } });

  const alexJobs = [
    {
      user: alex._id,
      company: 'Stripe',
      position: 'Full Stack Engineer - Developer Infrastructure',
      location: 'San Francisco, CA (Hybrid)',
      jobType: 'Full-time',
      salary: '$145,000 - $170,000',
      jobUrl: 'https://stripe.com/jobs/full-stack-engineer',
      status: 'Offer',
      appliedDate: new Date('2024-01-10'),
      notes: 'Received official offer letter! Compensation review meeting scheduled for Friday.',
      contacts: [{ name: 'Sarah Miller', email: 'smiller@stripe.com', role: 'Technical Recruiter' }],
      timeline: [
        { status: 'Applied', date: new Date('2024-01-10'), note: 'Applied via company careers portal' },
        { status: 'Screening', date: new Date('2024-01-18'), note: 'Recruiter phone screening passed' },
        { status: 'Interview', date: new Date('2024-02-05'), note: 'Completed 4-round technical loop' },
        { status: 'Offer', date: new Date('2024-02-28'), note: 'Received formal written offer letter' },
      ],
    },
    {
      user: alex._id,
      company: 'GitHub',
      position: 'Software Engineer II - Actions & Cloud Systems',
      location: 'Remote (US)',
      jobType: 'Full-time',
      salary: '$135,000 - $160,000',
      jobUrl: 'https://github.com/careers',
      status: 'Interview',
      appliedDate: new Date('2024-02-01'),
      notes: 'Onsite interview scheduled for next Tuesday. Reviewing distributed systems and GitHub APIs.',
      contacts: [{ name: 'David Zhao', email: 'dzhao@github.com', role: 'Hiring Manager' }],
      timeline: [
        { status: 'Applied', date: new Date('2024-02-01'), note: 'Submitted resume and portfolio' },
        { status: 'Screening', date: new Date('2024-02-12'), note: 'Passed technical recruiter interview' },
        { status: 'Interview', date: new Date('2024-02-24'), note: 'Virtual onsite interviews scheduled' },
      ],
    },
    {
      user: alex._id,
      company: 'Datadog',
      position: 'Full Stack Software Engineer',
      location: 'New York, NY',
      jobType: 'Full-time',
      salary: '$130,000 - $155,000',
      status: 'Screening',
      appliedDate: new Date('2024-02-15'),
      notes: 'Initial recruiter screening conversation booked.',
      timeline: [
        { status: 'Applied', date: new Date('2024-02-15'), note: 'Applied through LinkedIn Easy Apply' },
        { status: 'Screening', date: new Date('2024-02-22'), note: 'Recruiter phone screen scheduled' },
      ],
    },
    {
      user: alex._id,
      company: 'Amazon Web Services (AWS)',
      position: 'Cloud Support Engineer - Microservices',
      location: 'Seattle, WA',
      jobType: 'Full-time',
      salary: '$120,000 - $140,000',
      status: 'Rejected',
      appliedDate: new Date('2023-12-05'),
      notes: 'Reached final round, role put on freeze. Re-apply in 6 months.',
      timeline: [
        { status: 'Applied', date: new Date('2023-12-05'), note: 'Submitted application' },
        { status: 'Rejected', date: new Date('2024-01-15'), note: 'Position closed due to team reorg' },
      ],
    },
    {
      user: alex._id,
      company: 'Vercel',
      position: 'Frontend Systems Engineer',
      location: 'Remote',
      jobType: 'Full-time',
      salary: '$140,000 - $165,000',
      status: 'Applied',
      appliedDate: new Date('2024-03-01'),
      notes: 'Referral submitted by senior engineer from campus hackathon.',
      timeline: [
        { status: 'Applied', date: new Date('2024-03-01'), note: 'Referred application submitted' },
      ],
    },
  ];

  const priyaJobs = [
    {
      user: priya._id,
      company: 'OpenAI',
      position: 'Research Engineer - Retrieval Systems',
      location: 'San Francisco, CA',
      jobType: 'Full-time',
      salary: '$180,000 - $220,000',
      status: 'Interview',
      appliedDate: new Date('2024-02-08'),
      timeline: [
        { status: 'Applied', date: new Date('2024-02-08'), note: 'Application submitted' },
        { status: 'Interview', date: new Date('2024-02-26'), note: 'Technical evaluation round' },
      ],
    },
    {
      user: priya._id,
      company: 'Anthropic',
      position: 'Prompt Engineering & Safety Analyst',
      location: 'San Francisco, CA',
      jobType: 'Full-time',
      salary: '$165,000 - $190,000',
      status: 'Offer',
      appliedDate: new Date('2024-01-15'),
      timeline: [
        { status: 'Applied', date: new Date('2024-01-15'), note: 'Application submitted' },
        { status: 'Offer', date: new Date('2024-03-01'), note: 'Received offer package' },
      ],
    },
  ];

  const marcusJobs = [
    {
      user: marcus._id,
      company: 'HashiCorp',
      position: 'DevOps & Infrastructure Engineer',
      location: 'Remote',
      jobType: 'Full-time',
      salary: '$135,000 - $155,000',
      status: 'Interview',
      appliedDate: new Date('2024-02-18'),
      timeline: [
        { status: 'Applied', date: new Date('2024-02-18'), note: 'Application submitted' },
        { status: 'Interview', date: new Date('2024-03-05'), note: 'System design interview scheduled' },
      ],
    },
  ];

  await JobApplication.insertMany([...alexJobs, ...priyaJobs, ...marcusJobs]);
  console.log(`✅ Job Applications seeded successfully (Total: ${alexJobs.length + priyaJobs.length + marcusJobs.length}).`);

  // Summary
  console.log('\n========================================');
  console.log('🎉 FAKE DATA SEEDING COMPLETE!');
  console.log('========================================');
  console.log('✨ Demo Student Accounts:');
  console.log('  1. alex.chen@example.com    / Password123! (Full Stack Cloud Engineer)');
  console.log('  2. priya.patel@example.com  / Password123! (AI / Machine Learning Engineer)');
  console.log('  3. marcus.vance@example.com / Password123! (DevOps & Platform Engineer)');
  console.log('\n✨ System Administrator:');
  console.log(`  - ${process.env.ADMIN_EMAIL || 'admin@careerai.com'} / ${process.env.ADMIN_PASSWORD || 'AdminSecurePass123!'}`);
  console.log('========================================\n');

  return {
    users: createdUsers,
    totalJobs: alexJobs.length + priyaJobs.length + marcusJobs.length,
  };
};

// Allow standalone execution: node seedFakeData.js
if (require.main === module) {
  seedFakeData()
    .then(() => {
      console.log('Database seeding process finished.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Seeding error:', err);
      process.exit(1);
    });
}

module.exports = seedFakeData;
