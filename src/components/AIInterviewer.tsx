
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, User, Bot, CheckCircle, Clock } from 'lucide-react';
import { ResumeData, AIMessage } from '@/types/resume';
import { useToast } from '@/hooks/use-toast';
import { Groq } from 'groq-sdk';

interface AIInterviewerProps {
  initialData: ResumeData;
  onComplete: (data: ResumeData) => void;
}

const AIInterviewer: React.FC<AIInterviewerProps> = ({ initialData, onComplete }) => {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [currentResponse, setCurrentResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [questionCount, setQuestionCount] = useState(0);
  const [collectedData, setCollectedData] = useState<ResumeData>(initialData);
  const [completionProgress, setCompletionProgress] = useState(0);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const groq = new Groq({
    apiKey: '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',
    dangerouslyAllowBrowser: true
  });

  const MAX_QUESTIONS = 8;
  const REQUIRED_SECTIONS = ['experience', 'education', 'skills', 'projects'];

  useEffect(() => {
    startInterview();
  }, []);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, currentResponse]);

  useEffect(() => {
    updateCompletionProgress();
  }, [collectedData, questionCount]);

  const updateCompletionProgress = () => {
    let completedSections = 0;
    if (collectedData.experience.length > 0) completedSections++;
    if (collectedData.education.length > 0) completedSections++;
    if (collectedData.skills.length > 0) completedSections++;
    if (collectedData.projects.length > 0) completedSections++;
    
    const sectionProgress = (completedSections / REQUIRED_SECTIONS.length) * 70;
    const questionProgress = (questionCount / MAX_QUESTIONS) * 30;
    setCompletionProgress(Math.min(sectionProgress + questionProgress, 100));
  };

  const removeThinkingTokens = (text: string): string => {
    return text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  };

  const startInterview = async () => {
    const welcomeMessage: AIMessage = {
      role: 'assistant',
      content: `Hello ${initialData.personalInfo.name || 'there'}! 👋 I'm here to help you create an outstanding ${initialData.targetRole} resume. I'll ask you a few targeted questions to highlight your best experiences and skills. Let's start with your most recent or relevant work experience - what have you been doing professionally?`,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  };

  const generateNextQuestion = async (conversationHistory: AIMessage[]) => {
    try {
      setIsLoading(true);
      setCurrentResponse('');

      const systemPrompt = `You are an expert resume consultant. Ask ONE specific, actionable question to gather resume information.

CRITICAL INSTRUCTIONS:
- Ask SHORT, clear questions (max 25 words)
- Focus on specific details, not general topics
- Adapt to their target role: ${collectedData.targetRole}
- Questions asked so far: ${questionCount}/${MAX_QUESTIONS}

CURRENT DATA STATUS:
- Experience: ${collectedData.experience.length} entries
- Education: ${collectedData.education.length} entries  
- Skills: ${collectedData.skills.length} skills
- Projects: ${collectedData.projects.length} projects

PRIORITY ORDER:
1. If no work experience: Ask about their most relevant job/internship
2. If no education: Ask about their degree/school
3. If few skills: Ask about specific technical/soft skills
4. If no projects: Ask about key projects or achievements
5. If 6+ questions asked: Ask final clarifying question and prepare to wrap up

Keep questions conversational and specific. Example: "What's your biggest professional achievement?" not "Tell me about your achievements."`;

      const messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.slice(-4).map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      ];

      const chatCompletion = await groq.chat.completions.create({
        messages: messages as any,
        model: "deepseek-r1-distill-llama-70b",
        temperature: 0.6,
        max_completion_tokens: 150,
        top_p: 0.9,
        stream: true,
        stop: null
      });

      let fullResponse = '';
      for await (const chunk of chatCompletion) {
        const content = chunk.choices[0]?.delta?.content || '';
        fullResponse += content;
        const cleanedResponse = removeThinkingTokens(fullResponse);
        setCurrentResponse(cleanedResponse);
      }

      const cleanedFinalResponse = removeThinkingTokens(fullResponse);
      
      const aiMessage: AIMessage = {
        role: 'assistant',
        content: cleanedFinalResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      setQuestionCount(prev => prev + 1);

    } catch (error) {
      console.error('Error generating question:', error);
      toast({
        title: "Connection Error",
        description: "Let's try that again. Your progress is saved.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setCurrentResponse('');
    }
  };

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const userMessage: AIMessage = {
      role: 'user',
      content: userInput.trim(),
      timestamp: new Date()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setUserInput('');

    await processUserResponse(userInput.trim());

    // Check if we should complete the interview
    const shouldComplete = await shouldCompleteInterview(updatedMessages);
    if (shouldComplete || questionCount >= MAX_QUESTIONS) {
      completeInterview();
      return;
    }

    await generateNextQuestion(updatedMessages);
  };

  const processUserResponse = async (response: string) => {
    // Enhanced keyword-based processing
    const lowerResponse = response.toLowerCase();
    
    // Extract skills
    const skillKeywords = ['javascript', 'python', 'react', 'node', 'sql', 'html', 'css', 'java', 'c++', 'excel', 'powerpoint', 'leadership', 'communication', 'project management'];
    const foundSkills = skillKeywords.filter(skill => lowerResponse.includes(skill));
    
    if (foundSkills.length > 0) {
      setCollectedData(prev => ({
        ...prev,
        skills: [...new Set([...prev.skills, ...foundSkills])]
      }));
    }

    // Simple achievement extraction
    if (lowerResponse.includes('increased') || lowerResponse.includes('improved') || lowerResponse.includes('achieved')) {
      const sentences = response.split('.').filter(s => s.trim().length > 10);
      const achievements = sentences.filter(s => 
        s.toLowerCase().includes('increased') || 
        s.toLowerCase().includes('improved') || 
        s.toLowerCase().includes('achieved')
      );
      
      if (achievements.length > 0) {
        setCollectedData(prev => ({
          ...prev,
          achievements: [...prev.achievements, ...achievements.map(a => a.trim())]
        }));
      }
    }
  };

  const shouldCompleteInterview = async (conversationHistory: AIMessage[]): Promise<boolean> => {
    try {
      const hasMinimumData = 
        collectedData.experience.length > 0 || 
        collectedData.education.length > 0 || 
        collectedData.skills.length >= 3;
      
      const hasReachedQuestionLimit = questionCount >= MAX_QUESTIONS - 1;
      
      return hasMinimumData && (hasReachedQuestionLimit || completionProgress >= 80);
    } catch (error) {
      console.error('Error checking completion:', error);
      return questionCount >= MAX_QUESTIONS;
    }
  };

  const completeInterview = async () => {
    try {
      setIsLoading(true);
      
      toast({
        title: "Generating your resume...",
        description: "Processing your information to create a professional resume.",
      });

      const conversationText = messages.map(m => `${m.role}: ${m.content}`).join('\n');
      
      const dataExtractionPrompt = `Extract structured resume data from this interview. Return ONLY valid JSON:

{
  "personalInfo": {"name": "${initialData.personalInfo.name}", "email": "", "phone": "", "location": ""},
  "experience": [{"company": "", "position": "", "startDate": "", "endDate": "", "description": [""], "location": ""}],
  "education": [{"institution": "", "degree": "", "field": "", "graduationDate": ""}],
  "skills": [""],
  "projects": [{"name": "", "description": "", "technologies": [""], "highlights": [""]}],
  "achievements": [""]
}

Extract only facts mentioned. Focus on concrete details like company names, job titles, dates, school names, degrees, specific skills, and project names.

Interview: ${conversationText}`;

      const response = await groq.chat.completions.create({
        messages: [{ role: 'user', content: dataExtractionPrompt }],
        model: "deepseek-r1-distill-llama-70b",
        temperature: 0.2,
        max_completion_tokens: 1500
      });

      let extractedDataText = response.choices[0]?.message?.content || '{}';
      extractedDataText = removeThinkingTokens(extractedDataText);
      
      try {
        const jsonMatch = extractedDataText.match(/\{[\s\S]*\}/);
        const extractedData = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
        
        const finalResumeData: ResumeData = {
          ...collectedData,
          personalInfo: { ...collectedData.personalInfo, ...extractedData.personalInfo },
          experience: extractedData.experience || collectedData.experience,
          education: extractedData.education || collectedData.education,
          skills: [...new Set([...collectedData.skills, ...(extractedData.skills || [])])],
          projects: extractedData.projects || collectedData.projects,
          achievements: [...new Set([...collectedData.achievements, ...(extractedData.achievements || [])])]
        };

        console.log('Final resume data:', finalResumeData);
        onComplete(finalResumeData);
      } catch (parseError) {
        console.error('Error parsing extracted data:', parseError);
        onComplete(collectedData);
      }

    } catch (error) {
      console.error('Error completing interview:', error);
      toast({
        title: "Processing complete",
        description: "Using collected information to generate your resume.",
      });
      onComplete(collectedData);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[700px] flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center mb-4">
          <CardTitle className="text-xl text-gray-800">AI Resume Interview</CardTitle>
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            {questionCount}/{MAX_QUESTIONS} questions
          </Badge>
        </div>
        
        {/* Enhanced Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Interview Progress</span>
            <span>{Math.round(completionProgress)}% complete</span>
          </div>
          <Progress value={completionProgress} className="h-2" />
          
          {/* Data Collection Status */}
          <div className="flex gap-2 mt-3">
            {REQUIRED_SECTIONS.map((section) => {
              const hasData = section === 'experience' ? collectedData.experience.length > 0 :
                             section === 'education' ? collectedData.education.length > 0 :
                             section === 'skills' ? collectedData.skills.length > 0 :
                             collectedData.projects.length > 0;
              
              return (
                <div key={section} className="flex items-center gap-1">
                  {hasData ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <Clock className="w-4 h-4 text-gray-400" />
                  )}
                  <span className={`text-xs capitalize ${hasData ? 'text-green-600' : 'text-gray-400'}`}>
                    {section}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        <ScrollArea className="flex-1 pr-4 mb-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div key={index} className={`flex items-start space-x-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                <div className={`flex items-start space-x-3 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${message.role === 'assistant' ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                    {message.role === 'assistant' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  <div className={`rounded-2xl p-4 ${message.role === 'assistant' ? 'bg-blue-50 text-blue-900 border border-blue-100' : 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-900 border border-gray-200'}`}>
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <div className="text-xs text-gray-500 mt-2">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {currentResponse && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-blue-50 text-blue-900 rounded-2xl p-4 max-w-[85%] border border-blue-100">
                  <p className="text-sm leading-relaxed">{currentResponse}</p>
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin mt-2 text-blue-600" />}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Enhanced Input Form */}
        <div className="space-y-3">
          <form onSubmit={handleSubmitResponse} className="flex space-x-3">
            <Input
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Share your experience here..."
              disabled={isLoading}
              className="flex-1 h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl"
            />
            <Button 
              type="submit" 
              disabled={isLoading || !userInput.trim()}
              className="h-12 px-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </form>

          {/* Smart Complete Button */}
          {(questionCount >= 4 || completionProgress >= 60) && (
            <div className="text-center">
              <Button 
                onClick={completeInterview} 
                variant="outline"
                disabled={isLoading}
                className="bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200 hover:from-green-100 hover:to-emerald-100 rounded-xl px-6"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Generate My Resume
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </div>
  );
};

export default AIInterviewer;
