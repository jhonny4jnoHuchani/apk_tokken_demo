import { api } from './authService';

export interface GenerateTokenResponse {
  success: boolean;
  codigo: string;
  expira_en: string;
  estado: 'activo' | 'usado' | 'caducado';
}

/**
 * Solicita la generación de un nuevo Token OTP de 6 dígitos al backend (/api/tokens/generate).
 * Dispone de modo simulación para evaluación en entornos sin servidor levantado.
 */
export async function generateOtpToken(
  identificador_sistema: string,
  useSimulation: boolean = false
): Promise<GenerateTokenResponse> {
  if (useSimulation) {
    // Simular latencia de red de alta fidelidad
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Código numérico aleatorio de 6 dígitos
    const simulatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    const simulatedExpiration = new Date(Date.now() + 60 * 1000).toISOString(); // 60 segundos para demo dinámica

    return {
      success: true,
      codigo: simulatedCode,
      expira_en: simulatedExpiration,
      estado: 'activo',
    };
  }

  try {
    const response = await api.post<GenerateTokenResponse>('/api/tokens/generate', {
      identificador_sistema,
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    if (error.code === 'ECONNABORTED' || error.message?.includes('Network Error')) {
      throw new Error(
        'No se pudo conectar al servicio de tokens en el backend. Verifica que el servidor esté activo o activa el Modo Simulación.'
      );
    }
    throw new Error(error.message || 'Error inesperado al solicitar el token OTP');
  }
}
