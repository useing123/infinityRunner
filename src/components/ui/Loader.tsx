import React from 'react';
import { Html } from '@react-three/drei';

const Loader: React.FC = () => {
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-t-indigo-500 border-r-transparent border-b-indigo-500 border-l-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-white text-lg">Loading game assets...</p>
      </div>
    </Html>
  );
};

export default Loader;