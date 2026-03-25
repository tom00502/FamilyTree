import { createBrowserRouter } from 'react-router';
import { LandingRoute } from './routes/landing-route';
import { SetupPage } from './routes/setup-page';
import { GamePage } from './routes/game-page';
import { ResultsPage } from './routes/results-page';
import { FamilyTreePage } from './routes/family-tree-page';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: LandingRoute,
  },
  {
    path: '/setup',
    Component: SetupPage,
  },
  {
    path: '/game',
    Component: GamePage,
  },
  {
    path: '/results',
    Component: ResultsPage,
  },
  {
    path: '/family-tree',
    Component: FamilyTreePage,
  },
  {
    path: '*',
    Component: LandingRoute, // 404 redirects to landing
  },
]);
