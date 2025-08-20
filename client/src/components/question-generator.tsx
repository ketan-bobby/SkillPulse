import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Loader2, Plus, CheckCircle2 } from "lucide-react";

interface QuestionGeneratorProps {
  testId?: number;
  onQuestionsGenerated?: (questions: any[]) => void;
}

export function QuestionGenerator({ testId, onQuestionsGenerated }: QuestionGeneratorProps) {
  const [config, setConfig] = useState({
    domain: "",
    level: "",
    questionType: "mcq",
    technology: "",
    topic: "",
    count: 3
  });
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);
  const { toast } = useToast();

  const generateMutation = useMutation({
    mutationFn: async (request: any) => {
      const res = await apiRequest("POST", "/api/generate/questions", request);
      return await res.json();
    },
    onSuccess: (data) => {
      setGeneratedQuestions(data.questions);
      toast({
        title: "Questions Generated",
        description: `Successfully generated ${data.questions.length} questions`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate questions",
        variant: "destructive",
      });
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (questions: any[]) => {
      const requests = questions.map(q => ({
        domain: config.domain,
        level: config.level,
        questionType: q.type,
        technology: config.technology,
        topic: config.topic,
        count: 1
      }));
      
      const res = await apiRequest("POST", "/api/generate/questions/bulk", {
        testId,
        requests: requests
      });
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/review/questions"] });
      onQuestionsGenerated?.(data.questions);
      setGeneratedQuestions([]);
      toast({
        title: "Questions Saved",
        description: `Added ${data.count} questions for review`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save questions",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!config.domain || !config.level) {
      toast({
        title: "Missing Information",
        description: "Please select domain and level",
        variant: "destructive",
      });
      return;
    }

    generateMutation.mutate(config);
  };

  const handleSaveQuestions = () => {
    if (generatedQuestions.length === 0) return;
    saveMutation.mutate(generatedQuestions);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-100 text-green-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "hard": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span>AI Question Generator</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="domain">Technical Domain</Label>
              <Select value={config.domain} onValueChange={(value) => setConfig({...config, domain: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select domain" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="programming">Programming</SelectItem>
                  <SelectItem value="frontend">Frontend Development</SelectItem>
                  <SelectItem value="backend">Backend Development</SelectItem>
                  <SelectItem value="devops">DevOps & Infrastructure</SelectItem>
                  <SelectItem value="mobile">Mobile Development</SelectItem>
                  <SelectItem value="data-science">Data Science</SelectItem>
                  <SelectItem value="ai-ml">AI & Machine Learning</SelectItem>
                  <SelectItem value="cloud">Cloud Engineering</SelectItem>
                  <SelectItem value="security">Cybersecurity</SelectItem>
                  <SelectItem value="databases">Database Engineering</SelectItem>
                  <SelectItem value="networking">Networking</SelectItem>
                  <SelectItem value="vmware-virtualization">VMware Virtualization</SelectItem>
                  <SelectItem value="redhat-administration">Red Hat Administration</SelectItem>
                  <SelectItem value="oracle-administration">Oracle Administration</SelectItem>
                  <SelectItem value="network-routing-switching">Network Routing & Switching</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="level">Skill Level</Label>
              <Select value={config.level} onValueChange={(value) => setConfig({...config, level: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="junior">Junior</SelectItem>
                  <SelectItem value="mid">Mid-Level</SelectItem>
                  <SelectItem value="senior">Senior</SelectItem>
                  <SelectItem value="lead">Lead/Staff</SelectItem>
                  <SelectItem value="principal">Principal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="questionType">Question Type</Label>
              <Select value={config.questionType} onValueChange={(value) => setConfig({...config, questionType: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mcq">Multiple Choice</SelectItem>
                  <SelectItem value="coding">Coding Challenge</SelectItem>
                  <SelectItem value="scenario">Scenario-based</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="technology">Technology (Optional)</Label>
              <Input
                id="technology"
                value={config.technology}
                onChange={(e) => setConfig({...config, technology: e.target.value})}
                placeholder="e.g., React, Python, AWS"
              />
            </div>

            <div>
              <Label htmlFor="topic">Specific Topic (Optional)</Label>
              <Input
                id="topic"
                value={config.topic}
                onChange={(e) => setConfig({...config, topic: e.target.value})}
                placeholder="e.g., State management, API design"
              />
            </div>

            <div>
              <Label htmlFor="count">Number of Questions</Label>
              <Select value={config.count.toString()} onValueChange={(value) => setConfig({...config, count: parseInt(value)})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Question</SelectItem>
                  <SelectItem value="3">3 Questions</SelectItem>
                  <SelectItem value="5">5 Questions</SelectItem>
                  <SelectItem value="10">10 Questions</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4">
            <Button
              onClick={handleGenerate}
              disabled={generateMutation.isPending || !config.domain || !config.level}
              className="flex items-center space-x-2"
            >
              {generateMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              <span>{generateMutation.isPending ? "Generating..." : "Generate Questions"}</span>
            </Button>

            {generatedQuestions.length > 0 && (
              <Button
                onClick={handleSaveQuestions}
                disabled={saveMutation.isPending}
                variant="outline"
                className="flex items-center space-x-2"
              >
                {saveMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                <span>{saveMutation.isPending ? "Saving..." : "Add to Review Queue"}</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Generated Questions Preview */}
      {generatedQuestions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Generated Questions Preview</h3>
          {generatedQuestions.map((question, index) => (
            <Card key={index} className="border-l-4 border-l-primary">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{question.type.toUpperCase()}</Badge>
                    <Badge className={getDifficultyColor(question.difficulty)}>
                      {question.difficulty}
                    </Badge>
                    {question.codeLanguage && (
                      <Badge variant="secondary">{question.codeLanguage}</Badge>
                    )}
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <h4 className="font-medium mb-2">{question.question}</h4>
                
                {question.type === "mcq" && Array.isArray(question.options) && (
                  <div className="space-y-1 mb-3">
                    {question.options.map((option: string, optIndex: number) => (
                      <div key={optIndex} className="text-sm text-muted-foreground">
                        {String.fromCharCode(65 + optIndex)}) {option}
                      </div>
                    ))}
                    <div className="text-sm font-medium text-green-600 mt-2">
                      ✓ {question.correctAnswer}
                    </div>
                  </div>
                )}

                {question.type === "coding" && (
                  <div className="space-y-2 mb-3">
                    <div className="text-sm text-muted-foreground">
                      Template provided with test cases
                    </div>
                    {question.timeLimit && (
                      <div className="text-sm text-muted-foreground">
                        Time limit: {question.timeLimit} minutes
                      </div>
                    )}
                  </div>
                )}

                <div className="text-sm text-muted-foreground">
                  <strong>Explanation:</strong> {question.explanation}
                </div>

                {question.tags && question.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {question.tags.map((tag: string, tagIndex: number) => (
                      <Badge key={tagIndex} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}