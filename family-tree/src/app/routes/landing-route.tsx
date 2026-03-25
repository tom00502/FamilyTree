
import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { LandingPage } from '../components/family-tree/pages/landing-page';
import { useGame } from '../context/GameContext';

export function LandingRoute() {
  const navigate = useNavigate();
  const { sendMsg, roomCheckResult, clearRoomCheck } = useGame();

  useEffect(() => {
    if (!roomCheckResult) return;

    if (roomCheckResult.ok && roomCheckResult.roomCode) {
      clearRoomCheck();
      navigate(`/setup?room=${roomCheckResult.roomCode}`);
    } else {
      // Error is shown in LandingPage — don't clear yet; LandingPage reads it
    }
  }, [roomCheckResult, clearRoomCheck, navigate]);

  const handleStart = (duration: number) => {
    localStorage.setItem('gameDuration', duration.toString());
    navigate('/setup');
  };

  const handleJoin = (roomCode: string) => {
    // Send check_room and wait for room_check_result in the effect above
    clearRoomCheck();
    sendMsg({ action: 'check_room', roomCode });
  };

  return (
    <LandingPage
      onStart={handleStart}
      onJoin={handleJoin}
      joinError={roomCheckResult && !roomCheckResult.ok ? (roomCheckResult.reason ?? '房間無效') : null}
      onClearJoinError={clearRoomCheck}
    />
  );
}
