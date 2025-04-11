"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Toaster } from "@/components/ui/toaster";

// Separate ChatPage component
const ChatPage = ({ userId }: { userId: string }) => {
  const [messages, setMessages] = useState<{ sender: 'user' | 'ai'; text: string; }[]>([]);
  const [input, setInput] = useState('');

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessage = { sender: 'user', text: input };
    setMessages(prevMessages => [...prevMessages, newMessage]);
    setInput('');

    // TODO: Implement AI Chat Analysis here
    // Construct the full chat history string
    //const chatHistory = [...messages, newMessage].map(m => `${m.sender}: ${m.text}`).join('\n');
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Chat Interface */}
      <div className="flex-1 p-4">
        <Card className="h-full flex flex-col">
          <CardHeader className="py-4">
            <h2 className="text-lg font-semibold">실시간 채팅 ({userId}님)</h2>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto">
            {messages.map((message, index) => (
              <div key={index} className={`mb-2 flex items-start ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
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
            <h2 className="text-lg font-semibold">AI 인사이트 (준비중...)</h2>
          </CardHeader>
          <CardContent className="overflow-y-auto">
            <p>아직 인사이트가 없습니다. 채팅을 시작하여 AI 분석을 확인하세요.</p>
          </CardContent>
        </Card>
      </div>
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
      <Card className="w-96">
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
