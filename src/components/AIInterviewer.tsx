
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, User, Bot } from 'lucide-react';
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
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const groq = new Groq({
    apiKey: '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',
    dangerouslyAllowBrowser: true
  });

  useEffect(() => {
    startInterview();
  }, []);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, currentResponse]);

  const startInterview = async () => {
    const welcomeMessage: AIMessage = {
      role: 'assistant',
      content: `Hello ${initialData.personalInfo.name || 'there'}! I'm your AI resume consultant. I'll be asking you a series of personalized questions to create an outstanding resume for your target role as a ${initialData.targetRole}. Let's start with your background - could you tell me about your current or most recent work experience?`,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  };

  const generateNextQuestion = async (conversationHistory: AIMessage[]) => {
    try {
      setIsLoading(true);
      setCurrentResponse('');

      const systemPrompt = `You are an expert resume consultant conducting an interview to gather comprehensive information for creating a professional resume. 

Current resume data collected:
- Name: ${collectedData.personalInfo.name}
- Target Role: ${collectedData.targetRole}
- Style Preference: ${collectedData.style}
- Questions asked so far: ${questionCount}

Your job is to:
1. Ask intelligent, relevant questions based on what hasn't been covered yet
2. Adapt questions based on their target role (${collectedData.targetRole})
3. If you've asked 8-12 comprehensive questions, suggest wrapping up
4. Focus on: work experience, education, skills, projects, achievements, certifications

Keep questions conversational and specific. Avoid generic questions. If they mention something interesting, ask follow-up questions.

Current conversation context: ${conversationHistory.slice(-4).map(m => `${m.role}: ${m.content}`).join('\n')}`;

      const messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.slice(-6).map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      ];

      const chatCompletion = await groq.chat.completions.create({
        messages: messages as any,
        model: "deepseek-r1-distill-llama-70b",
        temperature: 0.7,
        max_completion_tokens: 300,
        top_p: 0.95,
        stream: true,
        stop: null
      });

      let fullResponse = '';
      for await (const chunk of chatCompletion) {
        const content = chunk.choices[0]?.delta?.content || '';
        fullResponse += content;
        setCurrentResponse(fullResponse);
      }

      const aiMessage: AIMessage = {
        role: 'assistant',
        content: fullResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      setQuestionCount(prev => prev + 1);

    } catch (error) {
      console.error('Error generating question:', error);
      toast({
        title: "Error",
        description: "Failed to generate the next question. Please try again.",
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

    // Process and store the user's response
    await processUserResponse(userInput.trim());

    // Generate next question or complete if we have enough information
    if (questionCount >= 8) {
      // Check if we should wrap up
      const shouldContinue = await shouldContinueInterview(updatedMessages);
      if (!shouldContinue) {
        completeInterview();
        return;
      }
    }

    await generateNextQuestion(updatedMessages);
  };

  const processUserResponse = async (response: string) => {
    // Simple keyword-based processing - in a real app, you'd use more sophisticated NLP
    const lowerResponse = response.toLowerCase();
    
    // Extract potential information and update collectedData
    // This is a simplified version - you could make this much more sophisticated
    setCollectedData(prev => ({
      ...prev,
      // Add logic to extract and categorize information from the response
    }));
  };

  const shouldContinueInterview = async (conversationHistory: AIMessage[]): Promise<boolean> => {
    try {
      const prompt = `Based on this interview conversation, do we have enough information to create a comprehensive resume? Consider: work experience, education, skills, projects, achievements. Answer only 'CONTINUE' or 'COMPLETE'.

Conversation: ${conversationHistory.slice(-8).map(m => `${m.role}: ${m.content}`).join('\n')}`;

      const response = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: "deepseek-r1-distill-llama-70b",
        temperature: 0.3,
        max_completion_tokens: 10
      });

      return response.choices[0]?.message?.content?.includes('CONTINUE') || false;
    } catch (error) {
      console.error('Error checking interview completion:', error);
      return questionCount < 12; // Fallback to question count
    }
  };

  const completeInterview = async () => {
    try {
      setIsLoading(true);
      
      // Generate final resume data from conversation
      const conversationText = messages.map(m => `${m.role}: ${m.content}`).join('\n');
      
      const dataExtractionPrompt = `Extract structured resume data from this interview conversation. Return a JSON object with the following structure:
      {
        "personalInfo": {"name": "", "email": "", "phone": "", "location": "", "linkedin": "", "github": ""},
        "experience": [{"company": "", "position": "", "startDate": "", "endDate": "", "description": [""], "location": ""}],
        "education": [{"institution": "", "degree": "", "field": "", "graduationDate": "", "gpa": "", "honors": [""]}],
        "skills": [""],
        "projects": [{"name": "", "description": "", "technologies": [""], "highlights": [""]}],
        "achievements": [""]
      }

      Conversation: ${conversationText}

      Extract only factual information mentioned in the conversation. Use the person's name and target role provided at the start.`;

      const response = await groq.chat.completions.create({
        messages: [{ role: 'user', content: dataExtractionPrompt }],
        model: "deepseek-r1-distill-llama-70b",
        temperature: 0.3,
        max_completion_tokens: 2000
      });

      const extractedDataText = response.choices[0]?.message?.content || '{}';
      
      try {
        // Extract JSON from the response
        const jsonMatch = extractedDataText.match(/\{[\s\S]*\}/);
        const extractedData = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
        
        const finalResumeData: ResumeData = {
          ...collectedData,
          personalInfo: { ...collectedData.personalInfo, ...extractedData.personalInfo },
          experience: extractedData.experience || [],
          education: extractedData.education || [],
          skills: extractedData.skills || [],
          projects: extractedData.projects || [],
          achievements: extractedData.achievements || []
        };

        console.log('Final resume data:', finalResumeData);
        onComplete(finalResumeData);
      } catch (parseError) {
        console.error('Error parsing extracted data:', parseError);
        // Fallback to collected data
        onComplete(collectedData);
      }

    } catch (error) {
      console.error('Error completing interview:', error);
      toast({
        title: "Error",
        description: "Failed to process interview data. Using collected information.",
        variant: "destructive"
      });
      onComplete(collectedData);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="text-xl">AI Resume Interview</CardTitle>
        <div className="text-sm text-gray-600">
          Question {questionCount} • Target Role: {initialData.targetRole}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        <ScrollArea className="flex-1 pr-4 mb-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div key={index} className={`flex items-start space-x-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                <div className={`flex items-start space-x-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${message.role === 'assistant' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                    {message.role === 'assistant' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  <div className={`rounded-lg p-3 ${message.role === 'assistant' ? 'bg-blue-50 text-blue-900' : 'bg-gray-100 text-gray-900'}`}>
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <div className="text-xs text-gray-500 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {currentResponse && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-blue-50 text-blue-900 rounded-lg p-3 max-w-[80%]">
                  <p className="text-sm leading-relaxed">{currentResponse}</p>
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin mt-2" />}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <form onSubmit={handleSubmitResponse} className="flex space-x-2">
          <Input
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type your response here..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !userInput.trim()}>
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </form>

        {questionCount >= 8 && (
          <div className="mt-4 text-center">
            <Button 
              onClick={completeInterview} 
              variant="outline"
              disabled={isLoading}
              className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
            >
              Complete Interview & Generate Resume
            </Button>
          </div>
        )}
      </CardContent>
    </div>
  );
};

export default AIInterviewer;
