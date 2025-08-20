import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface QuestionGenerationRequest {
  domain: string;
  level: string;
  questionType: string;
  technology?: string;
  topic?: string;
  count?: number;
}

export interface GeneratedQuestion {
  type: string;
  question: string;
  options: any;
  correctAnswer: string;
  explanation: string;
  difficulty: string;
  tags: string[];
  codeLanguage?: string;
  timeLimit?: number;
}

export async function generateQuestions(request: QuestionGenerationRequest): Promise<GeneratedQuestion[]> {
  const { domain, level, questionType, technology, topic, count = 1 } = request;

  const prompt = createPrompt(domain, level, questionType, technology, topic, count);

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert technical assessment creator. Generate high-quality, practical questions that accurately assess real-world skills. Always respond with valid JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.questions || [];
  } catch (error) {
    console.error("Error generating questions:", error);
    throw new Error("Failed to generate questions: " + error.message);
  }
}

function createPrompt(domain: string, level: string, questionType: string, technology?: string, topic?: string, count: number = 1): string {
  const levelDescriptions = {
    junior: "entry-level developers with 0-2 years experience, focus on fundamentals",
    mid: "mid-level developers with 2-5 years experience, practical problem-solving",
    senior: "senior developers with 5+ years, architecture and best practices",
    lead: "technical leads with team management, system design and mentoring",
    principal: "principal engineers with strategic thinking, technical vision and cross-team impact"
  };

  const domainContext = {
    programming: "core programming concepts, algorithms, data structures, design patterns",
    frontend: "web development, JavaScript frameworks, responsive design, user experience",
    backend: "server-side development, APIs, databases, system architecture",
    devops: "infrastructure automation, CI/CD, containerization, monitoring",
    cloud: "cloud platforms (AWS, Azure, GCP), serverless, microservices",
    mobile: "mobile app development, platform-specific features, performance",
    "data-science": "data analysis, machine learning, statistics, data visualization",
    "ai-ml": "artificial intelligence, machine learning algorithms, model deployment",
    security: "cybersecurity, threat detection, secure coding, compliance",
    databases: "database design, SQL optimization, NoSQL, data modeling",
    networking: "network protocols, infrastructure, security, troubleshooting",
    "vmware-virtualization": "VMware vSphere, ESXi, vCenter, virtual machine management, hypervisor technologies",
    "redhat-administration": "Red Hat Enterprise Linux, system administration, package management, security hardening",
    "oracle-administration": "Oracle Database administration, SQL tuning, backup/recovery, performance optimization",
    "network-routing-switching": "Cisco routing protocols, switching technologies, VLAN configuration, network troubleshooting"
  };

  let questionTypePrompt = "";
  
  if (questionType === "mcq") {
    questionTypePrompt = `Create multiple choice questions with 4 options each. Focus on practical scenarios and real-world applications.`;
  } else if (questionType === "coding") {
    questionTypePrompt = `Create coding challenges with:
    - Clear problem statement
    - Code template with function signature
    - At least 3 test cases with input/expected output
    - Appropriate time limit (5-20 minutes)
    - Specify programming language (JavaScript, Python, Java, etc.)`;
  } else if (questionType === "scenario") {
    questionTypePrompt = `Create scenario-based questions that present real-world situations requiring technical decision-making.`;
  }

  const technologyFilter = technology ? `Focus specifically on ${technology} technology.` : "";
  const topicFilter = topic ? `The questions should cover: ${topic}` : "";

  return `Generate ${count} high-quality technical assessment question(s) for:

Domain: ${domain} (${domainContext[domain] || domain})
Level: ${level} (${levelDescriptions[level] || level})
Question Type: ${questionType}
${technologyFilter}
${topicFilter}

${questionTypePrompt}

Requirements:
- Questions must be practical and test real-world skills
- Avoid overly theoretical or trivia questions
- Include clear explanations for correct answers
- Tag questions with relevant technologies
- Ensure appropriate difficulty for the level
- Make questions specific enough to avoid ambiguity

Response format (JSON):
{
  "questions": [
    {
      "type": "${questionType}",
      "question": "Clear, specific question text",
      "options": ${questionType === "coding" ? '{"template": "code template", "testCases": [{"input": "test input", "expected": "expected output"}]}' : '["option1", "option2", "option3", "option4"]'},
      "correctAnswer": "correct answer or solution",
      "explanation": "detailed explanation of why this is correct",
      "difficulty": "easy|medium|hard",
      "tags": ["relevant", "technology", "tags"],
      ${questionType === "coding" ? '"codeLanguage": "javascript|python|java|etc",' : ""}
      ${questionType === "coding" ? '"timeLimit": 10' : ""}
    }
  ]
}`;
}

export async function generateQuestionsForTest(testId: number, additionalCount: number = 5): Promise<GeneratedQuestion[]> {
  // This could fetch test details and generate questions specifically for that test
  // For now, return a basic implementation
  return generateQuestions({
    domain: "programming",
    level: "mid",
    questionType: "mcq",
    count: additionalCount
  });
}