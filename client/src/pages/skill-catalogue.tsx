import { AppHeader } from "@/components/app-header";
import { RoleGuard } from "@/lib/role-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Code, 
  Monitor, 
  Server, 
  Settings, 
  Cloud, 
  Smartphone, 
  BarChart, 
  Brain, 
  Shield, 
  Database, 
  Network, 
  HardDrive, 
  Terminal, 
  Layers,
  BookOpen,
  Target,
  GraduationCap,
  Award,
  TrendingUp
} from "lucide-react";
import { ROLES } from "@shared/roles";

const skillDomains = [
  {
    code: "programming",
    name: "Programming",
    icon: Code,
    description: "Core programming concepts, algorithms, data structures, design patterns",
    color: "bg-blue-500",
    topics: [
      "Programming Fundamentals", "Data Structures", "Algorithms", 
      "Design Patterns", "Programming Languages"
    ],
    keySkills: [
      "Variables, data types, and operators",
      "Control structures (loops, conditionals)",
      "Object-oriented programming (OOP)",
      "Sorting and searching algorithms",
      "SOLID principles and design patterns"
    ]
  },
  {
    code: "frontend",
    name: "Frontend Development",
    icon: Monitor,
    description: "Web development, JavaScript frameworks, responsive design, user experience",
    color: "bg-green-500",
    topics: [
      "Web Technologies", "Frontend Frameworks", "Responsive Design", 
      "Performance & Optimization", "Development Tools"
    ],
    keySkills: [
      "HTML5 semantic elements and structure",
      "React.js hooks and state management",
      "CSS Grid and Flexbox layouts",
      "Bundle size optimization",
      "Accessibility (WCAG guidelines)"
    ]
  },
  {
    code: "backend",
    name: "Backend Development",
    icon: Server,
    description: "Server-side development, APIs, databases, system architecture",
    color: "bg-purple-500",
    topics: [
      "Server Technologies", "API Development", "Database Integration", 
      "System Architecture", "Security"
    ],
    keySkills: [
      "RESTful API design principles",
      "Database connections and ORM usage",
      "Microservices architecture",
      "Authentication protocols (JWT, OAuth)",
      "Load balancing and scaling"
    ]
  },
  {
    code: "devops",
    name: "DevOps",
    icon: Settings,
    description: "Infrastructure automation, CI/CD, containerization, monitoring",
    color: "bg-orange-500",
    topics: [
      "Containerization", "CI/CD Pipelines", "Infrastructure as Code", 
      "Monitoring & Logging", "Cloud Platforms"
    ],
    keySkills: [
      "Docker fundamentals and Kubernetes",
      "Jenkins and GitHub Actions",
      "Terraform configuration",
      "Prometheus and Grafana setup",
      "AWS services and deployment"
    ]
  },
  {
    code: "cloud",
    name: "Cloud Computing",
    icon: Cloud,
    description: "Cloud platforms (AWS, Azure, GCP), serverless, microservices",
    color: "bg-sky-500",
    topics: [
      "AWS Services", "Azure Platform", "Google Cloud Platform", 
      "Serverless Architecture", "Cloud Security"
    ],
    keySkills: [
      "EC2 instances and auto-scaling",
      "Azure Virtual Machines and App Services",
      "Google Cloud Platform services",
      "Function-as-a-Service (FaaS) patterns",
      "Identity and Access Management (IAM)"
    ]
  },
  {
    code: "mobile",
    name: "Mobile Development",
    icon: Smartphone,
    description: "Mobile app development, platform-specific features, performance",
    color: "bg-pink-500",
    topics: [
      "Native Development", "Cross-Platform Frameworks", "Mobile UI/UX", 
      "Mobile Performance", "Mobile Backend Services"
    ],
    keySkills: [
      "iOS development with Swift",
      "Android development with Kotlin",
      "React Native development",
      "Material Design principles",
      "Push notifications and real-time data"
    ]
  },
  {
    code: "data-science",
    name: "Data Science",
    icon: BarChart,
    description: "Data analysis, machine learning, statistics, data visualization",
    color: "bg-emerald-500",
    topics: [
      "Data Analysis", "Data Visualization", "Machine Learning", 
      "Big Data Technologies", "Statistical Methods"
    ],
    keySkills: [
      "Pandas for data manipulation",
      "Matplotlib and Seaborn plotting",
      "Scikit-learn algorithms",
      "Apache Spark for distributed computing",
      "A/B testing methodologies"
    ]
  },
  {
    code: "ai-ml",
    name: "AI/ML",
    icon: Brain,
    description: "Artificial intelligence, machine learning algorithms, model deployment",
    color: "bg-violet-500",
    topics: [
      "Deep Learning", "Natural Language Processing", "Computer Vision", 
      "MLOps & Deployment", "Advanced AI Concepts"
    ],
    keySkills: [
      "Neural network architectures",
      "TensorFlow and PyTorch frameworks",
      "Text preprocessing and tokenization",
      "Image preprocessing and augmentation",
      "Model versioning and tracking (MLflow)"
    ]
  },
  {
    code: "security",
    name: "Cybersecurity",
    icon: Shield,
    description: "Cybersecurity, threat detection, secure coding, compliance",
    color: "bg-red-500",
    topics: [
      "Network Security", "Application Security", "Identity & Access Management", 
      "Incident Response", "Compliance & Governance"
    ],
    keySkills: [
      "Firewall configuration and management",
      "OWASP Top 10 vulnerabilities",
      "Multi-factor authentication (MFA)",
      "Security incident handling procedures",
      "GDPR and privacy regulations"
    ]
  },
  {
    code: "databases",
    name: "Databases",
    icon: Database,
    description: "Database design, SQL optimization, NoSQL, data modeling",
    color: "bg-cyan-500",
    topics: [
      "Relational Databases", "NoSQL Databases", "Database Administration", 
      "Data Modeling", "Advanced Database Concepts"
    ],
    keySkills: [
      "SQL fundamentals and advanced queries",
      "Document databases (MongoDB)",
      "Performance tuning and monitoring",
      "Entity-Relationship (ER) diagrams",
      "Distributed databases and sharding"
    ]
  },
  {
    code: "networking",
    name: "Networking",
    icon: Network,
    description: "Network protocols, infrastructure, security, troubleshooting",
    color: "bg-indigo-500",
    topics: [
      "Network Fundamentals", "Routing & Switching", "Network Security", 
      "Network Monitoring", "Modern Networking"
    ],
    keySkills: [
      "OSI and TCP/IP model layers",
      "Router and switch configuration",
      "Network access control (NAC)",
      "SNMP and network management",
      "Software-Defined Networking (SDN)"
    ]
  },
  {
    code: "vmware-virtualization",
    name: "VMware Virtualization",
    icon: HardDrive,
    description: "VMware vSphere, ESXi, vCenter, virtual machine management",
    color: "bg-slate-500",
    topics: [
      "vSphere Infrastructure", "Advanced vSphere Features", "Storage & Networking", 
      "Performance & Monitoring", "Security & Compliance"
    ],
    keySkills: [
      "ESXi hypervisor configuration",
      "vMotion and Storage vMotion",
      "vSAN (Virtual Storage Area Network)",
      "Performance monitoring tools",
      "vSphere security hardening"
    ]
  },
  {
    code: "redhat-administration",
    name: "Red Hat Administration",
    icon: Terminal,
    description: "Red Hat Enterprise Linux, system administration, package management",
    color: "bg-red-600",
    topics: [
      "RHEL System Administration", "Package Management", "Network Configuration", 
      "System Security", "Advanced Administration"
    ],
    keySkills: [
      "User and group management",
      "YUM and DNF package managers",
      "NetworkManager configuration",
      "Security hardening guidelines",
      "Systemd service management"
    ]
  },
  {
    code: "oracle-administration",
    name: "Oracle Administration",
    icon: Database,
    description: "Oracle Database administration, SQL tuning, backup/recovery",
    color: "bg-amber-600",
    topics: [
      "Database Architecture", "Installation & Configuration", "User & Security Management", 
      "Backup & Recovery", "Performance Tuning"
    ],
    keySkills: [
      "Oracle Database architecture components",
      "Database creation and configuration",
      "RMAN (Recovery Manager) usage",
      "SQL query optimization",
      "Automatic Workload Repository (AWR)"
    ]
  },
  {
    code: "network-routing-switching",
    name: "Network Routing & Switching",
    icon: Layers,
    description: "Cisco routing protocols, switching technologies, VLAN configuration",
    color: "bg-teal-600",
    topics: [
      "Cisco Routing", "Switching Technologies", "Network Protocols", 
      "Network Troubleshooting", "Advanced Features"
    ],
    keySkills: [
      "Cisco IOS command-line interface",
      "VLAN configuration and management",
      "OSPF and EIGRP protocols",
      "Cisco troubleshooting methodologies",
      "Network automation and programmability"
    ]
  }
];

const skillLevels = [
  { name: "Junior", range: "0-2 years", description: "Fundamental concepts and basic implementation" },
  { name: "Mid", range: "2-5 years", description: "Intermediate concepts with practical application" },
  { name: "Senior", range: "5-8 years", description: "Advanced concepts with architectural understanding" },
  { name: "Lead", range: "8-12 years", description: "Expert-level with team leadership capabilities" },
  { name: "Principal", range: "12+ years", description: "Strategic thinking and industry-wide expertise" }
];

const questionTypes = [
  { name: "MCQ", description: "Multiple-choice questions for concept verification", icon: Target },
  { name: "Coding", description: "Hands-on programming challenges", icon: Code },
  { name: "Scenario", description: "Real-world problem-solving situations", icon: BookOpen },
  { name: "Drag-Drop", description: "Interactive component arrangement", icon: TrendingUp },
  { name: "Fill-Blank", description: "Code completion and concept filling", icon: GraduationCap }
];

export default function SkillCatalogue() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <AppHeader />
      <div className="container mx-auto p-6 space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-white">
              LinxIQ Skill Domains Catalogue
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Comprehensive technical domains and assessment criteria for engineer-grade evaluations
            </p>
          </div>

          <Tabs defaultValue="domains" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-white/10 backdrop-blur-md">
              <TabsTrigger value="domains" className="text-white data-[state=active]:bg-purple-500">
                Technical Domains
              </TabsTrigger>
              <TabsTrigger value="levels" className="text-white data-[state=active]:bg-purple-500">
                Skill Levels
              </TabsTrigger>
              <TabsTrigger value="assessment" className="text-white data-[state=active]:bg-purple-500">
                Assessment Types
              </TabsTrigger>
            </TabsList>

            {/* Technical Domains */}
            <TabsContent value="domains" className="space-y-6 bg-[#3b1a62]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-[#431b6c]">
                {skillDomains.map((domain) => {
                  const IconComponent = domain.icon;
                  return (
                    <Card key={domain.code} className="rounded-lg border shadow-sm backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-300 bg-[#221842] text-[#495260]">
                      <CardHeader className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${domain.color}`}>
                            <IconComponent className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-white text-lg">{domain.name}</CardTitle>
                            <Badge variant="secondary" className="text-xs bg-white/20 text-white/80">
                              {domain.code}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-gray-300 text-sm">{domain.description}</p>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="text-sm font-semibold text-white mb-2">Key Topic Areas:</h4>
                          <div className="flex flex-wrap gap-1">
                            {domain.topics.map((topic, index) => (
                              <Badge key={index} variant="outline" className="text-xs border-white/30 text-white/80">
                                {topic}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-semibold text-white mb-2">Core Skills:</h4>
                          <ul className="text-xs text-gray-300 space-y-1">
                            {domain.keySkills.slice(0, 3).map((skill, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="text-purple-400 mt-1">•</span>
                                <span>{skill}</span>
                              </li>
                            ))}
                            {domain.keySkills.length > 3 && (
                              <li className="text-purple-400 text-xs">
                                +{domain.keySkills.length - 3} more skills...
                              </li>
                            )}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* Skill Levels */}
            <TabsContent value="levels" className="space-y-6 bg-[#511c7e]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 bg-[#511c7e]">
                {skillLevels.map((level, index) => (
                  <Card key={level.name} className="rounded-lg border text-card-foreground shadow-sm backdrop-blur-md border-purple-500/30 bg-[#441a6d]">
                    <CardHeader className="flex flex-col space-y-1.5 p-6 text-center bg-[#3b1a61]">
                      <div className="flex justify-center mb-2">
                        <div className={`p-3 rounded-full bg-gradient-to-r ${
                          index === 0 ? 'from-green-500 to-green-600' :
                          index === 1 ? 'from-blue-500 to-blue-600' :
                          index === 2 ? 'from-purple-500 to-purple-600' :
                          index === 3 ? 'from-orange-500 to-orange-600' :
                          'from-red-500 to-red-600'
                        }`}>
                          <Award className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <CardTitle className="text-white text-lg">{level.name}</CardTitle>
                      <Badge variant="secondary" className="bg-purple-500/20 text-white/80">
                        {level.range}
                      </Badge>
                    </CardHeader>
                    <CardContent className="p-6 pt-0 bg-[#4b1b76]">
                      <p className="text-gray-300 text-sm text-center">{level.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <Card className="bg-purple-500/10 backdrop-blur-md border-purple-500/30">
                <CardHeader className="bg-[#3e1a66]">
                  <CardTitle className="text-white">Assessment Difficulty Levels</CardTitle>
                </CardHeader>
                <CardContent className="bg-[#401b69]">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-green-500/20 rounded-lg border border-green-500/30">
                      <h3 className="text-green-400 font-semibold">Easy</h3>
                      <p className="text-gray-300 text-sm mt-2">Basic concepts and straightforward implementations</p>
                    </div>
                    <div className="text-center p-4 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
                      <h3 className="text-yellow-400 font-semibold">Medium</h3>
                      <p className="text-gray-300 text-sm mt-2">Intermediate complexity requiring analytical thinking</p>
                    </div>
                    <div className="text-center p-4 bg-red-500/20 rounded-lg border border-red-500/30">
                      <h3 className="text-red-400 font-semibold">Tough</h3>
                      <p className="text-gray-300 text-sm mt-2">Advanced scenarios requiring deep expertise</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Assessment Types */}
            <TabsContent value="assessment" className="space-y-6 bg-[#411a69]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 bg-[#561c85]">
                {questionTypes.map((type) => {
                  const IconComponent = type.icon;
                  return (
                    <Card key={type.name} className="rounded-lg border text-card-foreground shadow-sm backdrop-blur-md border-white/20 bg-[#4b1c77]">
                      <CardHeader className="flex flex-col space-y-1.5 p-6 text-center bg-[#3c1a63]">
                        <div className="flex justify-center mb-2">
                          <div className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-600">
                            <IconComponent className="h-6 w-6 text-white" />
                          </div>
                        </div>
                        <CardTitle className="text-white text-lg">{type.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-6 pt-0 bg-[#3f1a68]">
                        <p className="text-gray-300 text-sm text-center">{type.description}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              
              <Card className="bg-purple-500/10 backdrop-blur-md border-purple-500/30">
                <CardHeader className="flex flex-col space-y-1.5 p-6 bg-[#3f1a67]">
                  <CardTitle className="text-white">Assessment Coverage Areas</CardTitle>
                </CardHeader>
                <CardContent className="bg-[#4b1b76]">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="text-center p-4 rounded-lg border border-blue-500/30 bg-[#5e278f]">
                      <BookOpen className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                      <h3 className="text-blue-400 font-semibold">Theoretical Knowledge</h3>
                      <p className="text-gray-300 text-xs mt-2">Core concepts and principles</p>
                    </div>
                    <div className="text-center p-4 bg-green-500/20 rounded-lg border border-green-500/30">
                      <Code className="h-8 w-8 text-green-400 mx-auto mb-2" />
                      <h3 className="text-green-400 font-semibold">Practical Application</h3>
                      <p className="text-gray-300 text-xs mt-2">Hands-on implementation skills</p>
                    </div>
                    <div className="text-center p-4 bg-purple-500/20 rounded-lg border border-purple-500/30">
                      <Target className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                      <h3 className="text-purple-400 font-semibold">Problem-Solving</h3>
                      <p className="text-gray-300 text-xs mt-2">Real-world scenario handling</p>
                    </div>
                    <div className="text-center p-4 bg-orange-500/20 rounded-lg border border-orange-500/30">
                      <Shield className="h-8 w-8 text-orange-400 mx-auto mb-2" />
                      <h3 className="text-orange-400 font-semibold">Best Practices</h3>
                      <p className="text-gray-300 text-xs mt-2">Industry standards and methodologies</p>
                    </div>
                    <div className="text-center p-4 bg-pink-500/20 rounded-lg border border-pink-500/30">
                      <Brain className="h-8 w-8 text-pink-400 mx-auto mb-2" />
                      <h3 className="text-pink-400 font-semibold">Innovation</h3>
                      <p className="text-gray-300 text-xs mt-2">Emerging technologies and trends</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          {/* Footer Stats */}
          <Card className="bg-purple-500/10 backdrop-blur-md border-purple-500/30">
            <CardContent className="p-6 pt-0 bg-[#411b6a]">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold text-purple-400">15</div>
                  <div className="text-gray-300 text-sm">Technical Domains</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-400">5</div>
                  <div className="text-gray-300 text-sm">Experience Levels</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-400">5</div>
                  <div className="text-gray-300 text-sm">Question Types</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-orange-400">75+</div>
                  <div className="text-gray-300 text-sm">Core Topic Areas</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
    </div>
  );
}