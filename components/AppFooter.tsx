import React from 'react';

export const AppFooter: React.FC = () => {
  return (
    <div className="text-center p-2 bg-gray-100">
      <p className="text-xs text-gray-500">
        Ứng dụng được phát triển bởi thầy{' '}
        <a
          href="https://www.facebook.com/kientrungkrn"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-blue-600 hover:underline"
        >
          Đoàn Kiên Trung
        </a>{' '}
        - Zalo: 0909629947
      </p>
    </div>
  );
};
