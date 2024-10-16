"use client";

import { useEffect, useState } from 'react';

const HomePage = ({ session }) => {
  const [text, setText] = useState('');

  useEffect(() => {
    const username = session?.user?.name || "User"; 
    const fullText = `Welcome, ${username}`;
    let index = 0;

    const typingEffect = setInterval(() => {
      if (index < fullText.length) {
        setText(prev => prev + fullText.charAt(index));
        index++;
      } else {
        clearInterval(typingEffect);
      }
    }, 100);

    return () => clearInterval(typingEffect);
  }, [session]);

  return (
    <div className="flex flex-col h-screen justify-center items-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold tracking-wider bg-gradient-to-r from-purple-600 via-pink-500 to-blue-400 bg-clip-text text-transparent border-r-4 border-white whitespace-nowrap overflow-hidden inline-block animate-typing">
          {text}
        </h1>
      </div>
      <div className="mt-5">
        <button className="px-6 py-3 text-lg font-bold text-white bg-green-500 rounded transition-transform transform hover:bg-green-600 hover:scale-105">
          Upload
        </button>
      </div>
    </div>
  );
};

export default HomePage;
