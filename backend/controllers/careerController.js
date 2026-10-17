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
// @access  Private
const getSkillGapAnalysis = async (req, res) => {
  try {
    const { careerGoal, currentSkills } = req.body;

    const prompt = `You are a technical skills expert. Analyze the skill gap for the following:

Target Career Goal: ${careerGoal}
Current Skills: ${currentSkills?.join(', ')}

Return a JSON object with:
{
  "currentSkillsAssessment": [
    { "skill": "skill name", "relevance": "High/Medium/Low", "proficiencyNeeded": "Advanced/Intermediate/Basic" }
  ],
  "missingSkills": [
    { "skill": "skill name", "priority": "Critical/Important/Nice-to-have", "estimatedLearningTime": "X weeks" }
  ],
  "overallReadiness": number (0-100),
  "summary": "brief analysis paragraph"
}`;

    const analysis = await generateJSON(prompt);
    res.json(analysis);
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
