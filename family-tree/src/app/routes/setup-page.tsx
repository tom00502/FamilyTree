import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { PersonalInfoPage } from '../components/family-tree/pages/personal-info-page';
import { WaitingRoomPage } from '../components/family-tree/pages/waiting-room-page';
import { useGame } from '../context/GameContext';

type SetupStep = 'personal-info' | 'waiting-room';

export function SetupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    roomCode, isHost, members, sendMsg,
    setMode, setDuration, duration, gameStarted, connected, setUserName,
    lastError, clearError
  } = useGame();

  const [currentStep, setCurrentStep] = useState<SetupStep>('personal-info');
  const [pending, setPending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const urlRoom = searchParams.get('room');

  useEffect(() => {
    if (urlRoom) {
      setMode('join');
    } else {
      setMode('create');
      const d = localStorage.getItem('gameDuration');
      if (d) setDuration(parseInt(d, 10));
    }
  }, [urlRoom, setMode, setDuration]);

  useEffect(() => {
    if (gameStarted) {
      navigate('/game');
    }
  }, [gameStarted, navigate]);

  // When room is confirmed by server, advance to waiting room
  useEffect(() => {
    if (pending && roomCode) {
      setPending(false);
      setCurrentStep('waiting-room');
    }
  }, [pending, roomCode]);

  // When server sends an error while we were pending, go back to the form
  useEffect(() => {
    if (pending && lastError) {
      setErrorMsg(lastError);
      clearError();
      setPending(false);
      // Stay on personal-info step
    }
  }, [pending, lastError, clearError]);

  const handlePersonalInfoSubmit = (data: { name: string; birthDate: string; gender: string }) => {
    if (!connected) {
      setErrorMsg('尚未連接至伺服器，請稍後再試');
      return;
    }

    setUserName(data.name);
    setErrorMsg(null);
    setPending(true); // Wait for server confirmation

    if (urlRoom) {
      sendMsg({
        action: 'join_room',
        roomCode: urlRoom,
        name: data.name,
        birthday: data.birthDate
      });
    } else {
      sendMsg({
        action: 'create_room',
        name: data.name,
        birthday: data.birthDate,
        duration: duration
      });
    }
    // ❌ Do NOT setCurrentStep here — wait for server confirmation
  };

  const handleStartGame = () => {
    if (isHost && roomCode) {
      sendMsg({ action: 'start_game', roomCode });
    }
  };

  const handleShareLink = () => {
    const url = `${window.location.origin}/setup?room=${roomCode}`;
    navigator.clipboard.writeText(url).then(() => {
      alert('已複製分享連結：\n' + url);
    });
  };

  if (currentStep === 'personal-info') {
    return (
      <PersonalInfoPage
        onNext={handlePersonalInfoSubmit}
        isLoading={pending}
        errorMessage={errorMsg}
      />
    );
  }

  const mappedPlayers = members.map(m => ({
    name: m.name,
    completed: true
  }));

  return (
    <WaitingRoomPage
      roomCode={roomCode || ''}
      players={mappedPlayers}
      onShareLink={handleShareLink}
      onStart={handleStartGame}
    />
  );
}
