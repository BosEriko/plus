import { WebSocketProvider } from '@hooks/useWebsocket';

export default function MusicQueueWidgetLayout({ children }) {
  return (
    <WebSocketProvider>{children}</WebSocketProvider>
  );
}
