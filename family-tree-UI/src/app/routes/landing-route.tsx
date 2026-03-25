import { useState } from 'react';
import { useNavigate } from 'react-router';
import { LandingPage } from '../components/family-tree/pages/landing-page';

export function LandingRoute() {
  const navigate = useNavigate();

  const handleStart = (duration: number) => {
    console.log('Game duration:', duration);
    // 可以將 duration 存到 localStorage 或 context
    localStorage.setItem('gameDuration', duration.toString());
    navigate('/setup');
  };

  return <LandingPage onStart={handleStart} />;
}
