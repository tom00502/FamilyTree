import { RouterProvider } from 'react-router';
import { router } from './routes';
import { GameProvider } from './context/GameContext';

export default function App() {
  return (
    <GameProvider>
      <div className="min-h-screen w-full max-w-[390px] mx-auto bg-[#FAF8F3]">
        <RouterProvider router={router} />
      </div>
    </GameProvider>
  );
}
