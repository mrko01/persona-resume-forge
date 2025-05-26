
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, User, Bot, CheckCircle, Clock, Sparkles } from 'lucide-react';
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

  const MAX_QUESTIONS = 6;
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
    // Remove complete <think>...</think> blocks
    let cleaned = text.replace(/<think>[\s\S]*?<\/think>/gi, '');
    
    // Remove orphaned <think> tags
    cleaned = cleaned.replace(/<think>[\s\S]*/gi, '');
    
    // Remove orphaned </think> tags
    cleaned = cleaned.replace(/.*?<\/think>/gi, '');
    
    // Clean up any remaining artifacts
    cleaned = cleaned.replace(/\s*<\/?think[^>]*>\s*/gi, '');
    
    return cleaned.trim();
  };

  const startInterview = async () => {
    const welcomeMessage: AIMessage = {
      role: 'assistant',
      content: `Hello ${initialData.personalInfo.name || 'there'}! 👋 I'm your AI resume consultant. I'll ask you a few targeted questions to create an outstanding ${initialData.targetRole} resume. 

Let's start with your most relevant experience - tell me about a job, internship, or project you're proud of!`,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  };

  const generateNextQuestion = async (conversationHistory: AIMessage[]) => {
    try {
      setIsLoading(true);
      setCurrentResponse('');

      const systemPrompt = `You are an expert resume consultant conducting a brief interview. Ask ONE clear, specific question (15-20 words max).

Target role: ${collectedData.targetRole}
Questions asked: ${questionCount}/${MAX_QUESTIONS}

CURRENT STATUS:
- Experience: ${collectedData.experience.length} entries
- Education: ${collectedData.education.length} entries  
- Skills: ${collectedData.skills.length} skills
- Projects: ${collectedData.projects.length} projects

QUESTION PRIORITY:
1. If no experience: Ask about most relevant work/internship
2. If no education: Ask about degree/school
3. If few skills: Ask about technical/soft skills for the role
4. If no projects: Ask about key achievements or projects
5. If 4+ questions: Ask final clarifying question

Keep questions conversational and specific. Examples:
- "What's your biggest professional achievement?"
- "Which technical skills are you strongest in?"
- "Tell me about your most challenging project."

NEVER use thinking tokens or internal reasoning. Respond with just the question.`;

      const messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.slice(-3).map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      ];

      const chatCompletion = await groq.chat.completions.create({
        messages: messages as any,
        model: "deepseek-r1-distill-llama-70b",
        temperature: 0.4,
        max_completion_tokens: 100,
        top_p: 0.8,
        stream: true,
        stop: null
      });

      let fullResponse = '';
      for await (const chunk of chatCompletion) {
        const content = chunk.choices[0]?.delta?.content || '';
        fullResponse += content;
        const cleanedResponse = removeThinkingTokens(fullResponse);
        if (cleanedResponse) {
          setCurrentResponse(cleanedResponse);
        }
      }

      const cleanedFinalResponse = removeThinkingTokens(fullResponse);
      
      if (cleanedFinalResponse) {
        const aiMessage: AIMessage = {
          role: 'assistant',
          content: cleanedFinalResponse,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, aiMessage]);
        setQuestionCount(prev => prev + 1);
      } else {
        // Fallback question if AI response was just thinking tokens
        const fallbackQuestion = getFallbackQuestion();
        const aiMessage: AIMessage = {
          role: 'assistant',
          content: fallbackQuestion,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
        setQuestionCount(prev => prev + 1);
      }

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

  const getFallbackQuestion = (): string => {
    if (collectedData.experience.length === 0) {
      return "What's your most relevant work experience or internship?";
    }
    if (collectedData.education.length === 0) {
      return "Tell me about your educational background.";
    }
    if (collectedData.skills.length < 3) {
      return "What are your key technical or professional skills?";
    }
    if (collectedData.projects.length === 0) {
      return "Describe a project or achievement you're proud of.";
    }
    return "What makes you uniquely qualified for this role?";
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
    if (questionCount >= MAX_QUESTIONS - 1 || completionProgress >= 80) {
      completeInterview();
      return;
    }

    await generateNextQuestion(updatedMessages);
  };

  const processUserResponse = async (response: string) => {
    const lowerResponse = response.toLowerCase();
    
    // Enhanced skill extraction
    const skillKeywords = [
      'javascript', 'typescript', 'python', 'java', 'react', 'angular', 'vue', 'node.js', 'express',
      'sql', 'mongodb', 'postgresql', 'mysql', 'html', 'css', 'sass', 'tailwind',
      'git', 'docker', 'aws', 'azure', 'gcp', 'kubernetes',
      'excel', 'powerpoint', 'word', 'photoshop', 'figma',
      'leadership', 'communication', 'teamwork', 'project management', 'problem solving',
      'data analysis', 'machine learning', 'artificial intelligence'
    ];
    
    const foundSkills = skillKeywords.filter(skill => lowerResponse.includes(skill.toLowerCase()));
    
    if (foundSkills.length > 0) {
      setCollectedData(prev => ({
        ...prev,
        skills: [...new Set([...prev.skills, ...foundSkills])]
      }));
    }

    // Extract achievements and quantifiable results
    const achievementPatterns = [
      /increased.*?(\d+%?)/i, /improved.*?(\d+%?)/i, /reduced.*?(\d+%?)/i,
      /grew.*?(\d+%?)/i, /saved.*?(\$?\d+)/i, /managed.*?(\d+)/i
    ];
    
    const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const achievements = sentences.filter(sentence => 
      achievementPatterns.some(pattern => pattern.test(sentence))
    );
    
    if (achievements.length > 0) {
      setCollectedData(prev => ({
        ...prev,
        achievements: [...prev.achievements, ...achievements.map(a => a.trim())]
      }));
    }
  };

  const completeInterview = async () => {
    try {
      setIsLoading(true);
      
      toast({
        title: "✨ Creating your resume...",
        description: "Analyzing your responses to build a professional resume.",
      });

      const conversationText = messages.map(m => `${m.role}: ${m.content}`).join('\n');
      
      const dataExtractionPrompt = `Extract structured resume data from this interview conversation. Return ONLY valid JSON without any thinking or explanation:

{
  "personalInfo": {"name": "${initialData.personalInfo.name}", "email": "", "phone": "", "location": ""},
  "experience": [{"company": "", "position": "", "startDate": "", "endDate": "", "description": [""], "location": ""}],
  "education": [{"institution": "", "degree": "", "field": "", "graduationDate": ""}],
  "skills": [""],
  "projects": [{"name": "", "description": "", "technologies": [""], "highlights": [""]}],
  "achievements": [""]
}

Extract concrete facts mentioned in the conversation. Focus on company names, job titles, dates, schools, degrees, specific skills, and project details.

Interview conversation:
${conversationText}`;

      const response = await groq.chat.completions.create({
        messages: [{ role: 'user', content: dataExtractionPrompt }],
        model: "deepseek-r1-distill-llama-70b",
        temperature: 0.1,
        max_completion_tokens: 2000
      });

      let extractedDataText = response.choices[0]?.message?.content || '{}';
      extractedDataText = removeThinkingTokens(extractedDataText);
      
      try {
        const jsonMatch = extractedDataText.match(/\{[\s\S]*\}/);
        const extractedData = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
        
        const finalResumeData: ResumeData = {
          ...collectedData,
          personalInfo: { ...collectedData.personalInfo, ...extractedData.personalInfo },
          experience: extractedData.experience?.length ? extractedData.experience : collectedData.experience,
          education: extractedData.education?.length ? extractedData.education : collectedData.education,
          skills: [...new Set([...collectedData.skills, ...(extractedData.skills || [])])],
          projects: extractedData.projects?.length ? extractedData.projects : collectedData.projects,
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
        title: "Interview Complete!",
        description: "Generating your resume with the collected information.",
      });
      onComplete(collectedData);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[700px] flex flex-col">
      <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-3xl">
        <div className="flex justify-between items-center mb-4">
          <CardTitle className="text-2xl text-gray-800 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-600" />
            AI Resume Interview
          </CardTitle>
          <Badge variant="outline" className="bg-white/70 text-blue-700 border-blue-200 px-4 py-1">
            {questionCount}/{MAX_QUESTIONS} questions
          </Badge>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between text-sm text-gray-700 font-medium">
            <span>Interview Progress</span>
            <span>{Math.round(completionProgress)}% complete</span>
          </div>
          <Progress value={completionProgress} className="h-3 bg-white/50" />
          
          <div className="flex gap-3 mt-4">
            {REQUIRED_SECTIONS.map((section) => {
              const hasData = section === 'experience' ? collectedData.experience.length > 0 :
                             section === 'education' ? collectedData.education.length > 0 :
                             section === 'skills' ? collectedData.skills.length > 0 :
                             collectedData.projects.length > 0;
              
              return (
                <div key={section} className="flex items-center gap-2 bg-white/60 rounded-full px-3 py-1">
                  {hasData ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <Clock className="w-4 h-4 text-gray-400" />
                  )}
                  <span className={`text-xs capitalize font-medium ${hasData ? 'text-green-700' : 'text-gray-500'}`}>
                    {section}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-6">
        <ScrollArea className="flex-1 pr-4 mb-6" ref={scrollAreaRef}>
          <div className="space-y-6">
            {messages.map((message, index) => (
              <div key={index} className={`flex items-start space-x-4 ${message.role === 'user' ? 'justify-end' : ''}`}>
                <div className={`flex items-start space-x-4 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md ${
                    message.role === 'assistant' 
                      ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white' 
                      : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600'
                  }`}>
                    {message.role === 'assistant' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                  </div>
                  <div className={`rounded-2xl p-4 shadow-sm ${
                    message.role === 'assistant' 
                      ? 'bg-gradient-to-br from-blue-50 to-purple-50 text-blue-900 border border-blue-100' 
                      : 'bg-gradient-to-br from-gray-50 to-white text-gray-900 border border-gray-200'
                  }`}>
                    <p className="text-sm leading-relaxed font-medium">{message.content}</p>
                    <div className="text-xs text-gray-500 mt-2 opacity-70">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {currentResponse && (
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center shadow-md">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 text-blue-900 rounded-2xl p-4 max-w-[85%] border border-blue-100 shadow-sm">
                  <p className="text-sm leading-relaxed font-medium">{currentResponse}</p>
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin mt-3 text-blue-600" />}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="space-y-4">
          <form onSubmit={handleSubmitResponse} className="flex space-x-3">
            <Input
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Tell me about your experience..."
              disabled={isLoading}
              className="flex-1 h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl bg-white shadow-sm"
            />
            <Button 
              type="submit" 
              disabled={isLoading || !userInput.trim()}
              className="h-12 px-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl shadow-md transition-all duration-200"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </Button>
          </form>

          {(questionCount >= 3 || completionProgress >= 50) && (
            <div className="text-center">
              <Button 
                onClick={completeInterview} 
                variant="outline"
                disabled={isLoading}
                className="bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200 hover:from-green-100 hover:to-emerald-100 rounded-xl px-8 py-2 shadow-sm transition-all duration-200"
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
