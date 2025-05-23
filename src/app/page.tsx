"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Toaster } from "@/components/ui/toaster";
import { generateInsights } from "@/ai/flows/generate-insights";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

const AIChatAvatar: React.FC = () => {
  return (
    <Avatar className="w-8 h-8">
      <AvatarImage src="https://picsum.photos/200/200" alt="AI Chat Avatar" />
      <AvatarFallback>AI</AvatarFallback>
    </Avatar>
  );
};

const UserChatAvatar: React.FC = () => {
  return (
    <Avatar className="w-8 h-8">
      <AvatarImage src="https://picsum.photos/200/200" alt="User Avatar" />
      <AvatarFallback>User</AvatarFallback>
    </Avatar>
  );
};

type Message = {
  sender: "surae1" | "surae2" | "ai";
  text: string;
  insights?: {
    themes: string[];
    sentiment: string;
    summary: string;
  };
};

const ChatPage: React.FC<{ userId: string }> = ({ userId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [isLoadingInsights, setIsLoadingInsights] = useState<boolean>(false);
  const chatContentRef = useRef<HTMLDivElement>(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessage: Message = { sender: userId as "surae1" | "surae2", text: input };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInput("");

    if (input.endsWith("(AI)")) {
      generateAiInsights(input);
    }
  };

  const generateAiInsights = async (message: string) => {
    setIsLoadingInsights(true);
    try {
      const insightsData = await generateInsights({ chatHistory: message });
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages];
        for (let i = updatedMessages.length - 1; i >= 0; i--) {
          if (updatedMessages[i].sender === "surae1" || updatedMessages[i].sender === "surae2") {
            updatedMessages[i] = { ...updatedMessages[i], insights: insightsData };
            break;
          }
        }
        return updatedMessages;
      });
    } catch (error) {
      console.error("Error generating insights:", error);
    } finally {
      setIsLoadingInsights(false);
    }
  };

  useEffect(() => {
    if (chatContentRef.current) {
      chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const storedChatHistory = localStorage.getItem(`chatHistory_${userId}`);
    if (storedChatHistory) {
      setMessages(JSON.parse(storedChatHistory));
    }
  }, [userId]);

  useEffect(() => {
    localStorage.setItem(`chatHistory_${userId}`, JSON.stringify(messages));
  }, [messages, userId]);

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex-1 p-4">
        <Card className="h-full flex flex-col">
          <CardHeader className="py-4">
            <h2 className="text-lg font-semibold">실시간 채팅 ({userId}님)</h2>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto chat-content" ref={chatContentRef}>
            <ScrollArea className="h-full">
              {messages.map((message, index) => {
                const isUserMessage = message.sender === "surae1" || message.sender === "surae2";

                return (
                  <div
                    key={index}
                    className={`mb-2 flex flex-col ${isUserMessage ? "items-end" : "items-start"}`}
                  >
                    <div className={`flex items-start ${isUserMessage ? "justify-end" : "justify-start"}`}>
                      {message.sender === "ai" && <AIChatAvatar />}
                      <div
                        className={`ml-2 rounded-lg p-3 w-fit max-w-[60%] ${
                          isUserMessage
                            ? "bg-secondary text-secondary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {message.text}
                      </div>
                      {isUserMessage && <UserChatAvatar />}
                    </div>
                    {isUserMessage && message.insights && (
                      <div className="text-xs text-gray-500 mt-1 w-full text-right">
                        <p>AI Insights:</p>
                        <p>테마: {message.insights.themes.join(", ")}</p>
                        <p>감정: {message.insights.sentiment}</p>
                        <p>요약: {message.insights.summary}</p>
                      </div>
                    )}
                    {isLoadingInsights && index === messages.length - 1 && <p>AI가 분석중입니다...</p>}
                  </div>
                );
              })}
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

  // Test function to check chat history
  const runChatHistoryTest = async () => {
    // Log in as surae1
    setUserId('surae1');
    setPassword('surae1');
    handleLogin();

    // Wait for login to complete
    await new Promise(resolve => setTimeout(resolve, 500));

    // Add a test message
    const testMessage = 'This is a test message.';
    localStorage.setItem('testMessage', testMessage); // Set test message

    // Log out
    setLoggedIn(false);
    setUserId('');
    setPassword('');

    // Log back in as surae1
    await new Promise(resolve => setTimeout(resolve, 500));

    setUserId('surae1');
    setPassword('surae1');
    handleLogin();

    // Wait for login and chat history load
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if the test message is present in the loaded messages
    const storedChatHistory = localStorage.getItem(`chatHistory_surae1`);
    if (storedChatHistory) {
      const messages = JSON.parse(storedChatHistory);
      const testMessageFromStorage = localStorage.getItem('testMessage'); // Get test message

      // Check if the test message exists in the messages
      const messageFound = messages.some((message: any) => message.text === testMessageFromStorage); // Check with testMessageFromStorage

      if (messageFound) {
        alert('Chat history test passed!');
      } else {
        alert('Chat history test failed: Test message not found.');
      }
    } else {
      alert('Chat history test failed: No chat history found.');
    }

    localStorage.removeItem('testMessage'); // Remove test message
  };

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
      setLoggedIn(true); // Auto-login if userId is found
    }
  }, []);

  useEffect(() => {
    if (loggedIn) {
      localStorage.setItem('userId', userId);
    } else {
      localStorage.removeItem('userId');
    }
  }, [loggedIn, userId]);
  

  if (loggedIn) {
    return (
        <>
          <ChatPage userId={userId} />
          <Button onClick={runChatHistoryTest}>Run Chat History Test</Button>
        </>
    );
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
            onChange={(e) => setUserId(e.target.value.trim())}
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
