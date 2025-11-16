
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeMathjax from 'rehype-mathjax/browser';
import remarkGfm from 'remark-gfm';
import { type Message, Role } from '../types';
import { ScholarIcon, StudentIcon } from './IconComponents';

interface ChatMessageProps {
  message: Message;
}

const UserIcon: React.FC = () => (
    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0 overflow-hidden border-2 border-blue-200">
        <StudentIcon className="w-7 h-7 text-blue-500" />
    </div>
);

const ModelIcon: React.FC = () => (
    <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center shrink-0 overflow-hidden border-2 border-gray-300">
        <ScholarIcon className="w-7 h-7 text-gray-700" />
    </div>
);


export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === Role.USER;

  // Custom renderers to improve styling and functionality
  const renderers = {
    a: ({...props}) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline" />,
    table: ({...props}) => <div className="overflow-x-auto my-2"><table className="table-auto border-collapse border border-gray-400" {...props} /></div>,
    th: ({...props}) => <th className="border border-gray-400 px-3 py-1 bg-gray-200 text-gray-800 font-semibold" {...props} />,
    td: ({...props}) => <td className="border border-gray-400 px-3 py-1" {...props} />,
  };
  const modelRenderers = {
    ...renderers,
    a: ({...props}) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline" />,
  };


  return (
    <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && <ModelIcon />}
      <div className={`rounded-2xl p-4 max-w-2xl shadow-sm prose prose-sm prose-slate ${isUser ? 'bg-blue-500 text-white rounded-br-none prose-invert' : 'bg-white text-gray-800 rounded-bl-none'}`}>
        {message.parts.map((part, index) => {
            if ('inlineData' in part) {
                return <img key={index} src={`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`} alt="User upload" className="rounded-lg mb-2 max-w-xs not-prose" />;
            }
            return (
                <ReactMarkdown
                    key={index}
                    remarkPlugins={[remarkMath, remarkGfm]}
                    rehypePlugins={[rehypeMathjax]}
                    components={isUser ? renderers : modelRenderers}
                    className="markdown-content"
                >
                    {part.text}
                </ReactMarkdown>
            );
        })}
      </div>
      {isUser && <UserIcon />}
    </div>
  );
};
