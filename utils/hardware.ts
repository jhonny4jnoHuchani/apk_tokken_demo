import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import * as Application from 'expo-application';
import * as Device from 'expo-device';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

const STORAGE_KEY_DEVICE_ID = 'upea_device_binding_id';

export interface DeviceHardwareInfo {
  deviceId: string;
  brand: string;
  modelName: string;
  osName: string;
  osVersion: string;
  isPhysical: boolean;
  platform: 'android' | 'ios' | 'web' | 'other';
  deviceFingerprint: string;
}

/**
 * Obtiene o inicializa de forma segura y persistente el identificador único del hardware (Device Binding UUID).
 * Utiliza los identificadores nativos del hardware en Android (ANDROID_ID) e iOS (IDFV).
 * Si no está disponible (ej. simulador, web), genera un UUID criptográfico persistido en SecureStore.
 */
export async function getDeviceHardwareId(): Promise<string> {
  try {
    // 1. Intentar recuperar ID previamente vinculado y cacheado en SecureStore
    if (Platform.OS !== 'web') {
      const storedId = await SecureStore.getItemAsync(STORAGE_KEY_DEVICE_ID);
      if (storedId) {
        return storedId;
      }
    }

    let hardwareId: string | null = null;

    // 2. Extraer identificador de hardware nativo según la plataforma
    if (Platform.OS === 'android') {
      try {
        hardwareId = Application.getAndroidId();
      } catch (err) {
        console.warn('[Hardware] Error obteniendo AndroidId:', err);
      }
    } else if (Platform.OS === 'ios') {
      try {
        hardwareId = await Application.getIosIdForVendorAsync();
      } catch (err) {
        console.warn('[Hardware] Error obteniendo iOS IDFV:', err);
      }
    }

    // 3. Si no hay ID nativo disponible (emuladores/web/permiso), generar UUID criptográfico
    if (!hardwareId || hardwareId.trim() === '') {
      hardwareId = Crypto.randomUUID();
    } else {
      // Normalizar formato de hardware ID
      hardwareId = `${Platform.OS.toLowerCase()}-${hardwareId}`;
    }

    // 4. Guardar en SecureStore para inmutabilidad del Device Binding
    if (Platform.OS !== 'web') {
      await SecureStore.setItemAsync(STORAGE_KEY_DEVICE_ID, hardwareId, {
        keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
      });
    }

    return hardwareId;
  } catch (error) {
    console.error('[Hardware] Fallo crítico al resolver UUID de hardware:', error);
    // Fallback de emergencia
    const fallbackId = `fallback-${Crypto.randomUUID()}`;
    return fallbackId;
  }
}

/**
 * Obtiene los metadatos completos y telemetría de seguridad del dispositivo físico.
 */
export async function getDeviceHardwareMetadata(): Promise<DeviceHardwareInfo> {
  const deviceId = await getDeviceHardwareId();

  const brand = Device.brand || (Platform.OS === 'ios' ? 'Apple' : 'Android');
  const modelName = Device.modelName || 'Dispositivo Móvil';
  const osName = Device.osName || Platform.OS;
  const osVersion = Device.osVersion || String(Platform.Version);
  const isPhysical = Device.isDevice;

  const deviceFingerprint = `${brand} ${modelName} (${osName} ${osVersion})`.trim();

  return {
    deviceId,
    brand,
    modelName,
    osName,
    osVersion,
    isPhysical,
    platform: Platform.OS === 'android' ? 'android' : Platform.OS === 'ios' ? 'ios' : 'web',
    deviceFingerprint,
  };
}

/**
 * Hook de React para acceder reactivamente al Hardware Device ID y metadatos del dispositivo.
 */
export function useDeviceHardware() {
  const [hardwareInfo, setHardwareInfo] = useState<DeviceHardwareInfo | null>(null);
  const [deviceId, setDeviceId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadHardwareData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getDeviceHardwareMetadata();
      setHardwareInfo(data);
      setDeviceId(data.deviceId);
    } catch (err: any) {
      setError(err?.message || 'Error al obtener la identidad del hardware');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHardwareData();
  }, [loadHardwareData]);

  return {
    deviceId,
    hardwareInfo,
    isLoading,
    error,
    refreshHardwareId: loadHardwareData,
  };
}
