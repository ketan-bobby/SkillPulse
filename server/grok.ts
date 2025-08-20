import OpenAI from "openai";

// Primary AI: Grok AI
const grok = new OpenAI({ 
  baseURL: "https://api.x.ai/v1", 
  apiKey: process.env.XAI_API_KEY 
});

// Fallback AI: OpenAI
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

// AI Service with automatic fallback
async function callAI(messages: any[], options: any = {}) {
  try {
    // Try Grok AI first
    if (process.env.XAI_API_KEY) {
      console.log("Using Grok AI (primary)");
      return await grok.chat.completions.create({
        model: "grok-2-1212",
        messages,
        ...options
      });
    }
  } catch (error) {
    console.log("Grok AI failed, falling back to OpenAI:", (error as Error).message);
  }

  // Fallback to OpenAI
  try {
    if (process.env.OPENAI_API_KEY) {
      console.log("Using OpenAI (fallback)");
      return await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages,
        ...options
      });
    }
  } catch (error) {
    console.log("OpenAI also failed:", (error as Error).message);
    throw new Error("Both Grok AI and OpenAI are unavailable. Please check API keys.");
  }

  throw new Error("No AI service available. Please configure XAI_API_KEY or OPENAI_API_KEY.");
}

// Enhanced question generation with automatic fallback
export async function enhanceTestDescription(params: {
  title: string;
  domain: string;
  level: string;
  currentDescription?: string;
}): Promise<string> {
  const { title, domain, level, currentDescription } = params;
  
  const prompt = `Enhance the following test description to be more professional, clear, and comprehensive:

Title: ${title}
Domain: ${domain}
Level: ${level}
Current Description: ${currentDescription || 'No description provided'}

Create a professional test description that includes:
- Clear overview of what the test evaluates
- Skills and competencies being assessed
- Target audience and prerequisites
- Brief mention of question types and assessment approach
- Professional tone suitable for corporate environments

Requirements:
- Keep it concise but informative (2-4 sentences)
- Use professional language
- Focus on value and assessment goals
- Mention the specific domain and level appropriately
- Make it engaging for both test takers and managers

Return only the enhanced description text, no JSON formatting needed.`;

  try {
    const response = await callAI([
      {
        role: "system",
        content: "You are an expert technical assessment content creator. Generate clear, professional test descriptions that effectively communicate the value and scope of assessments."
      },
      {
        role: "user",
        content: prompt
      }
    ], { 
      temperature: 0.6,
      max_tokens: 200
    });

    return response.choices[0].message.content?.trim() || currentDescription || "";
  } catch (error) {
    console.error("AI description enhancement error:", error);
    throw new Error("Failed to enhance description with AI");
  }
}

export async function generateQuestions(params: {
  domain: string;
  level: string;
  questionType: string;
  count: number;
  difficulty?: string;
}): Promise<any[]> {
  const { domain, level, questionType, count, difficulty } = params;
  
  const difficultyText = difficulty ? ` with ${difficulty} difficulty` : '';
  
  // Define question type specific requirements
  let questionTypeRequirements = '';
  let questionTypeNote = '';
  
  switch (questionType) {
    case 'mcq':
      questionTypeRequirements = '- Generate ONLY multiple-choice questions (MCQ)\n- Each question must have exactly 4 options (A, B, C, D)\n- Ensure clear, unambiguous correct answers';
      questionTypeNote = 'Focus exclusively on multiple-choice questions that test theoretical knowledge and understanding.';
      break;
    case 'programming':
      questionTypeRequirements = '- Generate ONLY programming/coding questions\n- Each question must include code templates and test cases\n- Focus on algorithms, data structures, and problem-solving\n- Include proper syntax and executable code examples';
      questionTypeNote = 'Focus exclusively on hands-on programming challenges that test coding skills and technical implementation.';
      break;
    case 'general':
      questionTypeRequirements = '- Generate ONLY general knowledge multiple-choice questions\n- Focus on broad technical concepts, industry standards, and best practices\n- Each question must have exactly 4 options (A, B, C, D)\n- Cover theoretical understanding rather than specific implementation details';
      questionTypeNote = 'Focus on general technical knowledge, industry standards, methodologies, and conceptual understanding.';
      break;
    case 'mixed':
    default:
      questionTypeRequirements = '- Create diverse question types: multiple-choice (60%), coding challenges (30%), and scenario-based (10%)\n- Each MCQ must have exactly 4 options with clear correct answers\n- Coding questions need proper templates and test cases\n- Include scenario-based questions for real-world application';
      questionTypeNote = 'Create a balanced mix of question types to comprehensively assess both theoretical knowledge and practical skills.';
      break;
  }
  
  const prompt = `Generate ${count} high-quality technical assessment questions for ${domain} at ${level} level${difficultyText}.

Test Type: ${questionType.toUpperCase()}
${questionTypeNote}

Requirements:
${questionTypeRequirements}
- Include detailed explanations for learning
- Focus on real-world practical skills and industry standards
${difficulty ? `- All questions must be at ${difficulty} difficulty level` : '- Ensure progressive difficulty within the level'}
- Add relevant technology tags

Format as JSON array with this structure:
{
  "questions": [
    {
      "question": "Clear, specific question text",
      "type": "mcq" | "coding" | "scenario",
      "options": ["A", "B", "C", "D"] (for MCQ only),
      "correctAnswer": "Exact correct answer",
      "explanation": "Detailed explanation of why this is correct",
      "difficulty": "${difficulty || 'medium'}",
      "tags": ["relevant", "technology", "tags"],
      "timeLimit": 300,
      "points": 10,
      "codeLanguage": "javascript" (for coding questions),
      "codeTemplate": "function template() {}" (for coding questions),
      "testCases": [{"input": "test input", "output": "expected output"}] (for coding questions)
    }
  ]
}

Domain: ${domain}
Level: ${level}
Generate exactly ${count} questions with authentic, industry-relevant content.`;

  try {
    const systemContent = questionType === 'general' 
      ? "You are an expert technical assessment creator with deep knowledge across all engineering domains. Generate realistic questions that test general technical knowledge, industry standards, methodologies, and conceptual understanding rather than specific implementation details."
      : questionType === 'mcq'
      ? "You are an expert technical assessment creator specializing in multiple-choice questions. Generate clear, unambiguous questions that test theoretical knowledge and understanding with exactly 4 well-crafted options."
      : questionType === 'programming'
      ? "You are an expert programming assessment creator. Generate hands-on coding challenges that test algorithmic thinking, data structures, and practical programming skills with proper templates and test cases."
      : "You are an expert technical assessment creator with deep knowledge across all engineering domains. Generate realistic, challenging questions that test practical skills used in real engineering roles.";

    const response = await callAI([
      {
        role: "system",
        content: systemContent
      },
      {
        role: "user",
        content: prompt
      }
    ], { 
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 4000
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.questions || [];
  } catch (error) {
    console.error("AI question generation error:", error);
    throw new Error("Failed to generate questions with AI (tried both Grok and OpenAI)");
  }
}

// Enhanced code analysis with automatic fallback
export async function analyzeCode(code: string, language: string): Promise<{
  score: number;
  feedback: string;
  suggestions: string[];
  complexity: string;
  security: string[];
}> {
  try {
    const response = await callAI([
      {
        role: "system",
        content: "You are a senior software engineer and code reviewer with expertise in software architecture, security, and best practices. Provide detailed, actionable feedback."
      },
      {
        role: "user",
        content: `Analyze this ${language} code and provide comprehensive feedback:

\`\`\`${language}
${code}
\`\`\`

Provide analysis in JSON format:
{
  "score": <number 1-100>,
  "feedback": "Overall assessment with specific insights",
  "suggestions": ["Specific improvement recommendations"],
  "complexity": "Analysis of code complexity and maintainability",
  "security": ["Security concerns and recommendations"]
}`
      }
    ], { 
      response_format: { type: "json_object" },
      temperature: 0.3
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error("AI code analysis error:", error);
    throw new Error("Failed to analyze code with AI (tried both Grok and OpenAI)");
  }
}

// Enhanced sentiment analysis with automatic fallback
export async function analyzeSentiment(text: string): Promise<{
  rating: number;
  confidence: number;
  insights: string;
  recommendations: string[];
}> {
  try {
    const response = await callAI([
      {
        role: "system",
        content: "You are an expert in psychological assessment and candidate evaluation. Analyze sentiment and provide insights for HR and talent management."
      },
      {
        role: "user",
        content: `Analyze the sentiment and provide insights for this candidate feedback:

"${text}"

Provide analysis in JSON format:
{
  "rating": <number 1-5 stars>,
  "confidence": <number 0-1>,
  "insights": "Deep insights about candidate sentiment and motivation",
  "recommendations": ["Actionable recommendations for HR"]
}`
      }
    ], { 
      response_format: { type: "json_object" },
      temperature: 0.4
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error("AI sentiment analysis error:", error);
    throw new Error("Failed to analyze sentiment with AI (tried both Grok and OpenAI)");
  }
}

// Advanced question quality analysis with automatic fallback
export async function analyzeQuestionQuality(question: any): Promise<{
  score: number;
  feedback: string;
  improvements: string[];
  clarity: number;
  difficulty: string;
  relevance: number;
}> {
  try {
    const response = await callAI([
      {
        role: "system",
        content: "You are an expert in educational assessment and question design. Evaluate technical questions for quality, clarity, and effectiveness."
      },
      {
        role: "user",
        content: `Evaluate this technical assessment question:

Question: ${question.question}
Type: ${question.type}
Domain: ${question.domain}
Level: ${question.level}
${question.options ? `Options: ${question.options.join(', ')}` : ''}
${question.correctAnswer ? `Correct Answer: ${question.correctAnswer}` : ''}

Provide detailed evaluation in JSON format:
{
  "score": <number 1-100>,
  "feedback": "Comprehensive quality assessment",
  "improvements": ["Specific suggestions for improvement"],
  "clarity": <number 1-10>,
  "difficulty": "appropriate" | "too_easy" | "too_hard",
  "relevance": <number 1-10>
}`
      }
    ], { 
      response_format: { type: "json_object" },
      temperature: 0.3
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error("AI question quality analysis error:", error);
    throw new Error("Failed to analyze question quality with AI (tried both Grok and OpenAI)");
  }
}

// Generate personalized learning paths with automatic fallback
export async function generateLearningPath(userProfile: any): Promise<{
  path: any[];
  recommendations: string[];
  timeline: string;
  focus_areas: string[];
}> {
  try {
    const response = await callAI([
      {
        role: "system",
        content: "You are a career development expert and learning path designer. Create personalized learning journeys based on user profiles and career goals."
      },
      {
        role: "user",
        content: `Create a personalized learning path for this user:

Role: ${userProfile.role}
Experience: ${userProfile.experience}
Skills: ${userProfile.skills}
Goals: ${userProfile.goals}
Domain: ${userProfile.domain}

Provide a comprehensive learning path in JSON format:
{
  "path": [
    {
      "module": "Learning module name",
      "duration": "Estimated time",
      "skills": ["Skills to be gained"],
      "resources": ["Recommended resources"]
    }
  ],
  "recommendations": ["Personalized career recommendations"],
  "timeline": "Overall timeline estimate",
  "focus_areas": ["Key areas to focus on"]
}`
      }
    ], { 
      response_format: { type: "json_object" },
      temperature: 0.6
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error("AI learning path generation error:", error);
    throw new Error("Failed to generate learning path with AI (tried both Grok and OpenAI)");
  }
}

// Analyze test results with automatic fallback
export async function analyzeTestResults(results: any): Promise<{
  overall_performance: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  next_steps: string[];
}> {
  try {
    const response = await callAI([
      {
        role: "system",
        content: "You are an expert in performance analysis and talent assessment. Provide insightful analysis of test results for career development."
      },
      {
        role: "user",
        content: `Analyze these test results and provide comprehensive insights:

${JSON.stringify(results, null, 2)}

Provide analysis in JSON format:
{
  "overall_performance": "Summary of overall performance",
  "strengths": ["Key strengths identified"],
  "weaknesses": ["Areas needing improvement"],
  "recommendations": ["Specific recommendations for improvement"],
  "next_steps": ["Actionable next steps for development"]
}`
      }
    ], { 
      response_format: { type: "json_object" },
      temperature: 0.4
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error("AI test results analysis error:", error);
    throw new Error("Failed to analyze test results with AI (tried both Grok and OpenAI)");
  }
}