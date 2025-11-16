import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { ChatInput } from './components/ChatInput';
import { ChatMessage } from './components/ChatMessage';
import { Spinner } from './components/Spinner';
import { AppFooter } from './components/AppFooter';
import { type Message, Role } from './types';
import { generateResponse } from './services/geminiService';
import { readFileContent } from './services/fileReaderService';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: Role.MODEL,
      parts: [{ text: "Xin chào! Thầy là 'Ông Giáo Biết Tuốt', gia sư AI của em. Để thầy có thể hỗ trợ tốt nhất, em cho thầy biết tên và em đang học lớp mấy nhé?" }],
    },
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
    // After new messages are rendered, tell MathJax to typeset them.
    if ((window as any).MathJax?.typesetPromise) {
      (window as any).MathJax.typesetPromise();
    }
  }, [messages]);

  const handleSendMessage = useCallback(async (text: string, file: File | null) => {
    if (!text.trim() && !file) return;

    setIsLoading(true);

    const userTextPart = text.trim() ? [{ text: text.trim() }] : [];

    if (file) {
        // Create a message for the UI immediately
        const userMessageForUi: Message = {
            role: Role.USER,
            parts: [
                ...userTextPart,
                // For images, we will show the preview directly
                // For other files, we just show the name
                ...(file.type.startsWith('image/') ? [] : [{ text: `\n\n*Đang đọc nội dung từ tệp: ${file.name}*` }])
            ]
        };

        try {
            if (file.type.startsWith('image/')) {
                const base64Image = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = () => resolve((reader.result as string).split(',')[1]);
                    reader.onerror = error => reject(error);
                });

                userMessageForUi.parts.push({
                    inlineData: { mimeType: file.type, data: base64Image }
                });
                setMessages(prev => [...prev, userMessageForUi]);
                await fetchBotResponse(userMessageForUi);

            } else { // Handle PDF, DOCX, etc.
                setMessages(prev => [...prev, userMessageForUi]);
                const fileContent = await readFileContent(file);
                
                const userMessageForApi: Message = {
                    role: Role.USER,
                    parts: [
                        ...userTextPart,
                        { text: `\n\n[Bắt đầu nội dung từ tệp "${file.name}"]\n\n${fileContent}\n\n[Kết thúc nội dung từ tệp]` }
                    ]
                };
                await fetchBotResponse(userMessageForApi);
            }
        } catch (error) {
            console.error('Error processing file:', error);
            const errorMessage: Message = {
                role: Role.MODEL,
                parts: [{ text: `Rất tiếc, đã có lỗi xảy ra khi đọc tệp "${file.name}". Có thể tệp bị hỏng hoặc không được hỗ trợ. Em vui lòng thử lại với tệp khác nhé.` }],
            };
            setMessages(prev => [...prev, errorMessage]);
            setIsLoading(false);
        }
    } else { // Text only message
        const newUserMessage: Message = {
            role: Role.USER,
            parts: userTextPart,
        };
        setMessages(prev => [...prev, newUserMessage]);
        await fetchBotResponse(newUserMessage);
    }
  }, [messages]);

  const fetchBotResponse = async (newUserMessage: Message) => {
      try {
        // We pass the full history including the latest user message
        const history = [...messages, newUserMessage];
        const botResponse = await generateResponse(history.slice(0, -1), newUserMessage); // Pass history and new message separately
        setMessages(prev => [...prev, botResponse]);
      } catch (error) {
        console.error("Failed to get response from Gemini:", error);
        const errorMessage: Message = {
          role: Role.MODEL,
          parts: [{ text: "Rất tiếc, đã có lỗi xảy ra. Em vui lòng thử lại sau nhé." }],
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
  };


  return (
    <div className="flex flex-col h-screen bg-gray-100 text-gray-800">
      <Header />
      <main ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.map((msg, index) => (
          <ChatMessage key={index} message={msg} />
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-bl-none p-4 max-w-lg shadow-sm">
                <Spinner />
            </div>
          </div>
        )}
      </main>
      <footer className="bg-white border-t border-gray-200 sticky bottom-0">
        <div className="p-2 md:p-4">
          <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
        <AppFooter />
      </footer>
    </div>
  );
};

export default App;