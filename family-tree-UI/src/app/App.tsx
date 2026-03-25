import { RouterProvider } from 'react-router';
import { router } from './routes';

export default function App() {
  return (
    <div className="min-h-screen w-full max-w-[390px] mx-auto bg-[#FAF8F3]">
      <RouterProvider router={router} />
    </div>
  );
}
