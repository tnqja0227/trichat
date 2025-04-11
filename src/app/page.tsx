"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { generateInsights } from "@/ai/flows/generate-insights";
import { Toaster } from "@/components/ui/toaster";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

const AIChatAvatar = () => {
  return (
    <Avatar>
      <AvatarImage src="https://picsum.photos/200/200" alt="AI Chat"/>
      <AvatarFallback>AI</AvatarFallback>
    </Avatar>
  );
};

const UserAvatar = () => {
  return (
    <Avatar>
      <AvatarImage src="https://picsum.photos/200/200" alt="User"/>
      <AvatarFallback>U</AvatarFallback>
    </Avatar>
  );
};

export default function Home() {
  const [messages, setMessages] = useState<{ sender: 'user' | 'ai'; text: string; }[]>([]);
  const [input, setInput] = useState('');
  const [insights, setInsights] = useState<{ themes: string[]; sentiment: string; summary: string; } | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();


  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessage = { sender: 'user', text: input };
    setMessages(prevMessages => [...prevMessages, newMessage]);
    setInput('');

    // Optimistically update the UI
    setMessages(prevMessages => [...prevMessages, { sender: 'ai', text: 'Analyzing chat...' }]);

    try {
      // Construct the full chat history string
      const chatHistory = [...messages, newMessage].map(m => `${m.sender}: ${m.text}`).join('\n');

      const aiInsights = await generateInsights({ chatHistory });

      // Replace the "Analyzing chat..." message with actual insights
      setMessages(prevMessages => {
        const updatedMessages = [...prevMessages];
        const analyzingIndex = updatedMessages.findIndex(m => m.text === 'Analyzing chat...');
        if (analyzingIndex !== -1) {
          updatedMessages.splice(analyzingIndex, 1); // Remove the "Analyzing chat..." message
        }
        return updatedMessages;
      });

      setInsights(aiInsights);
      toast({
        title: "AI 인사이트 업데이트",
        description: "AI가 채팅을 분석하여 새로운 인사이트를 제공합니다.",
      });
    } catch (error: any) {
      console.error("Failed to generate insights:", error);
      setMessages(prevMessages => {
        const updatedMessages = [...prevMessages];
        const analyzingIndex = updatedMessages.findIndex(m => m.text === 'Analyzing chat...');
        if (analyzingIndex !== -1) {
          updatedMessages[analyzingIndex] = { sender: 'ai', text: '채팅 분석 실패.' }; // Update the message
        }
        return updatedMessages;
      });
      toast({
        title: "AI 인사이트 실패",
        description: "AI 인사이트 생성에 실패했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Chat Interface */}
      <div className="flex-1 p-4">
        <Card className="h-full flex flex-col">
          <CardHeader className="py-4">
            <h2 className="text-lg font-semibold">실시간 채팅</h2>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto" ref={chatContainerRef}>
            {messages.map((message, index) => (
              <div key={index} className={`mb-2 flex items-start ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.sender === 'ai' ? <AIChatAvatar /> : <UserAvatar />}
                <div className={`ml-2 rounded-lg p-3 w-fit max-w-[60%] ${message.sender === 'user' ? 'bg-secondary text-secondary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  {message.text}
                </div>
              </div>
            ))}
          </CardContent>
          <div className="p-4">
            <div className="flex items-center space-x-2">
              <Input
                type="text"
                placeholder="메시지를 입력하세요..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
              />
              <Button onClick={handleSend}>보내기</Button>
            </div>
          </div>
        </Card>
      </div>

      {/* AI Insights Panel */}
      <div className="w-96 p-4">
        <Card className="h-full">
          <CardHeader className="py-4">
            <h2 className="text-lg font-semibold">AI 인사이트</h2>
          </CardHeader>
          <CardContent className="overflow-y-auto">
            {insights ? (
              <>
                <div className="mb-4">
                  <h3 className="text-md font-semibold">주요 테마:</h3>
                  <ul>
                    {insights.themes.map((theme, index) => (
                      <li key={index} className="list-disc ml-4">{theme}</li>
                    ))}
                  </ul>
                </div>
                <div className="mb-4">
                  <h3 className="text-md font-semibold">감정:</h3>
                  <p>{insights.sentiment}</p>
                </div>
                <div>
                  <h3 className="text-md font-semibold">요약:</h3>
                  <p>{insights.summary}</p>
                </div>
              </>
            ) : (
              <p>아직 인사이트가 없습니다. 채팅을 시작하여 AI 분석을 확인하세요.</p>
            )}
          </CardContent>
        </Card>
      </div>
      <Toaster />
    </div>
  );
}
