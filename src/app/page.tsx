"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Toaster } from "@/components/ui/toaster";
import { generateInsights } from "@/ai/flows/generate-insights";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

const AIChatAvatar = () => {
  return (
    <Avatar className="w-8 h-8">
      <AvatarImage src="https://picsum.photos/200/200" alt="AI Chat Avatar" />
      <AvatarFallback>AI</AvatarFallback>
    </Avatar>
  );
};

const UserChatAvatar = () => {
  return (
    <Avatar className="w-8 h-8">
      <AvatarImage src="https://picsum.photos/200/200" alt="User Avatar" />
      <AvatarFallback>User</AvatarFallback>
    </Avatar>
  );
};

// Separate ChatPage component
const ChatPage = ({ userId }: { userId: string }) => {
  const [messages, setMessages] = useState<{ sender: 'user' | 'ai'; text: string; insights?: { themes: string[]; sentiment: string; summary: string; }; }[]>([]);
  const [input, setInput] = useState('');
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const chatContentRef = useRef<HTMLDivElement>(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessage = { sender: 'user', text: input };
    setMessages(prevMessages => [...prevMessages, newMessage]);
    setInput('');
  };

  useEffect(() => {
    const generateAiInsights = async () => {
      if (messages.length > 0 && messages[messages.length - 1].sender === 'user') {
        setIsLoadingInsights(true);
        const chatHistory = messages.map(m => `${m.sender}: ${m.text}`).join('\n');
        try {
          const insightsData = await generateInsights({ chatHistory });
          setMessages(prevMessages => {
            const updatedMessages = [...prevMessages];
            updatedMessages[prevMessages.length - 1] = { ...updatedMessages[prevMessages.length - 1], insights: insightsData };
            return updatedMessages;
          });
        } catch (error) {
          console.error("Error generating insights:", error);
        } finally {
          setIsLoadingInsights(false);
        }
      }
    };

    generateAiInsights();
  }, [messages]);


  useEffect(() => {
    // Scroll to bottom on new message
    if (chatContentRef.current) {
        chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Chat Interface */}
      <div className="flex-1 p-4">
        <Card className="h-full flex flex-col">
          <CardHeader className="py-4">
            <h2 className="text-lg font-semibold">실시간 채팅 ({userId}님)</h2>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto chat-content" ref={chatContentRef}>
            <ScrollArea className="h-full">
              {messages.map((message, index) => (
                <div key={index} className={`mb-2 flex flex-col items-start ${message.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`flex items-start ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {message.sender === 'ai' && <AIChatAvatar />}
                    <div className={`ml-2 rounded-lg p-3 w-fit max-w-[60%] ${message.sender === 'user' ? 'bg-secondary text-secondary-foreground' : 'bg-muted text-muted-foreground'}`}>
                      {message.text}
                    </div>
                    {message.sender === 'user' && <UserChatAvatar />}
                  </div>
                  {message.sender === 'user' && message.insights && (
                    <div className="text-xs text-gray-500 mt-1 w-full text-right">
                      <p>AI Insights:</p>
                      <p>테마: {message.insights.themes.join(', ')}</p>
                      <p>감정: {message.insights.sentiment}</p>
                      <p>요약: {message.insights.summary}</p>
                    </div>
                  )}
                  {isLoadingInsights && index === messages.length - 1 && <p>AI가 분석중입니다...</p>}
                </div>
              ))}
            </ScrollArea>
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
      <Toaster />
    </div>
  );
};

// Login Page
export default function Home() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const router = useRouter();

  const handleLogin = () => {
    if ((userId === 'surae1' && password === 'surae1') || (userId === 'surae2' && password === 'surae2')) {
      setLoggedIn(true);
      setError('');
    } else {
      setError('아이디 또는 비밀번호가 잘못되었습니다.');
    }
  };

  if (loggedIn) {
    return <ChatPage userId={userId} />;
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h2 className="text-lg font-semibold">로그인</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <p className="text-red-500">{error}</p>}
          <Input
            type="text"
            placeholder="사용자 아이디"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
          <Input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleLogin(); }}
          />
          <Button onClick={handleLogin}>로그인</Button>
        </CardContent>
      </Card>
      <Toaster />
    </div>
  );
}
