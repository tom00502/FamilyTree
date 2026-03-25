import { useState } from 'react';
import { useNavigate } from 'react-router';
import { PersonalInfoPage } from '../components/family-tree/pages/personal-info-page';
import { WaitingRoomPage } from '../components/family-tree/pages/waiting-room-page';

type SetupStep = 'personal-info' | 'waiting-room';

interface Player {
  name: string;
  completed: boolean;
}

export function SetupPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<SetupStep>('personal-info');
  const [players] = useState<Player[]>([
    { name: '王小明', completed: true },
    { name: '王小華', completed: true },
    { name: '王大明', completed: true }
  ]);

  const handlePersonalInfoSubmit = (data: { name: string; birthDate: string; gender: string }) => {
    console.log('Personal info:', data);
    setCurrentStep('waiting-room');
  };

  const handleStartGame = () => {
    navigate('/game');
  };

  const handleShareLink = () => {
    alert('分享連結到 LINE（功能示範）');
  };

  if (currentStep === 'personal-info') {
    return <PersonalInfoPage onNext={handlePersonalInfoSubmit} />;
  }

  return (
    <WaitingRoomPage
      players={players}
      onShareLink={handleShareLink}
      onStart={handleStartGame}
    />
  );
}
