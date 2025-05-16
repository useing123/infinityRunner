import React from 'react';
import Game from './components/Game';
import UI from './components/ui/UI';

function App() {
  return (
    <div className="h-screen w-screen overflow-hidden relative bg-gray-900">
      <Game />
      <UI />
    </div>
  );
}

export default App;