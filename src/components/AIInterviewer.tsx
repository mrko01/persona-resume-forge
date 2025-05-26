
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, User, Bot, CheckCircle, Clock, Sparkles, Brain } from 'lucide-react';
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
  const [isInterviewComplete, setIsInterviewComplete] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const groq = new Groq({
    apiKey: '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',
    dangerouslyAllowBrowser: true
  });

  const REQUIRED_SECTIONS = ['experience', 'education', 'skills'];

  useEffect(() => {
    startInterview();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentResponse]);

  useEffect(() => {
    updateCompletionProgress();
  }, [collectedData, questionCount]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const updateCompletionProgress = () => {
    let completedSections = 0;
    let totalContent = 0;
    
    if (collectedData.experience.length > 0) {
      completedSections++;
      totalContent += collectedData.experience.length;
    }
    if (collectedData.education.length > 0) {
      completedSections++;
      totalContent += collectedData.education.length;
    }
    if (collectedData.skills.length > 2) {
      completedSections++;
      totalContent += collectedData.skills.length;
    }
    if (collectedData.achievements.length > 1) {
      totalContent += collectedData.achievements.length;
    }
    
    const sectionProgress = (completedSections / REQUIRED_SECTIONS.length) * 60;
    const contentProgress = Math.min(totalContent * 8, 40);
    setCompletionProgress(Math.min(sectionProgress + contentProgress, 100));
  };

  const shouldCompleteInterview = () => {
    return (
      completionProgress >= 75 ||
      (questionCount >= 4 && collectedData.experience.length > 0 && collectedData.skills.length > 2) ||
      questionCount >= 8
    );
  };

  const startInterview = async () => {
    const welcomeMessage: AIMessage = {
      role: 'assistant',
      content: `Hi ${initialData.personalInfo.name || 'there'}! 🚀 I'm your AI career consultant. I'll ask smart questions to build you an amazing ${initialData.targetRole} resume. Let's dive in!

What's your most impressive work experience or project so far?`,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  };

  const generateNextQuestion = async (conversationHistory: AIMessage[]) => {
    try {
      setIsLoading(true);
      setCurrentResponse('');

      const systemPrompt = `You are an expert resume consultant. Ask ONE strategic question (max 15 words) to gather missing info.

TARGET: ${collectedData.targetRole}
CURRENT DATA:
- Experience: ${collectedData.experience.length} entries
- Education: ${collectedData.education.length} entries  
- Skills: ${collectedData.skills.length} skills
- Achievements: ${collectedData.achievements.length} items

QUESTION STRATEGY:
1. No experience → "What's your most relevant work experience?"
2. No education → "Tell me about your degree or education?"
3. Few skills → "What technical skills make you stand out?"
4. Need achievements → "What's your biggest professional win?"
5. Need specifics → "Can you quantify that achievement?"

Keep questions short, conversational, and strategic. Focus on getting concrete details.`;

      const recentContext = conversationHistory.slice(-4).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const chatCompletion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          ...recentContext
        ] as any,
        model: "meta-llama/llama-3.1-70b-versatile", // Using available model
        temperature: 0.7,
        max_completion_tokens: 80,
        top_p: 0.9,
        stream: true
      });

      let fullResponse = '';
      for await (const chunk of chatCompletion) {
        const content = chunk.choices[0]?.delta?.content || '';
        fullResponse += content;
        setCurrentResponse(fullResponse);
      }
      
      if (fullResponse.trim()) {
        const aiMessage: AIMessage = {
          role: 'assistant',
          content: fullResponse.trim(),
          timestamp: new Date()
        };

        setMessages(prev => [...prev, aiMessage]);
        setQuestionCount(prev => prev + 1);
      }

    } catch (error) {
      console.error('Error generating question:', error);
      const fallbackQuestion = getFallbackQuestion();
      const aiMessage: AIMessage = {
        role: 'assistant',
        content: fallbackQuestion,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setQuestionCount(prev => prev + 1);
    } finally {
      setIsLoading(false);
      setCurrentResponse('');
    }
  };

  const getFallbackQuestion = (): string => {
    if (collectedData.experience.length === 0) {
      return "What's your most relevant work experience?";
    }
    if (collectedData.education.length === 0) {
      return "Tell me about your educational background.";
    }
    if (collectedData.skills.length < 3) {
      return "What are your strongest technical skills?";
    }
    return "What achievement are you most proud of?";
  };

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

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
    if (shouldCompleteInterview()) {
      setIsInterviewComplete(true);
      completeInterview();
      return;
    }

    await generateNextQuestion(updatedMessages);
  };

  const processUserResponse = async (response: string) => {
    const lowerResponse = response.toLowerCase();
    
    // Enhanced skill extraction with more comprehensive keywords
    const skillKeywords = [
      'javascript', 'typescript', 'python', 'java', 'react', 'angular', 'vue', 'node.js', 'express',
      'sql', 'mongodb', 'postgresql', 'mysql', 'html', 'css', 'sass', 'tailwind', 'bootstrap',
      'git', 'docker', 'aws', 'azure', 'gcp', 'kubernetes', 'jenkins', 'ci/cd',
      'excel', 'powerpoint', 'word', 'photoshop', 'figma', 'sketch',
      'leadership', 'communication', 'teamwork', 'project management', 'problem solving',
      'data analysis', 'machine learning', 'artificial intelligence', 'api', 'rest', 'graphql'
    ];
    
    const foundSkills = skillKeywords.filter(skill => 
      lowerResponse.includes(skill.toLowerCase()) || lowerResponse.includes(skill.replace(/[.\s]/g, ''))
    );
    
    if (foundSkills.length > 0) {
      setCollectedData(prev => ({
        ...prev,
        skills: [...new Set([...prev.skills, ...foundSkills])]
      }));
    }

    // Enhanced achievement extraction
    const achievementPatterns = [
      /(?:increased|improved|grew|boosted|enhanced).*?(\d+%?)/i,
      /(?:reduced|decreased|cut|saved).*?(\d+%?|\$\d+)/i,
      /(?:managed|led|supervised).*?(\d+)/i,
      /(?:generated|earned|produced).*?(\$\d+)/i
    ];
    
    const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 15);
    const achievements = sentences.filter(sentence => 
      achievementPatterns.some(pattern => pattern.test(sentence)) ||
      /(?:award|recognition|promotion|success|achievement)/i.test(sentence)
    );
    
    if (achievements.length > 0) {
      setCollectedData(prev => ({
        ...prev,
        achievements: [...new Set([...prev.achievements, ...achievements.map(a => a.trim())])]
      }));
    }

    // Auto-extract experience and education mentions
    if (/(?:worked|employed|job|intern|contractor)/i.test(response)) {
      const companyMatches = response.match(/(?:at|for|with)\s+([A-Z][a-zA-Z\s&]+)/g);
      if (companyMatches && collectedData.experience.length === 0) {
        const company = companyMatches[0].replace(/^(?:at|for|with)\s+/, '').trim();
        setCollectedData(prev => ({
          ...prev,
          experience: [{
            company,
            position: 'Position to be specified',
            startDate: '',
            endDate: '',
            description: [response],
            location: ''
          }]
        }));
      }
    }
  };

  const completeInterview = async () => {
    try {
      setIsLoading(true);
      
      toast({
        title: "🎯 Creating your resume...",
        description: "Analyzing your responses and building a professional resume.",
      });

      const conversationText = messages
        .filter(m => m.role === 'user')
        .map(m => m.content)
        .join(' ');
      
      const dataExtractionPrompt = `Extract resume data from: "${conversationText}"

Return valid JSON:
{
  "experience": [{"company":"CompanyName", "position":"JobTitle", "description":["bullet point"]}],
  "education": [{"institution":"School", "degree":"Degree", "field":"Field"}],
  "skills": ["skill1", "skill2"],
  "achievements": ["achievement with numbers"]
}

Focus on concrete facts, company names, job titles, schools, and quantified achievements.`;

      const response = await groq.chat.completions.create({
        messages: [{ role: 'user', content: dataExtractionPrompt }],
        model: "meta-llama/llama-4-maverick-17b-128e-instruct",
        temperature: 0.1,
        max_completion_tokens: 1500
      });

      let extractedDataText = response.choices[0]?.message?.content || '{}';
      
      try {
        const jsonMatch = extractedDataText.match(/\{[\s\S]*\}/);
        const extractedData = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
        
        const finalResumeData: ResumeData = {
          ...collectedData,
          experience: extractedData.experience?.length ? 
            extractedData.experience.map((exp: any) => ({
              ...exp,
              startDate: exp.startDate || 'Start Date',
              endDate: exp.endDate || 'Present'
            })) : collectedData.experience,
          education: extractedData.education?.length ? extractedData.education : collectedData.education,
          skills: [...new Set([...collectedData.skills, ...(extractedData.skills || [])])],
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
            <Brain className="w-6 h-6 text-blue-600" />
            Smart AI Interview
          </CardTitle>
          <Badge variant="outline" className="bg-white/70 text-blue-700 border-blue-200 px-4 py-1">
            {Math.round(completionProgress)}% complete
          </Badge>
        </div>
        
        <div className="space-y-3">
          <Progress value={completionProgress} className="h-3 bg-white/50" />
          
          <div className="flex gap-3 mt-4">
            {REQUIRED_SECTIONS.map((section) => {
              const hasData = section === 'experience' ? collectedData.experience.length > 0 :
                             section === 'education' ? collectedData.education.length > 0 :
                             collectedData.skills.length > 2;
              
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
      
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-6">
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
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="p-6 border-t bg-white">
          {!isInterviewComplete ? (
            <form onSubmit={handleSubmitResponse} className="flex space-x-3">
              <Input
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Share your experience..."
                disabled={isLoading}
                className="flex-1 h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl bg-white shadow-sm"
                autoFocus
              />
              <Button 
                type="submit" 
                disabled={isLoading || !userInput.trim()}
                className="h-12 px-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl shadow-md transition-all duration-200"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </Button>
            </form>
          ) : (
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-green-600 mb-3">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Interview Complete!</span>
              </div>
              <p className="text-gray-600 text-sm">Generating your professional resume...</p>
            </div>
          )}
        </div>
      </CardContent>
    </div>
  );
};

export default AIInterviewer;
