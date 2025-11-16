import React, { useState, useRef, ChangeEvent, KeyboardEvent, ClipboardEvent } from 'react';
import { PaperclipIcon, SendIcon, XIcon, FileIcon } from './IconComponents';

interface ChatInputProps {
  onSendMessage: (text: string, file: File | null) => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [text, setText] = useState('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setAttachedFile(file);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreviewUrl(null); // Not an image, no URL preview
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLTextAreaElement>) => {
    const items = event.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
            const file = items[i].getAsFile();
            if (file) {
                event.preventDefault();
                processFile(file);
                break;
            }
        }
    }
  };

  const removeFile = () => {
    setAttachedFile(null);
    setFilePreviewUrl(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleSend = () => {
    if ((text.trim() || attachedFile) && !isLoading) {
      onSendMessage(text, attachedFile);
      setText('');
      removeFile();
    }
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
       {attachedFile && (
          <div className="p-2 relative w-max max-w-full bg-gray-200 rounded-lg mb-2">
              <div className="flex items-center space-x-2">
                {filePreviewUrl ? (
                  <img src={filePreviewUrl} alt="Preview" className="rounded-lg object-cover h-20 w-20" />
                ) : (
                  <div className="flex items-center space-x-2 p-2">
                    <FileIcon className="w-8 h-8 text-gray-600 shrink-0" />
                    <span className="text-sm text-gray-800 break-all">{attachedFile.name}</span>
                  </div>
                )}
              </div>
              <button onClick={removeFile} className="absolute top-0 right-0 bg-gray-700 text-white rounded-full p-1 -mt-2 -mr-2 hover:bg-red-500 transition-colors">
                  <XIcon className="w-4 h-4" />
              </button>
          </div>
        )}
      <div className="flex items-end bg-gray-100 rounded-xl p-2 border border-gray-300 focus-within:ring-2 focus-within:ring-blue-500 transition-shadow">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-gray-500 hover:text-blue-600 rounded-full transition-colors"
          aria-label="Attach file"
        >
          <PaperclipIcon className="w-6 h-6" />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/png, image/jpeg, image/webp, application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={handleKeyPress}
          onPaste={handlePaste}
          placeholder="Hỏi 'Ông Giáo' một câu..."
          className="flex-1 bg-transparent border-none focus:ring-0 resize-none p-2 text-base outline-none"
          rows={1}
          style={{maxHeight: '150px'}}
        />
        <button
          onClick={handleSend}
          disabled={isLoading || (!text.trim() && !attachedFile)}
          className="p-2 rounded-full text-white bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          aria-label="Send message"
        >
          <SendIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};