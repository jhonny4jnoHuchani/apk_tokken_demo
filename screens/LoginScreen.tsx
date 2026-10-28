import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
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
  KeyRound,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Lock,
  Radio,
  Zap,
} from 'lucide-react-native';
import { useDeviceHardware } from '../utils/hardware';
import { authenticateDevice, LoginDevicePayload } from '../services/authService';

export interface LoginScreenProps {
  onSuccess?: (data: {
    identificador_sistema: string;
    device_id: string;
    simulationMode: boolean;
  }) => void;
}

export default function LoginScreen({ onSuccess }: LoginScreenProps) {
  const { deviceId, hardwareInfo, isLoading: isHardwareLoading } = useDeviceHardware();

  // Estados del Formulario
  const [identificador, setIdentificador] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState<'id' | 'pass' | null>(null);

  // Estados de Operación y Feedback
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [useSimulationMode, setUseSimulationMode] = useState(true);
  const [authStageText, setAuthStageText] = useState('Autenticar y Vincular Dispositivo');
  const [authError, setAuthError] = useState<string | null>(null);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [boundUserData, setBoundUserData] = useState<any>(null);

  // Animaciones Reanimated
  const shieldGlow = useSharedValue(1);
  const buttonScale = useSharedValue(1);
  const badgePulse = useSharedValue(0.4);

  useEffect(() => {
    // Pulso constante estilo radar para el escudo central
    shieldGlow.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Pulso de seguridad del badge
    badgePulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1200 }),
        withTiming(0.4, { duration: 1200 })
      ),
      -1,
      true
    );
  }, []);

  const animatedShieldStyle = useAnimatedStyle(() => ({
    transform: [{ scale: shieldGlow.value }],
  }));

  const animatedBadgeStyle = useAnimatedStyle(() => ({
    opacity: badgePulse.value,
  }));

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handlePressIn = () => {
    buttonScale.value = withSpring(0.96);
  };

  const handlePressOut = () => {
    buttonScale.value = withSpring(1);
  };

  // Acción Principal: Autenticación con Hardware Binding
  const handleAuthenticate = async () => {
    if (!identificador.trim() || !password.trim()) {
      setAuthError('Por favor ingresa tu Identificador de Sistema y Contraseña');
      return;
    }

    setAuthError(null);
    setIsAuthenticating(true);
    setAuthStageText('Extrayendo Hardware UUID...');

    try {
      await new Promise((r) => setTimeout(r, 400));
      setAuthStageText('Cifrando canal de vinculación...');

      const payload: LoginDevicePayload = {
        identificador_sistema: identificador.trim(),
        password: password.trim(),
        device_id: deviceId || 'android-fallback-dev-id',
      };

      await new Promise((r) => setTimeout(r, 500));
      setAuthStageText('Verificando Device Binding en UPEA Service...');

      const response = await authenticateDevice(payload, useSimulationMode);

      setBoundUserData({
        identificador_sistema: payload.identificador_sistema,
        device_id: payload.device_id,
        user: response.user,
        message: response.message,
      });

      setSuccessModalVisible(true);
    } catch (err: any) {
      setAuthError(err.message || 'Error al autenticar con el servicio de seguridad');
    } finally {
      setIsAuthenticating(false);
      setAuthStageText('Autenticar y Vincular Dispositivo');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#040711' }}>
      <StatusBar style="light" />

      {/* Capas de Fondo Tecnológicas y Resplandores Gradientes */}
      <View style={{ position: 'absolute', top: -80, left: -60, width: 280, height: 280, borderRadius: 140, backgroundColor: 'rgba(0, 229, 255, 0.12)', filter: 'blur(50px)' }} />
      <View style={{ position: 'absolute', top: '35%', right: -90, width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(0, 255, 157, 0.08)', filter: 'blur(60px)' }} />
      <View style={{ position: 'absolute', bottom: -50, left: 20, width: 260, height: 260, borderRadius: 130, backgroundColor: 'rgba(139, 92, 246, 0.1)', filter: 'blur(50px)' }} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header & Logo Ciberseguridad */}
          <View style={{ alignItems: 'center', marginBottom: 28 }}>
            <View style={{ position: 'relative', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
              <Animated.View
                style={[
                  {
                    position: 'absolute',
                    width: 86,
                    height: 86,
                    borderRadius: 43,
                    backgroundColor: 'rgba(0, 229, 255, 0.18)',
                  },
                  animatedShieldStyle,
                ]}
              />
              <LinearGradient
                colors={['#00E5FF', '#0077FE']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: 35,
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: '#00E5FF',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.5,
                  shadowRadius: 16,
                  elevation: 12,
                }}
              >
                <ShieldCheck size={36} color="#040711" strokeWidth={2.2} />
              </LinearGradient>
            </View>

            <Text style={{ color: '#FFFFFF', fontSize: 24, fontWeight: '800', letterSpacing: 1.5, textAlign: 'center' }}>
              UPEA <Text style={{ color: '#00E5FF' }}>TOKEN</Text>
            </Text>
            <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '600', letterSpacing: 2, marginTop: 4, textTransform: 'uppercase' }}>
              2FA Authentication & Device Binding
            </Text>

            {/* Chip de Telemetría de Hardware En Vivo */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'rgba(15, 23, 42, 0.85)',
                borderColor: 'rgba(0, 229, 255, 0.3)',
                borderWidth: 1,
                borderRadius: 20,
                paddingHorizontal: 12,
                paddingVertical: 5,
                marginTop: 14,
              }}
            >
              <Animated.View
                style={[
                  {
                    width: 7,
                    height: 7,
                    borderRadius: 4,
                    backgroundColor: '#00FF9D',
                    marginRight: 7,
                  },
                  animatedBadgeStyle,
                ]}
              />
              <Cpu size={13} color="#00E5FF" style={{ marginRight: 6 }} />
              <Text style={{ color: '#CBD5E1', fontSize: 11, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' }}>
                {isHardwareLoading
                  ? 'ESCANEANDO HARDWARE...'
                  : `DEV_ID: ${deviceId ? deviceId.slice(0, 18) + '...' : 'VINCULADO'}`}
              </Text>
            </View>
          </View>

          {/* HUD Card Principal con Glassmorfismo */}
          <View
            style={{
              borderRadius: 24,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.1)',
              backgroundColor: 'rgba(12, 19, 36, 0.65)',
            }}
          >
            <BlurView intensity={Platform.OS === 'ios' ? 40 : 100} tint="dark" style={{ padding: 24 }}>
              {/* Encabezado del Formulario */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <View>
                  <Text style={{ color: '#F8FAFC', fontSize: 17, fontWeight: '700' }}>
                    Acceso Autorizado
                  </Text>
                  <Text style={{ color: '#64748B', fontSize: 12, marginTop: 2 }}>
                    Credenciales únicas vinculadas al dispositivo
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: 'rgba(0, 229, 255, 0.1)',
                    borderColor: 'rgba(0, 229, 255, 0.25)',
                    borderWidth: 1,
                    borderRadius: 8,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                  }}
                >
                  <Text style={{ color: '#00E5FF', fontSize: 10, fontWeight: '700' }}>
                    HARDWARE LOCK
                  </Text>
                </View>
              </View>

              {/* Mensaje de Error si aplica */}
              {authError && (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    borderColor: 'rgba(239, 68, 68, 0.4)',
                    borderWidth: 1,
                    borderRadius: 12,
                    padding: 12,
                    marginBottom: 16,
                  }}
                >
                  <AlertCircle size={18} color="#EF4444" style={{ marginRight: 8 }} />
                  <Text style={{ color: '#FCA5A5', fontSize: 12, flex: 1, lineHeight: 16 }}>
                    {authError}
                  </Text>
                </View>
              )}

              {/* Input 1: Identificador de Sistema */}
              <View style={{ marginBottom: 18 }}>
                <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '600', marginBottom: 6, letterSpacing: 0.5 }}>
                  IDENTIFICADOR DE SISTEMA
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: 'rgba(6, 11, 24, 0.75)',
                    borderWidth: 1.5,
                    borderColor: focusedInput === 'id' ? '#00E5FF' : 'rgba(255, 255, 255, 0.08)',
                    borderRadius: 14,
                    paddingHorizontal: 14,
                    height: 52,
                    shadowColor: focusedInput === 'id' ? '#00E5FF' : 'transparent',
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.4,
                    shadowRadius: 8,
                  }}
                >
                  <User size={18} color={focusedInput === 'id' ? '#00E5FF' : '#64748B'} style={{ marginRight: 10 }} />
                  <TextInput
                    value={identificador}
                    onChangeText={setIdentificador}
                    placeholder="ej. SIS-DOCENTE-2026"
                    placeholderTextColor="#475569"
                    autoCapitalize="none"
                    autoCorrect={false}
                    onFocus={() => setFocusedInput('id')}
                    onBlur={() => setFocusedInput(null)}
                    style={{ flex: 1, color: '#FFFFFF', fontSize: 15 }}
                  />
                </View>
              </View>

              {/* Input 2: Contraseña */}
              <View style={{ marginBottom: 24 }}>
                <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '600', marginBottom: 6, letterSpacing: 0.5 }}>
                  CONTRASEÑA MAESTRA
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: 'rgba(6, 11, 24, 0.75)',
                    borderWidth: 1.5,
                    borderColor: focusedInput === 'pass' ? '#00E5FF' : 'rgba(255, 255, 255, 0.08)',
                    borderRadius: 14,
                    paddingHorizontal: 14,
                    height: 52,
                    shadowColor: focusedInput === 'pass' ? '#00E5FF' : 'transparent',
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.4,
                    shadowRadius: 8,
                  }}
                >
                  <KeyRound size={18} color={focusedInput === 'pass' ? '#00E5FF' : '#64748B'} style={{ marginRight: 10 }} />
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••••••"
                    placeholderTextColor="#475569"
                    secureTextEntry={!showPassword}
                    onFocus={() => setFocusedInput('pass')}
                    onBlur={() => setFocusedInput(null)}
                    style={{ flex: 1, color: '#FFFFFF', fontSize: 15 }}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    {showPassword ? <EyeOff size={18} color="#64748B" /> : <Eye size={18} color="#64748B" />}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Botón Principal de Autenticación & Device Binding */}
              <Animated.View style={animatedButtonStyle}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  onPress={handleAuthenticate}
                  disabled={isAuthenticating}
                  style={{
                    borderRadius: 14,
                    overflow: 'hidden',
                    shadowColor: '#00E5FF',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.45,
                    shadowRadius: 14,
                    elevation: 8,
                  }}
                >
                  <LinearGradient
                    colors={isAuthenticating ? ['#0369A1', '#0284C7'] : ['#00E5FF', '#00A3FF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      height: 54,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingHorizontal: 16,
                    }}
                  >
                    {isAuthenticating ? (
                      <>
                        <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 10 }} />
                        <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700', letterSpacing: 0.5 }}>
                          {authStageText}
                        </Text>
                      </>
                    ) : (
                      <>
                        <Lock size={18} color="#040711" strokeWidth={2.4} style={{ marginRight: 8 }} />
                        <Text style={{ color: '#040711', fontSize: 14, fontWeight: '800', letterSpacing: 1 }}>
                          AUTENTICAR Y VINCULAR
                        </Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>

              {/* Selector de Modo Simulación / Backend Real */}
              <TouchableOpacity
                onPress={() => setUseSimulationMode(!useSimulationMode)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 18,
                  paddingVertical: 6,
                }}
              >
                <Radio size={14} color={useSimulationMode ? '#00FF9D' : '#64748B'} style={{ marginRight: 6 }} />
                <Text style={{ color: '#94A3B8', fontSize: 11 }}>
                  Modo de evaluación:{' '}
                  <Text style={{ color: useSimulationMode ? '#00FF9D' : '#38BDF8', fontWeight: '700' }}>
                    {useSimulationMode ? 'Simulación Instantánea' : 'Backend Real (:3000)'}
                  </Text>
                </Text>
              </TouchableOpacity>
            </BlurView>
          </View>

          {/* Información del Dispositivo y Sello de Seguridad */}
          <View
            style={{
              marginTop: 20,
              backgroundColor: 'rgba(15, 23, 42, 0.4)',
              borderRadius: 16,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.05)',
              padding: 14,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <Smartphone size={14} color="#00FF9D" style={{ marginRight: 6 }} />
              <Text style={{ color: '#E2E8F0', fontSize: 12, fontWeight: '600' }}>
                Hardware Físico Detectado:
              </Text>
            </View>
            <Text style={{ color: '#64748B', fontSize: 11, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' }}>
              {hardwareInfo ? hardwareInfo.deviceFingerprint : 'Identificando procesador...'}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
              <Zap size={12} color="#00E5FF" style={{ marginRight: 5 }} />
              <Text style={{ color: '#38BDF8', fontSize: 10 }}>
                Device Binding estricto: el token OTP solo será emitido a este hardware
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal Tecnológico HUD de Confirmación de Vinculación */}
      <Modal
        visible={successModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSuccessModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(2, 6, 23, 0.85)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View
            style={{
              width: '100%',
              maxWidth: 380,
              backgroundColor: '#0B1324',
              borderRadius: 24,
              borderWidth: 1.5,
              borderColor: '#00FF9D',
              padding: 24,
              shadowColor: '#00FF9D',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.35,
              shadowRadius: 20,
              elevation: 20,
            }}
          >
            <View style={{ alignItems: 'center', marginBottom: 16 }}>
              <View
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: 'rgba(0, 255, 157, 0.15)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 12,
                }}
              >
                <CheckCircle2 size={36} color="#00FF9D" />
              </View>
              <Text style={{ color: '#FFFFFF', fontSize: 19, fontWeight: '800', textAlign: 'center' }}>
                ¡DISPOSITIVO VINCULADO!
              </Text>
              <Text style={{ color: '#94A3B8', fontSize: 12, textAlign: 'center', marginTop: 4 }}>
                Hardware Cryptographic Handshake Exitoso
              </Text>
            </View>

            {/* Datos Técnicos de la Vinculación */}
            <View
              style={{
                backgroundColor: 'rgba(2, 6, 23, 0.6)',
                borderRadius: 14,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.08)',
                padding: 14,
                marginBottom: 20,
              }}
            >
              <Text style={{ color: '#64748B', fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 4 }}>
                IDENTIFICADOR
              </Text>
              <Text style={{ color: '#00E5FF', fontSize: 13, fontWeight: '700', marginBottom: 10 }}>
                {boundUserData?.identificador_sistema}
              </Text>

              <Text style={{ color: '#64748B', fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 4 }}>
                DEVICE BINDING UUID
              </Text>
              <Text
                style={{
                  color: '#00FF9D',
                  fontSize: 11,
                  fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
                  marginBottom: 10,
                }}
              >
                {boundUserData?.device_id}
              </Text>

              <Text style={{ color: '#64748B', fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 4 }}>
                ESTADO DE SEGURIDAD
              </Text>
              <Text style={{ color: '#E2E8F0', fontSize: 12 }}>
                ✓ Enlazado a la cuenta (Device Binding Activo)
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => {
                setSuccessModalVisible(false);
                if (onSuccess && boundUserData) {
                  onSuccess({
                    identificador_sistema: boundUserData.identificador_sistema,
                    device_id: boundUserData.device_id,
                    simulationMode: useSimulationMode,
                  });
                }
              }}
              style={{
                borderRadius: 12,
                backgroundColor: '#00FF9D',
                height: 48,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: '#040711', fontSize: 14, fontWeight: '800', letterSpacing: 1 }}>
                CONTINUAR A TOKENS OTP
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
