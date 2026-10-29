# 📱 UPEA Token App — Aplicación Móvil & Web de Token Digital (2FA / OTP)

Aplicación multiplataforma desarrollada con **React Native**, **Expo SDK 58**, **TypeScript**, **NativeWind (Tailwind CSS)** y **Reanimated**. Funciona como autenticador de doble factor universitario para estudiantes, docentes y administrativos de la UPEA, vinculando criptográficamente el dispositivo móvil (**Device Binding**) y generando códigos OTP temporales de 6 dígitos con cuenta regresiva en tiempo real.

---

## 📋 Requisitos Previos

Antes de ejecutar la aplicación, asegúrate de tener instalado en tu máquina de desarrollo:

- **Node.js**: Versión `v18.0.0` o superior (Recomendado `v20.x` LTS).
- **npm**: Versión `9.x` o superior.
- **Navegador Web Moderno**: Google Chrome, Microsoft Edge, Firefox, Brave, etc. (para la visualización en modo web).
- **Backend Activo (Recomendado)**: El microservicio `upea-token-service` corriendo en `http://localhost:3000`.
  > *Nota: La aplicación cuenta además con un **Modo Simulación** integrado en la interfaz para probar la app incluso si el backend aún no está iniciado.*

---

## ⚙️ Paso a Paso: Comandos antes de ejecutar `npm run web`

Para inicializar el proyecto por primera vez y asegurarte de que no ocurran errores al lanzar el modo web, ejecuta los siguientes comandos en orden:

### 1. Ubicarse en el directorio del proyecto
Abre una terminal y dirígete a la carpeta de la aplicación:
```bash
cd d:/TRABAJO/upea-token-app
```

### 2. Instalar las dependencias del proyecto
Instala todas las librerías necesarias (incluyendo soporte web como `react-dom` y `react-native-web`):
```bash
npm install
```
*(Si alguna vez agregas paquetes compatibles con Expo, se recomienda usar `npx expo install <nombre-paquete>`)*.

### 3. Verificar tipado TypeScript (Pre-flight check)
Verifica que todos los componentes, pantallas y servicios cumplan con el tipado estricto sin errores de compilación:
```bash
npm run typecheck
```

### 4. Verificar la Conexión con el Backend NestJS
La app se comunica con el microservicio `upea-token-service`. Revisa la configuración en [services/authService.ts](file:///d:/TRABAJO/upea-token-app/services/authService.ts) y [services/tokenService.ts](file:///d:/TRABAJO/upea-token-app/services/tokenService.ts):

- **En Modo Web (`localhost:8081`)**: Conecta automáticamente a `http://localhost:3000`.
- **En Emulador Android**: Conecta a `http://10.0.2.2:3000`.
- **En Teléfono Físico con Expo Go**: Cambia `localhost` por la IP local de tu computadora en la red Wi-Fi (ejemplo: `http://192.168.1.15:3000`).

> [!TIP]
> **¿Aún no levantaste el backend?** No te preocupes: en la pantalla de inicio de sesión de la app existe un interruptor llamado **"Modo Simulación"**. Al activarlo, podrás iniciar sesión con cualquier credencial de prueba, generar tokens OTP animados y probar la interfaz al 100% sin depender de la base de datos o el servidor NestJS.

---

## 🌐 ¿Cómo ejecutar la aplicación en el Navegador Web?

Una vez completados los pasos previos, puedes levantar la aplicación en el navegador web con cualquiera de estas opciones:

### Opción A (Comando Directo Recomendado)
```bash
npm run web
```
*(O de forma equivalente: `npx expo start --web`)*.

### Opción B (Desde el Servidor Metro de Expo)
```bash
npm start
```
Cuando la consola muestre el menú interactivo de Expo con el código QR, presiona la tecla **`w`** en tu teclado para abrir la versión Web automáticamente en tu navegador predeterminado (en `http://localhost:8081`).

### 🧹 ¿Problemas de caché o estilos Tailwind no reflejados?
Si realizaste cambios en `tailwind.config.js` o `global.css` y no se reflejan, inicia limpiando la caché de Metro Bundler:
```bash
npx expo start -c --web
```

---

## 📱 Ejecutar en Dispositivos Móviles (Opcional)

Si deseas probar la aplicación en teléfonos móviles:

- **En tu celular físico (Android / iOS)**:
  1. Descarga la app gratuita **Expo Go** desde Google Play Store o Apple App Store.
  2. Ejecuta `npm start` en tu terminal.
  3. Asegúrate de que tu celular y tu PC estén conectados a la **misma red Wi-Fi**.
  4. Escanea el código QR que aparece en la terminal usando la cámara de tu teléfono o la app Expo Go.

- **En Emulador Android Studio**:
  ```bash
  npm run android
  ```

- **En Simulador iOS (macOS)**:
  ```bash
  npm run ios
  ```

---

## 🧩 Estructura Principal del Proyecto

```text
upea-token-app/
├── screens/
│   ├── LoginScreen.tsx       # Pantalla de acceso con detección de hardware y simulación
│   └── TokenScreen.tsx       # Pantalla de Token OTP con animación radial y cuenta regresiva
├── services/
│   ├── authService.ts        # Conexión Axios al endpoint /api/auth/login-device
│   └── tokenService.ts       # Conexión Axios al endpoint /api/tokens/generate
├── utils/
│   └── hardware.ts           # Extracción y hash del identificador único del dispositivo
├── global.css                # Estilos globales y directivas de Tailwind CSS
├── tailwind.config.js        # Configuración del tema y tokens de diseño
├── babel.config.js           # Plugins de NativeWind y React Native Reanimated
├── metro.config.js           # Integración con el bundler Metro y CSS
└── App.tsx                   # Enrutador principal de sesión activa
```

---

## 🛡️ Credenciales de Demostración para Prueba

Si te conectas al backend `upea-token-service` con datos reales o usas el **Modo Simulación**:

| Identificador de Sistema | Contraseña | Rol de Prueba |
| :--- | :--- | :--- |
| `30009999` | `password` | Estudiante Demo |
| `20009999` | `password` | Docente Demo |
| `10000001` | `password` | Administrador |
| `Cualquier texto` | `Cualquier texto` | *(Habilitando el switch "Modo Simulación")* |
