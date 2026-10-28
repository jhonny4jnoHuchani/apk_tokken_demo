import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Clipboard from 'expo-clipboard';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  withSpring,
} from 'react-native-reanimated';
import {
  ShieldCheck,
  Cpu,
  Copy,
  Check,
  RefreshCw,
  LogOut,
  Smartphone,
  Lock,
  Radio,
  Clock,
  AlertTriangle,
} from 'lucide-react-native';
import { useDeviceHardware } from '../utils/hardware';
import { generateOtpToken } from '../services/tokenService';

interface TokenScreenProps {
  identificadorSistema: string;
  onLogout: () => void;
  initialSimulationMode?: boolean;
}

export default function TokenScreen({
  identificadorSistema,
  onLogout,
  initialSimulationMode = true,
}: TokenScreenProps) {
  const { deviceId, hardwareInfo } = useDeviceHardware();

  // Estados del Token
  const [otpCode, setOtpCode] = useState<string>('------');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(60);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [simulationMode, setSimulationMode] = useState<boolean>(initialSimulationMode);

  // Animaciones Reanimated
  const radarPulse = useSharedValue(1);
  const copyButtonScale = useSharedValue(1);
  const refreshRotate = useSharedValue(0);

  // Ref para el temporizador de cuenta regresiva
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Pulso constante estilo radar
    radarPulse.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: radarPulse.value }],
  }));

  const animatedCopyButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: copyButtonScale.value }],
  }));

  const animatedRefreshIconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${refreshRotate.value}deg` }],
  }));

  // Generar Token OTP
  const fetchNewToken = useCallback(async () => {
    setIsGenerating(true);
    setErrorMessage(null);

    // Animación de giro para el botón de recarga
    refreshRotate.value = withTiming(refreshRotate.value + 360, { duration: 800 });

    try {
      const result = await generateOtpToken(identificadorSistema, simulationMode);
      setOtpCode(result.codigo);

      // Calcular tiempo restante según `expira_en` o 60 segundos por defecto
      if (result.expira_en) {
        const diffMs = new Date(result.expira_en).getTime() - Date.now();
        const diffSec = Math.max(Math.floor(diffMs / 1000), 10);
        // En modo simulación acotamos a 60s para dinamismo visual
        setSecondsRemaining(simulationMode ? 60 : Math.min(diffSec, 3600));
      } else {
        setSecondsRemaining(60);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al generar el token OTP');
    } finally {
      setIsGenerating(false);
    }
  }, [identificadorSistema, simulationMode]);

  // Carga inicial del token
  useEffect(() => {
    fetchNewToken();
  }, [fetchNewToken]);

  // Temporizador de Cuenta Regresiva
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          // Si el token expira, se solicita automáticamente uno nuevo
          fetchNewToken();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fetchNewToken]);

  // Copiar código al portapapeles
  const handleCopyCode = async () => {
    if (!otpCode || otpCode === '------') return;

    copyButtonScale.value = withSequence(withSpring(0.92), withSpring(1));
    await Clipboard.setStringAsync(otpCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  // Desglosar dígitos para el renderizado segmentado
  const digits = otpCode.split('');

  // Color dinámico de urgencia del temporizador
  const timerColor = secondsRemaining > 20 ? '#00FF9D' : secondsRemaining > 8 ? '#00E5FF' : '#F59E0B';

  return (
    <View style={{ flex: 1, backgroundColor: '#040711' }}>
      <StatusBar style="light" />

      {/* Luces y Fondos Gradientes Ambientales */}
      <View style={{ position: 'absolute', top: -70, right: -60, width: 280, height: 280, borderRadius: 140, backgroundColor: 'rgba(0, 229, 255, 0.1)', filter: 'blur(50px)' }} />
      <View style={{ position: 'absolute', top: '40%', left: -80, width: 290, height: 290, borderRadius: 145, backgroundColor: 'rgba(0, 255, 157, 0.08)', filter: 'blur(60px)' }} />
      <View style={{ position: 'absolute', bottom: -60, right: 20, width: 260, height: 260, borderRadius: 130, backgroundColor: 'rgba(139, 92, 246, 0.08)', filter: 'blur(50px)' }} />

      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingTop: 50, paddingBottom: 30 }}>
        {/* Barra Superior con Identificador y Botón de Desconexión */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <View>
            <Text style={{ color: '#64748B', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase' }}>
              SESIÓN ACTIVA
            </Text>
            <Text style={{ color: '#00E5FF', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 }}>
              {identificadorSistema}
            </Text>
          </View>

          <TouchableOpacity
            onPress={onLogout}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              borderColor: 'rgba(239, 68, 68, 0.3)',
              borderWidth: 1,
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 7,
            }}
          >
            <LogOut size={14} color="#EF4444" style={{ marginRight: 6 }} />
            <Text style={{ color: '#FCA5A5', fontSize: 11, fontWeight: '700' }}>
              Cerrar Sesión
            </Text>
          </TouchableOpacity>
        </View>

        {/* Badge de Hardware Binding Activo */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'rgba(12, 19, 36, 0.85)',
            borderWidth: 1,
            borderColor: 'rgba(0, 255, 157, 0.3)',
            borderRadius: 16,
            paddingHorizontal: 14,
            paddingVertical: 10,
            marginBottom: 24,
          }}
        >
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: 'rgba(0, 255, 157, 0.15)',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 10,
            }}
          >
            <Lock size={16} color="#00FF9D" />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: '#00FF9D', fontSize: 11, fontWeight: '800', letterSpacing: 1 }}>
                HARDWARE VINCULADO
              </Text>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#00FF9D', marginLeft: 6 }} />
            </View>
            <Text
              numberOfLines={1}
              style={{
                color: '#94A3B8',
                fontSize: 11,
                fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
                marginTop: 2,
              }}
            >
              {deviceId || 'Detectando UUID de Hardware...'}
            </Text>
          </View>
        </View>

        {/* Panel HUD Central del Token OTP */}
        <View
          style={{
            borderRadius: 26,
            overflow: 'hidden',
            borderWidth: 1.5,
            borderColor: 'rgba(0, 229, 255, 0.25)',
            backgroundColor: 'rgba(12, 19, 36, 0.75)',
            marginBottom: 24,
          }}
        >
          <BlurView intensity={Platform.OS === 'ios' ? 40 : 100} tint="dark" style={{ padding: 24, alignItems: 'center' }}>
            {/* Escudo con Pulso de Protección */}
            <Animated.View style={[{ marginBottom: 16 }, animatedPulseStyle]}>
              <LinearGradient
                colors={['#00E5FF', '#0055FF']}
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: 29,
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: '#00E5FF',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.5,
                  shadowRadius: 12,
                }}
              >
                <ShieldCheck size={30} color="#040711" strokeWidth={2.4} />
              </LinearGradient>
            </Animated.View>

            <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '800', letterSpacing: 1, textAlign: 'center' }}>
              CÓDIGO DE ACCESO 2FA
            </Text>
            <Text style={{ color: '#64748B', fontSize: 12, marginTop: 4, textAlign: 'center' }}>
              Válido para autorizar transacciones en el sistema central
            </Text>

            {/* Error si ocurre */}
            {errorMessage && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  borderColor: 'rgba(239, 68, 68, 0.4)',
                  borderWidth: 1,
                  borderRadius: 12,
                  padding: 10,
                  marginTop: 14,
                  width: '100%',
                }}
              >
                <AlertTriangle size={16} color="#EF4444" style={{ marginRight: 8 }} />
                <Text style={{ color: '#FCA5A5', fontSize: 11, flex: 1 }}>{errorMessage}</Text>
              </View>
            )}

            {/* Display Segmentado de 6 Dígitos */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                marginVertical: 24,
                gap: 8,
              }}
            >
              {isGenerating ? (
                <View style={{ height: 60, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
                  <ActivityIndicator size="small" color="#00E5FF" style={{ marginRight: 10 }} />
                  <Text style={{ color: '#00E5FF', fontSize: 14, fontWeight: '700' }}>
                    Generando Token Criptográfico...
                  </Text>
                </View>
              ) : (
                digits.map((digit, index) => (
                  <View
                    key={index}
                    style={{
                      width: 44,
                      height: 58,
                      borderRadius: 12,
                      backgroundColor: 'rgba(6, 11, 24, 0.9)',
                      borderWidth: 1.5,
                      borderColor: '#00E5FF',
                      justifyContent: 'center',
                      alignItems: 'center',
                      shadowColor: '#00E5FF',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.35,
                      shadowRadius: 6,
                    }}
                  >
                    <Text
                      style={{
                        color: '#FFFFFF',
                        fontSize: 28,
                        fontWeight: '900',
                        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
                      }}
                    >
                      {digit}
                    </Text>
                  </View>
                ))
              )}
            </View>

            {/* Barra de Tiempo y Temporizador */}
            <View style={{ width: '100%', alignItems: 'center', marginBottom: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Clock size={14} color={timerColor} style={{ marginRight: 6 }} />
                <Text style={{ color: timerColor, fontSize: 13, fontWeight: '800' }}>
                  Expira en: {secondsRemaining} segundos
                </Text>
              </View>

              {/* Barra de progreso visual */}
              <View
                style={{
                  width: '100%',
                  height: 4,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 2,
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    width: `${Math.min((secondsRemaining / 60) * 100, 100)}%`,
                    height: '100%',
                    backgroundColor: timerColor,
                  }}
                />
              </View>
            </View>

            {/* Botón de Copiar Código con Reanimated */}
            <Animated.View style={[{ width: '100%' }, animatedCopyButtonStyle]}>
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={handleCopyCode}
                disabled={isGenerating}
                style={{
                  borderRadius: 14,
                  overflow: 'hidden',
                  marginBottom: 12,
                }}
              >
                <LinearGradient
                  colors={copied ? ['#00FF9D', '#059669'] : ['#00E5FF', '#0284C7']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    height: 50,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {copied ? (
                    <>
                      <Check size={18} color="#040711" strokeWidth={2.6} style={{ marginRight: 8 }} />
                      <Text style={{ color: '#040711', fontSize: 14, fontWeight: '800', letterSpacing: 0.5 }}>
                        ¡CÓDIGO COPIADO AL PORTAPAPELES!
                      </Text>
                    </>
                  ) : (
                    <>
                      <Copy size={18} color="#040711" strokeWidth={2.4} style={{ marginRight: 8 }} />
                      <Text style={{ color: '#040711', fontSize: 14, fontWeight: '800', letterSpacing: 0.5 }}>
                        COPIAR CÓDIGO OTP
                      </Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            {/* Botón de Regenerar Token Manual */}
            <TouchableOpacity
              onPress={fetchNewToken}
              disabled={isGenerating}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 10,
                width: '100%',
              }}
            >
              <Animated.View style={[animatedRefreshIconStyle, { marginRight: 8 }]}>
                <RefreshCw size={15} color="#38BDF8" />
              </Animated.View>
              <Text style={{ color: '#38BDF8', fontSize: 13, fontWeight: '700' }}>
                Solicitar Nuevo Token
              </Text>
            </TouchableOpacity>
          </BlurView>
        </View>

        {/* Ficha de Seguridad del Hardware y Conexión */}
        <View
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
            borderRadius: 16,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.06)',
            padding: 16,
            marginBottom: 20,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Cpu size={15} color="#00E5FF" style={{ marginRight: 8 }} />
            <Text style={{ color: '#E2E8F0', fontSize: 12, fontWeight: '700' }}>
              Telemetría de Hardware Enlazada:
            </Text>
          </View>
          <Text style={{ color: '#94A3B8', fontSize: 11, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' }}>
            Dispositivo: {hardwareInfo?.deviceFingerprint || 'Dispositivo Móvil Físico'}
          </Text>
          <Text style={{ color: '#64748B', fontSize: 11, marginTop: 4 }}>
            Algoritmo OTP: Criptográfico 6 dígitos • Estado: Activo en Base de Datos
          </Text>
        </View>

        {/* Toggle Modo Simulación / Backend */}
        <TouchableOpacity
          onPress={() => {
            const nextMode = !simulationMode;
            setSimulationMode(nextMode);
          }}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 6,
          }}
        >
          <Radio size={13} color={simulationMode ? '#00FF9D' : '#38BDF8'} style={{ marginRight: 6 }} />
          <Text style={{ color: '#94A3B8', fontSize: 11 }}>
            Modo:{' '}
            <Text style={{ color: simulationMode ? '#00FF9D' : '#38BDF8', fontWeight: '700' }}>
              {simulationMode ? 'Simulación Instantánea' : 'Backend Real (:3000)'}
            </Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
