import './global.css';
import React, { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LoginScreen from './screens/LoginScreen';
import TokenScreen from './screens/TokenScreen';

interface ActiveSession {
  identificadorSistema: string;
  deviceId: string;
  simulationMode: boolean;
}

export default function App() {
  const [session, setSession] = useState<ActiveSession | null>(null);

  return (
    <SafeAreaProvider>
      {session ? (
        <TokenScreen
          identificadorSistema={session.identificadorSistema}
          initialSimulationMode={session.simulationMode}
          onLogout={() => setSession(null)}
        />
      ) : (
        <LoginScreen
          onSuccess={(data) => {
            setSession({
              identificadorSistema: data.identificador_sistema,
              deviceId: data.device_id,
              simulationMode: data.simulationMode,
            });
          }}
        />
      )}
    </SafeAreaProvider>
  );
}
