import axios from 'axios';
import { Platform } from 'react-native';

// URL base por defecto para el backend NestJS (D:\TRABAJO\upea-token-service)
// Si se prueba en emulador Android: 10.0.2.2:3000, si es web/local: localhost:3000
const DEFAULT_API_URL = Platform.select({
  android: 'http://10.0.2.2:3000',
  ios: 'http://localhost:3000',
  default: 'http://localhost:3000',
});

export const api = axios.create({
  baseURL: DEFAULT_API_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface LoginDevicePayload {
  identificador_sistema: string;
  password: string;
  device_id: string;
}

export interface LoginDeviceResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    identificador_sistema: string;
    device_id: string;
    is_active: boolean;
    creado_en?: string;
    actualizado_en?: string;
  };
}

/**
 * Autentica y vincula el dispositivo en el backend UPEA Token Service (/api/auth/login-device).
 * Si la red o el servidor local no responde, permite simular la respuesta para pruebas de UI/UX.
 */
export async function authenticateDevice(
  payload: LoginDevicePayload,
  useSimulation: boolean = false
): Promise<LoginDeviceResponse> {
  if (useSimulation) {
    // Simulación de latencia de red y respuesta de alta seguridad
    await new Promise((resolve) => setTimeout(resolve, 1400));
    return {
      success: true,
      message: 'Dispositivo autenticado y vinculado criptográficamente con éxito',
      user: {
        id: 'usr-sim-998821a',
        identificador_sistema: payload.identificador_sistema,
        device_id: payload.device_id,
        is_active: true,
      },
    };
  }

  try {
    const response = await api.post<LoginDeviceResponse>('/api/auth/login-device', payload);
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    if (error.code === 'ECONNABORTED' || error.message.includes('Network Error')) {
      throw new Error(
        'No se pudo conectar al servidor UPEA Token Service en ' +
          DEFAULT_API_URL +
          '. Verifica que el backend esté corriendo o activa el modo Simulación.'
      );
    }
    throw new Error(error.message || 'Error de autenticación con el servidor');
  }
}
