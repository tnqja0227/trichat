"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { generateInsights } from "@/ai/flows/generate-insights";
import { Toaster } from "@/components/ui/toaster";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";

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
        title: "AI Insights Updated",
        description: "The AI has analyzed the chat and provided new insights.",
      });
    } catch (error: any) {
      console.error("Failed to generate insights:", error);
      setMessages(prevMessages => {
        const updatedMessages = [...prevMessages];
        const analyzingIndex = updatedMessages.findIndex(m => m.text === 'Analyzing chat...');
        if (analyzingIndex !== -1) {
          updatedMessages[analyzingIndex] = { sender: 'ai', text: 'Failed to analyze chat.' }; // Update the message
        }
        return updatedMessages;
      });
      toast({
        title: "AI Insights Failed",
        description: "Failed to generate AI insights. Please try again.",
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
            <h2 className="text-lg font-semibold">Live Chat</h2>
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
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
              />
              <Button onClick={handleSend}>Send</Button>
            </div>
          </div>
        </Card>
      </div>

      {/* AI Insights Panel */}
      <div className="w-96 p-4">
        <Card className="h-full">
          <CardHeader className="py-4">
            <h2 className="text-lg font-semibold">AI Insights</h2>
          </CardHeader>
          <CardContent className="overflow-y-auto">
            {insights ? (
              <>
                <div className="mb-4">
                  <h3 className="text-md font-semibold">Key Themes:</h3>
                  <ul>
                    {insights.themes.map((theme, index) => (
                      <li key={index} className="list-disc ml-4">{theme}</li>
                    ))}
                  </ul>
                </div>
                <div className="mb-4">
                  <h3 className="text-md font-semibold">Sentiment:</h3>
                  <p>{insights.sentiment}</p>
                </div>
                <div>
                  <h3 className="text-md font-semibold">Summary:</h3>
                  <p>{insights.summary}</p>
                </div>
              </>
            ) : (
              <p>No insights yet. Start chatting to see AI analysis.</p>
            )}
          </CardContent>
        </Card>
      </div>
      <Toaster />
    </div>
  );
}
