import { CommunicationEvents } from '~~/constants/socketEvents';
import { useWebsocket } from '~~/stores/useWebsocket';

export function useSignaling() {
  const socketStore = useWebsocket();

  const signalMediaStateChanged = (producerId: string, state: 'on' | 'off') => {
    socketStore.socket!.emit(CommunicationEvents.MEDIA_STATE_CHANGED, {
      producerId,
      state,
    });
  };

  const signalStopSharing = (displayProducerId: string) => {
    socketStore.socket!.emit(
      CommunicationEvents.STOP_SHARING,
      displayProducerId,
    );
  };

  const signalStopSession = () => {
    socketStore.socket!.emit('stop-session');
  };

  const signalStartTimer = (timerDuration: number, roomId: string) => {
    socketStore.socket!.emit('start-timer', { timerDuration, roomId });
  };

  return {
    signalMediaStateChanged,
    signalStopSharing,
    signalStopSession,
    signalStartTimer,
  };
}
