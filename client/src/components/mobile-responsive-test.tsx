import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Timer, ChevronLeft, ChevronRight, Flag, AlertTriangle } from "lucide-react";

interface MobileResponsiveTestProps {
  test: any;
  questions: any[];
  onTestCompleted?: (resultId: number) => void;
}

export function MobileResponsiveTest({ test, questions, onTestCompleted }: MobileResponsiveTestProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>(new Array(questions.length).fill(""));
  const [timeRemaining, setTimeRemaining] = useState(test.timeLimit * 60);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Auto-submit when time runs out
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [answers]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (answer: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    setAnswers(newAnswers);
  };

  const handleSubmit = () => {
    // For now, just simulate test completion - this should integrate with the same submission logic as TestInterface
    if (onTestCompleted) {
      // Simulate a result ID (in real implementation, this would come from the API)
      onTestCompleted(1);
    }
  };

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const renderQuestion = () => {
    switch (currentQ.type) {
      case "mcq":
        return (
          <div className="space-y-3">
            <p className="text-sm md:text-base font-medium mb-4">{currentQ.question}</p>
            <div className="space-y-2">
              {currentQ.options.map((option: string, index: number) => (
                <Button
                  key={index}
                  variant={answers[currentQuestion] === option ? "default" : "outline"}
                  className="w-full justify-start text-left p-3 h-auto cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => handleAnswerChange(option)}
                >
                  <span className="text-xs md:text-sm">{option}</span>
                </Button>
              ))}
            </div>
          </div>
        );

      case "drag-drop":
        return (
          <div className="space-y-4">
            <p className="text-sm md:text-base font-medium">{currentQ.question}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Options:</h4>
                {currentQ.options.map((option: string, index: number) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full text-left cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => handleAnswerChange(option)}
                  >
                    {option}
                  </Button>
                ))}
              </div>
              <div className="p-4 border-2 border-dashed rounded-lg min-h-32">
                <p className="text-sm text-muted-foreground mb-2">Your answer:</p>
                {answers[currentQuestion] && (
                  <Badge variant="secondary">{answers[currentQuestion]}</Badge>
                )}
              </div>
            </div>
          </div>
        );

      case "scenario":
        return (
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Scenario:</h4>
              <p className="text-sm">{currentQ.scenario}</p>
            </div>
            <p className="font-medium">{currentQ.question}</p>
            <textarea
              className="w-full p-3 border rounded-lg min-h-24 text-sm"
              placeholder="Enter your answer..."
              value={answers[currentQuestion]}
              onChange={(e) => handleAnswerChange(e.target.value)}
            />
          </div>
        );

      case "direct":
        return (
          <div className="space-y-4">
            <p className="text-sm md:text-base font-medium">{currentQ.question}</p>
            <textarea
              className="w-full p-3 border rounded-lg min-h-24 text-sm"
              placeholder="Enter your answer..."
              value={answers[currentQuestion]}
              onChange={(e) => handleAnswerChange(e.target.value)}
            />
          </div>
        );

      default:
        return <p>Question type not supported</p>;
    }
  };

  return (
    <div className={`min-h-screen bg-background ${isMobile ? 'p-2' : 'p-6'}`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className={`bg-card border rounded-lg p-4 mb-4 ${isMobile ? 'text-sm' : ''}`}>
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-lg md:text-xl font-bold">{test.title}</h1>
            <div className="flex items-center space-x-2 text-sm">
              <Timer className="h-4 w-4" />
              <span className={timeRemaining < 300 ? 'text-red-500 font-bold' : ''}>
                {formatTime(timeRemaining)}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <Progress value={progress} className="w-24 md:w-32" />
          </div>
        </div>

        {/* Main Question Area */}
        <Card className="mb-4">
          <CardHeader className={isMobile ? 'p-4' : ''}>
            <CardTitle className="flex items-center justify-between">
              <span className="text-base md:text-lg">
                Question {currentQuestion + 1}
              </span>
              <Badge variant="outline">{currentQ.type.toUpperCase()}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className={isMobile ? 'p-4 pt-0' : ''}>
            {renderQuestion()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            className={`${isMobile ? 'text-xs' : ''} cursor-pointer hover:bg-muted transition-colors disabled:cursor-not-allowed`}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              size={isMobile ? "sm" : "default"}
              className="text-yellow-600 border-yellow-600"
            >
              <Flag className="h-4 w-4 mr-1" />
              Flag
            </Button>
          </div>

          {currentQuestion === questions.length - 1 ? (
            <Button
              onClick={handleSubmit}
              className={`${isMobile ? 'text-xs' : ''} cursor-pointer hover:bg-primary/90 transition-colors`}
            >
              Submit Test
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
              className={`${isMobile ? 'text-xs' : ''} cursor-pointer hover:bg-primary/90 transition-colors`}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>

        {/* Question Navigator (Desktop only) */}
        {!isMobile && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-base">Question Navigator</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-10 gap-2">
                {questions.map((_, index) => (
                  <Button
                    key={index}
                    variant={
                      index === currentQuestion
                        ? "default"
                        : answers[index]
                        ? "secondary"
                        : "outline"
                    }
                    size="sm"
                    className="w-8 h-8 p-0"
                    onClick={() => setCurrentQuestion(index)}
                  >
                    {index + 1}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}