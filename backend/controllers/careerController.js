const { generateJSON, generateContent } = require('../utils/geminiClient');
const User = require('../models/User');
const LearningRoadmap = require('../models/LearningRoadmap');

// @desc    Get AI Career Recommendations
// @route   POST /api/career/recommendations
// @access  Private
const getCareerRecommendations = async (req, res) => {
  try {
    const { careerGoal, currentSkills, education } = req.body;

    const prompt = `You are an expert career counselor. Based on the following student profile, provide detailed career recommendations:

Career Goal: ${careerGoal}
Current Skills: ${currentSkills?.join(', ')}
Education: ${JSON.stringify(education)}

Return a JSON object with:
{
  "topCareerPaths": [
    {
      "title": "Career title",
      "description": "Brief description",
      "averageSalary": "Salary range",
      "demandLevel": "High/Medium/Low",
      "requiredSkills": ["skill1", "skill2"],
      "matchScore": number (0-100)
    }
  ],
  "immediateActions": ["action1", "action2", "action3"],
  "industryInsights": "Brief paragraph about the industry",
  "timeToGoal": "Estimated time to achieve goal"
}`;

    const recommendations = await generateJSON(prompt);
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    AI Career Chatbot
// @route   POST /api/career/chat
// @access  Private
const careerChat = async (req, res) => {
  try {
    const { message, history } = req.body;
    const user = await User.findById(req.user._id).select('-password');

    const context = `You are CareerBot, an expert AI career advisor for the Career Enhancement System. 
You help students with career guidance, job search strategies, skill development, resume tips, and interview preparation.
The student's name is ${user.name}, their career goal is "${user.careerGoal || 'not set yet'}", and their skills are: ${user.skills?.join(', ') || 'not listed yet'}.
Be friendly, encouraging, practical, and specific in your advice. Keep responses concise but helpful.`;

    const conversationHistory = history
      ?.map((h) => `${h.role === 'user' ? 'Student' : 'CareerBot'}: ${h.content}`)
      .join('\n') || '';

    const fullPrompt = `${context}\n\nConversation History:\n${conversationHistory}\n\nStudent: ${message}\n\nCareerBot:`;

    const reply = await generateContent(fullPrompt);
    res.json({ reply: reply.trim() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Skill Gap Analysis
// @route   POST /api/career/skill-gap
const ROLE_SKILLS_TAXONOMY = {
  'frontend developer': [
    { skill: 'HTML5, Semantic Markup & CSS3', relevance: 'High', proficiencyNeeded: 'Advanced' },
    { skill: 'Modern JavaScript (ES6+) & TypeScript', relevance: 'High', proficiencyNeeded: 'Advanced' },
    { skill: 'React.js & Component Architecture', relevance: 'High', proficiencyNeeded: 'Advanced' },
    { skill: 'Responsive Web Design & TailwindCSS', relevance: 'High', proficiencyNeeded: 'Intermediate' },
    { skill: 'State Management (Zustand / Redux)', relevance: 'Medium', proficiencyNeeded: 'Intermediate' },
    { skill: 'Web Performance Optimization & Accessibility', relevance: 'Medium', proficiencyNeeded: 'Intermediate' },
  ],
  'backend developer': [
    { skill: 'Node.js & Express / Server Frameworks', relevance: 'High', proficiencyNeeded: 'Advanced' },
    { skill: 'Relational & NoSQL Databases (PostgreSQL / MongoDB)', relevance: 'High', proficiencyNeeded: 'Advanced' },
    { skill: 'RESTful API Architecture & Validation', relevance: 'High', proficiencyNeeded: 'Advanced' },
    { skill: 'Authentication & JWT / OAuth Security', relevance: 'High', proficiencyNeeded: 'Intermediate' },
    { skill: 'Distributed Caching (Redis)', relevance: 'Medium', proficiencyNeeded: 'Intermediate' },
    { skill: 'Microservices & Docker Containerization', relevance: 'Medium', proficiencyNeeded: 'Intermediate' },
  ],
  'data scientist': [
    { skill: 'Python (NumPy, Pandas, SciPy)', relevance: 'High', proficiencyNeeded: 'Advanced' },
    { skill: 'Statistical Analysis & Hypothesis Testing', relevance: 'High', proficiencyNeeded: 'Advanced' },
    { skill: 'Machine Learning Algorithms (Scikit-Learn)', relevance: 'High', proficiencyNeeded: 'Advanced' },
    { skill: 'SQL & Data Warehousing', relevance: 'High', proficiencyNeeded: 'Intermediate' },
    { skill: 'Data Visualization (Matplotlib, Seaborn, Tableau)', relevance: 'Medium', proficiencyNeeded: 'Intermediate' },
    { skill: 'Deep Learning & Neural Networks', relevance: 'Medium', proficiencyNeeded: 'Basic' },
  ],
  'machine learning engineer': [
    { skill: 'Python & C++ Foundations', relevance: 'High', proficiencyNeeded: 'Advanced' },
    { skill: 'PyTorch / TensorFlow Deep Learning Frameworks', relevance: 'High', proficiencyNeeded: 'Advanced' },
    { skill: 'Model Deployment, Serving & MLOps', relevance: 'High', proficiencyNeeded: 'Intermediate' },
    { skill: 'Vector Databases & LLM Fine-Tuning', relevance: 'Medium', proficiencyNeeded: 'Intermediate' },
    { skill: 'Data Pipeline Engineering (Airflow/Spark)', relevance: 'Medium', proficiencyNeeded: 'Intermediate' },
  ],
  'cloud architect': [
    { skill: 'AWS / Azure / GCP Cloud Services Architecture', relevance: 'High', proficiencyNeeded: 'Advanced' },
    { skill: 'Infrastructure as Code (Terraform / CloudFormation)', relevance: 'High', proficiencyNeeded: 'Advanced' },
    { skill: 'Cloud Networking (VPCs, Subnets, Gateways, DNS)', relevance: 'High', proficiencyNeeded: 'Advanced' },
    { skill: 'Container Orchestration with Kubernetes', relevance: 'High', proficiencyNeeded: 'Intermediate' },
    { skill: 'Cloud Security, IAM Policies & Compliance', relevance: 'High', proficiencyNeeded: 'Intermediate' },
    { skill: 'Cost Optimization & Disaster Recovery Planning', relevance: 'Medium', proficiencyNeeded: 'Intermediate' },
  ],
  'cybersecurity analyst': [
    { skill: 'Network Protocols & Packet Analysis (Wireshark)', relevance: 'High', proficiencyNeeded: 'Advanced' },
    { skill: 'Linux & Windows Security Hardening', relevance: 'High', proficiencyNeeded: 'Advanced' },
    { skill: 'Vulnerability Scanning & Penetration Testing', relevance: 'High', proficiencyNeeded: 'Intermediate' },
    { skill: 'SIEM Tools & Security Event Monitoring', relevance: 'High', proficiencyNeeded: 'Intermediate' },
    { skill: 'OWASP Top 10 Web Vulnerabilities', relevance: 'High', proficiencyNeeded: 'Advanced' },
    { skill: 'Incident Response & Threat Hunting', relevance: 'Medium', proficiencyNeeded: 'Intermediate' },
  ],
  'mobile developer': [
    { skill: 'React Native / Flutter Cross-Platform Development', relevance: 'High', proficiencyNeeded: 'Advanced' },
    { skill: 'Native Platform Concepts (Swift/iOS, Kotlin/Android)', relevance: 'High', proficiencyNeeded: 'Intermediate' },
    { skill: 'Mobile UI/UX Patterns & Guidelines', relevance: 'High', proficiencyNeeded: 'Intermediate' },
    { skill: 'Offline Data Sync & Local Storage', relevance: 'Medium', proficiencyNeeded: 'Intermediate' },
    { skill: 'App Store & Google Play Deployment Pipelines', relevance: 'Medium', proficiencyNeeded: 'Intermediate' },
  ],
  'devops engineer': [
    { skill: 'Linux Administration & Shell Scripting', relevance: 'High', proficiencyNeeded: 'Advanced' },
    { skill: 'Docker Containerization & Multi-stage Builds', relevance: 'High', proficiencyNeeded: 'Advanced' },
    { skill: 'Kubernetes Cluster Management & Helm', relevance: 'High', proficiencyNeeded: 'Intermediate' },
    { skill: 'CI/CD Automation (GitHub Actions, GitLab CI)', relevance: 'High', proficiencyNeeded: 'Advanced' },
    { skill: 'Infrastructure as Code (Terraform / Ansible)', relevance: 'High', proficiencyNeeded: 'Intermediate' },
    { skill: 'Monitoring & Alerting (Prometheus, Grafana)', relevance: 'Medium', proficiencyNeeded: 'Intermediate' },
  ],
};

const getRoleCompetencies = (careerGoal) => {
  const goalLower = (careerGoal || '').toLowerCase();
  for (const [key, competencies] of Object.entries(ROLE_SKILLS_TAXONOMY)) {
    if (goalLower.includes(key) || key.includes(goalLower)) {
      return competencies;
    }
  }
  // Default Full Stack Competencies
  return [
    { skill: 'Modern JavaScript / TypeScript Foundations', relevance: 'High', proficiencyNeeded: 'Advanced' },
    { skill: 'Frontend Frameworks (React.js / Next.js)', relevance: 'High', proficiencyNeeded: 'Advanced' },
    { skill: 'Server-side Runtime & APIs (Node.js / Express)', relevance: 'High', proficiencyNeeded: 'Advanced' },
    { skill: 'Database Modeling & Indexing (MongoDB / SQL)', relevance: 'High', proficiencyNeeded: 'Intermediate' },
    { skill: 'Automated Testing & CI/CD Pipelines', relevance: 'Medium', proficiencyNeeded: 'Intermediate' },
    { skill: 'Cloud Deployment & Containerization (Docker)', relevance: 'Medium', proficiencyNeeded: 'Intermediate' },
  ];
};

// @desc    Get Skill Gap Analysis with honest, role-tailored metrics
// @route   POST /api/career/skill-gap
// @access  Private
const getSkillGapAnalysis = async (req, res) => {
  try {
    const { careerGoal = 'Full Stack Developer', currentSkills = [] } = req.body;
    const competencies = getRoleCompetencies(careerGoal);

    // Compute matching vs missing skills based on user's current skillset
    const userSkillsClean = (currentSkills || []).map((s) => s.toLowerCase().trim()).filter(Boolean);

    const currentSkillsAssessment = [];
    const missingSkills = [];

    competencies.forEach((comp) => {
      const compLower = comp.skill.toLowerCase();
      const hasSkill = userSkillsClean.some((userSkill) =>
        compLower.includes(userSkill) || userSkill.includes(compLower.split(' ')[0])
      );

      if (hasSkill) {
        currentSkillsAssessment.push({
          skill: comp.skill,
          relevance: comp.relevance,
          proficiencyNeeded: comp.proficiencyNeeded,
          userStatus: 'Present',
        });
      } else {
        missingSkills.push({
          skill: comp.skill,
          priority: comp.relevance === 'High' ? 'Critical' : 'Important',
          estimatedLearningTime: comp.relevance === 'High' ? '3 - 4 weeks' : '2 weeks',
        });
      }
    });

    // Also include user's other declared skills in the assessment
    userSkillsClean.forEach((userSkill) => {
      const alreadyIncluded = currentSkillsAssessment.some((c) =>
        c.skill.toLowerCase().includes(userSkill)
      );
      if (!alreadyIncluded) {
        currentSkillsAssessment.push({
          skill: userSkill.charAt(0).toUpperCase() + userSkill.slice(1),
          relevance: 'Medium',
          proficiencyNeeded: 'Intermediate',
          userStatus: 'Declared Skill',
        });
      }
    });

    // Honest Readiness Calculation:
    // If user has zero skills, readiness is 10-15%.
    // If user only has 1 skill out of 6, readiness is ~20%.
    // Only if user covers most competencies does it scale to 75-90%.
    const matchedCount = competencies.length - missingSkills.length;
    let honestReadiness = 12;
    if (userSkillsClean.length > 0 && competencies.length > 0) {
      const ratio = matchedCount / competencies.length;
      honestReadiness = Math.round(15 + ratio * 80);
    }

    const prompt = `You are a certified senior technical recruiter and skills gap auditor.
Target Career Goal: "${careerGoal}"
Candidate's Current Skills: ${userSkillsClean.join(', ') || 'No skills declared yet'}
Identified Missing Skills: ${missingSkills.map((m) => m.skill).join(', ')}
Calculated Genuine Readiness: ${honestReadiness}%

Return a JSON object strictly in this format:
{
  "currentSkillsAssessment": ${JSON.stringify(currentSkillsAssessment)},
  "missingSkills": ${JSON.stringify(missingSkills)},
  "overallReadiness": ${honestReadiness},
  "summary": "Specific 2-3 sentence assessment explaining where the candidate stands for ${careerGoal} and the most critical gap to address first."
}`;

    const analysis = await generateJSON(prompt);

    // Ensure returned data guarantees honest readiness and role-relevant missing skills
    const responsePayload = {
      currentSkillsAssessment: analysis.currentSkillsAssessment?.length > 0
        ? analysis.currentSkillsAssessment
        : currentSkillsAssessment,
      missingSkills: analysis.missingSkills?.length > 0 ? analysis.missingSkills : missingSkills,
      overallReadiness: honestReadiness,
      summary: analysis.summary || `For the role of ${careerGoal}, you currently cover ${matchedCount} of ${competencies.length} core competencies. Prioritize mastering ${missingSkills[0]?.skill || 'the core requirements'} to improve interview competitiveness.`,
    };

    res.json(responsePayload);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate Personalized Learning Roadmap
// @route   POST /api/career/roadmap
// @access  Private
const generateRoadmap = async (req, res) => {
  try {
    const { careerGoal, currentSkills, skillGaps } = req.body;

    const prompt = `You are an expert learning path designer. Create a detailed, phased learning roadmap:

Career Goal: ${careerGoal}
Current Skills: ${currentSkills?.join(', ')}
Skill Gaps: ${skillGaps?.join(', ')}

Return a JSON object with:
{
  "phases": [
    {
      "phase": 1,
      "title": "Phase title",
      "duration": "X weeks",
      "topics": [
        {
          "name": "Topic name",
          "resources": [
            { "title": "Resource title", "url": "https://example.com", "type": "Video/Article/Course/Book/Practice" }
          ]
        }
      ]
    }
  ]
}
Include 3-4 phases with 3-5 topics each and 2-3 real resources per topic.`;

    const roadmapData = await generateJSON(prompt);

    const phases = roadmapData.phases || roadmapData.roadmap || [];

    // Save to DB
    const roadmap = await LearningRoadmap.findOneAndUpdate(
      { user: req.user._id },
      {
        user: req.user._id,
        careerGoal,
        skillGaps: skillGaps || [],
        roadmap: phases,
        overallProgress: 0,
        generatedAt: new Date(),
      },
      { returnDocument: 'after', upsert: true }
    );

    res.json(roadmap);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's roadmap
// @route   GET /api/career/roadmap
// @access  Private
const getRoadmap = async (req, res) => {
  try {
    const roadmap = await LearningRoadmap.findOne({ user: req.user._id });
    if (!roadmap) return res.status(404).json({ message: 'No roadmap found. Generate one first.' });
    res.json(roadmap);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update topic completion
// @route   PUT /api/career/roadmap/topic
// @access  Private
const updateTopicProgress = async (req, res) => {
  try {
    const { phaseIndex, topicIndex, completed } = req.body;
    const roadmap = await LearningRoadmap.findOne({ user: req.user._id });
    if (!roadmap) return res.status(404).json({ message: 'Roadmap not found' });

    roadmap.roadmap[phaseIndex].topics[topicIndex].completed = completed;
    roadmap.roadmap[phaseIndex].topics[topicIndex].completedAt = completed ? new Date() : null;

    // Recalculate overall progress
    const totalTopics = roadmap.roadmap.reduce((acc, phase) => acc + phase.topics.length, 0);
    const completedTopics = roadmap.roadmap.reduce(
      (acc, phase) => acc + phase.topics.filter((t) => t.completed).length,
      0
    );
    roadmap.overallProgress = Math.round((completedTopics / totalTopics) * 100);
    roadmap.markModified('roadmap');
    await roadmap.save();
    res.json(roadmap);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCareerRecommendations,
  careerChat,
  getSkillGapAnalysis,
  generateRoadmap,
  getRoadmap,
  updateTopicProgress,
};
