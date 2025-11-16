
import React from 'react';
import { ScholarIcon } from './IconComponents';

export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md p-4 flex items-center space-x-4 sticky top-0 z-10">
        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center p-1">
            <ScholarIcon className="h-10 w-10 text-white" />
        </div>
        <div>
            <h1 className="text-xl font-bold text-blue-600">Ông Giáo Biết Tuốt</h1>
            <p className="text-sm text-gray-500">Gia sư AI đồng hành cùng bạn</p>
        </div>
    </header>
  );
};
