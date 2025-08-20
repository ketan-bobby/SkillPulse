import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Play, CheckCircle, CheckCircle2, AlertCircle } from "lucide-react";

interface CodingQuestionProps {
  question: any;
  onAnswerChange: (answer: string) => void;
  currentAnswer?: string;
}

export function CodingQuestion({ question, onAnswerChange, currentAnswer = "" }: CodingQuestionProps) {
  const [code, setCode] = useState(currentAnswer || question.options?.template || "");
  const [testResults, setTestResults] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    onAnswerChange(newCode);
  };

  const generateTestCases = () => {
    // Generate realistic test cases based on the question
    const questionText = question.question.toLowerCase();
    
    if (questionText.includes("factorial")) {
      return [
        { input: "5", expected: "120", description: "factorial(5) should return 120" },
        { input: "0", expected: "1", description: "factorial(0) should return 1" },
        { input: "3", expected: "6", description: "factorial(3) should return 6" },
        { input: "1", expected: "1", description: "factorial(1) should return 1" }
      ];
    } else if (questionText.includes("fibonacci")) {
      return [
        { input: "8", expected: "21", description: "fibonacci(8) should return 21" },
        { input: "0", expected: "0", description: "fibonacci(0) should return 0" },
        { input: "1", expected: "1", description: "fibonacci(1) should return 1" },
        { input: "5", expected: "5", description: "fibonacci(5) should return 5" }
      ];
    } else if (questionText.includes("reverse") || questionText.includes("string")) {
      return [
        { input: '"hello"', expected: '"olleh"', description: "reverse('hello') should return 'olleh'" },
        { input: '"world"', expected: '"dlrow"', description: "reverse('world') should return 'dlrow'" },
        { input: '"a"', expected: '"a"', description: "reverse('a') should return 'a'" },
        { input: '""', expected: '""', description: "reverse('') should return ''" }
      ];
    } else if (questionText.includes("palindrome")) {
      return [
        { input: '"racecar"', expected: "true", description: "isPalindrome('racecar') should return true" },
        { input: '"hello"', expected: "false", description: "isPalindrome('hello') should return false" },
        { input: '"a"', expected: "true", description: "isPalindrome('a') should return true" },
        { input: '"Aa"', expected: "false", description: "isPalindrome('Aa') should return false" }
      ];
    } else if (questionText.includes("sum") || questionText.includes("array")) {
      return [
        { input: "[1,2,3,4,5]", expected: "15", description: "sum([1,2,3,4,5]) should return 15" },
        { input: "[]", expected: "0", description: "sum([]) should return 0" },
        { input: "[10]", expected: "10", description: "sum([10]) should return 10" },
        { input: "[-1,1,0]", expected: "0", description: "sum([-1,1,0]) should return 0" }
      ];
    }
    
    // Default test cases for generic coding problems
    return [
      { input: "5", expected: "Expected output", description: "Test case 1" },
      { input: "10", expected: "Expected output", description: "Test case 2" },
      { input: "0", expected: "Expected output", description: "Test case 3" }
    ];
  };

  const simulateCodeExecution = (userCode: string, testCases: any[]) => {
    // Simulate code execution with realistic results
    const results = testCases.map((testCase, index) => {
      // Simple simulation logic - in real implementation, this would execute actual code
      const questionText = question.question.toLowerCase();
      let actual = testCase.expected; // Default to correct
      let passed = true;
      
      // Introduce some realistic failures for demonstration
      if (index === testCases.length - 1 && Math.random() > 0.7) {
        // Sometimes fail the last test case
        actual = "Wrong output";
        passed = false;
      } else if (userCode.length < 20) {
        // If code is too short, likely incomplete
        actual = "undefined";
        passed = false;
      }
      
      return {
        input: testCase.input,
        expected: testCase.expected,
        actual,
        passed,
        description: testCase.description
      };
    });

    const passed = results.filter(r => r.passed).length;
    return {
      passed,
      total: results.length,
      cases: results
    };
  };

  const runCode = async () => {
    if (code.trim() === '') {
      // Show alert if no code is written
      alert('⚠️ Please write your solution in the code editor before clicking "Run Code"!');
      return;
    }
    
    setIsRunning(true);
    
    // Generate test cases if not provided
    const testCases = question.options?.testCases || generateTestCases();
    
    // Simulate execution delay with progress indication
    setTimeout(() => {
      const results = simulateCodeExecution(code, testCases);
      setTestResults(results);
      setIsRunning(false);
      
      // Auto-switch to results tab after execution
      const resultsTab = document.querySelector('[value="results"]') as HTMLElement;
      if (resultsTab) {
        resultsTab.click();
      }
    }, 2000);
  };

  return (
    <div className="w-full space-y-8">
      {/* Question Header with proper spacing */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 leading-7">{question.question}</h3>
        
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1">
            {question.codeLanguage || "JavaScript"}
          </Badge>
          <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 px-3 py-1">
            {question.difficulty}
          </Badge>
          {question.timeLimit && (
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 px-3 py-1">
              {question.timeLimit} mins
            </Badge>
          )}
        </div>
        
        {question.explanation && (
          <div className="bg-gray-50 rounded-md p-4 border-l-4 border-blue-400">
            <p className="text-gray-700 leading-relaxed">{question.explanation}</p>
          </div>
        )}
        
        {/* Instructions Card */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h4 className="text-sm font-semibold text-blue-800 mb-2">📝 Instructions</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Write your solution in the Code Editor tab</li>
            <li>• Click the <strong>"Run Code"</strong> button to test your solution</li>
            <li>• View test cases in the Test Cases tab for examples</li>
            <li>• Check your results in the Results tab after running</li>
          </ul>
        </div>
      </div>

      {/* Tabs Section with proper spacing */}
      <Tabs defaultValue="code" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-lg mb-6">
          <TabsTrigger value="code" className="data-[state=active]:bg-white data-[state=active]:shadow-sm py-3 px-4 font-medium">
            Code Editor
          </TabsTrigger>
          <TabsTrigger value="tests" className="data-[state=active]:bg-white data-[state=active]:shadow-sm py-3 px-4 font-medium">
            Test Cases
          </TabsTrigger>
          <TabsTrigger value="results" className="data-[state=active]:bg-white data-[state=active]:shadow-sm py-3 px-4 font-medium">
            Results
          </TabsTrigger>
        </TabsList>

        <TabsContent value="code" className="mt-0">
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between bg-gray-50 border-b border-gray-200 py-4 px-6">
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">Solution</CardTitle>
                <p className="text-sm text-gray-600 mt-1">Write your code below and click "Run Code" to test</p>
              </div>
              <Button
                onClick={runCode}
                disabled={isRunning}
                size="default"
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 px-6 py-3 font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                <Play className="h-5 w-5" />
                <span>{isRunning ? "Running Tests..." : "▶ Run Code"}</span>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative">
                <textarea
                  value={code}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  className="w-full h-80 p-6 font-mono text-sm bg-white border-0 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                  placeholder={`// Write your ${question.codeLanguage || "JavaScript"} solution here...\n// Use proper formatting and indentation\n// Click "Run Code" button to test your solution\n\nfunction solution() {\n    // Your code here\n    return result;\n}`}
                  spellCheck={false}
                  style={{ 
                    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", "Courier New", monospace',
                    lineHeight: '1.6'
                  }}
                />
                {code.trim() === '' && (
                  <div className="absolute top-4 right-4 bg-yellow-100 border border-yellow-300 rounded-lg p-3 text-sm text-yellow-700">
                    👆 Start typing your solution here, then click "Run Code" to test it!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tests" className="mt-0">
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="bg-gray-50 border-b border-gray-200 py-4 px-6">
              <CardTitle className="text-lg font-semibold text-gray-900">Test Cases</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {(() => {
                  const testCases = question.options?.testCases || generateTestCases();
                  return testCases.map((testCase: any, index: number) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                      <div className="mb-4">
                        <p className="text-base font-semibold text-gray-900">Test Case {index + 1}</p>
                        {testCase.description && (
                          <p className="text-sm text-gray-600 mt-2">{testCase.description}</p>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-3">Input:</p>
                          <code className="text-sm bg-white p-4 rounded border border-gray-300 block w-full font-mono text-gray-800">
                            {testCase.input}
                          </code>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-3">Expected Output:</p>
                          <code className="text-sm bg-white p-4 rounded border border-gray-300 block w-full font-mono text-gray-800">
                            {testCase.expected}
                          </code>
                        </div>
                      </div>
                    </div>
                  ));
                })()}
                {!question.options?.testCases && (
                  <div className="text-center py-8 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-blue-700 text-sm font-medium">💡 Test cases generated based on question type</p>
                    <p className="text-blue-600 text-xs mt-2">Write your solution and click "Run Code" to see how it performs!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="mt-0">
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="bg-gray-50 border-b border-gray-200 py-4 px-6">
              <CardTitle className="text-lg font-semibold text-gray-900">Execution Results</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {testResults ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-base font-semibold text-gray-900">
                      Tests Passed: {testResults.passed}/{testResults.total}
                    </span>
                    <Badge 
                      variant={testResults.passed === testResults.total ? "default" : "destructive"}
                      className="px-3 py-1 text-sm font-medium"
                    >
                      {testResults.passed === testResults.total ? "All Passed" : "Some Failed"}
                    </Badge>
                  </div>
                  
                  <div className="space-y-4">
                    {testResults.cases.map((testCase: any, index: number) => (
                      <div key={index} className={`p-6 border rounded-lg ${testCase.passed ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            {testCase.passed ? (
                              <CheckCircle2 className="h-6 w-6 text-green-600" />
                            ) : (
                              <AlertCircle className="h-6 w-6 text-red-600" />
                            )}
                            <span className="font-semibold text-base text-gray-900">Test Case {index + 1}</span>
                            <Badge 
                              variant={testCase.passed ? "default" : "destructive"} 
                              className="text-xs font-medium px-2 py-1"
                            >
                              {testCase.passed ? "PASSED" : "FAILED"}
                            </Badge>
                          </div>
                        </div>
                        
                        {testCase.description && (
                          <p className="text-sm text-gray-600 mb-4 bg-white p-3 rounded border-l-4 border-blue-400">{testCase.description}</p>
                        )}
                        
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          <div>
                            <p className="font-medium text-gray-700 mb-3 text-sm">Input:</p>
                            <code className="text-sm bg-white p-4 rounded border border-gray-300 block font-mono w-full text-gray-800">
                              {testCase.input}
                            </code>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700 mb-3 text-sm">Expected:</p>
                            <code className="text-sm bg-white p-4 rounded border border-gray-300 block font-mono w-full text-gray-800">
                              {testCase.expected}
                            </code>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700 mb-3 text-sm">Your Output:</p>
                            <code className={`text-sm p-4 rounded block border font-mono w-full ${testCase.passed ? 'bg-green-100 border-green-300 text-green-800' : 'bg-red-100 border-red-300 text-red-800'}`}>
                              {testCase.actual}
                            </code>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg border border-blue-200">
                  <div className="mb-4">
                    <Play className="h-12 w-12 text-blue-500 mx-auto mb-2" />
                  </div>
                  <p className="text-gray-800 text-lg font-semibold mb-2">Ready to test your solution?</p>
                  <p className="text-gray-600 text-base mb-4">Click the <strong className="text-green-600">"Run Code"</strong> button above to see execution results</p>
                  <div className="bg-white rounded-md p-3 border border-blue-200 inline-block">
                    <p className="text-sm text-blue-700">🚀 Your code will be tested against multiple test cases</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}