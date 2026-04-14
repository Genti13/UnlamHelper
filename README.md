# 🎓 UnlamHelper - Mobile App (Angular + Capacitor)

Este repositorio contiene la aplicación UnlamHelper, una herramienta diseñada para estudiantes de la UNLaM, desarrollada con Angular 17 y Capacitor. Esta guía detalla los pasos técnicos para clonar, configurar y regenerar el proyecto para Android.

---

## 📋 Requisitos Previos

Asegúrate de tener instalado el siguiente entorno antes de empezar:

| Herramienta | Versión Sugerida |
| :--- | :--- |
| Node.js | LTS (v20+) |
| Angular CLI | v17 o superior |
| Android Studio | Ladybug / 2024.2.1+ |
| Capacitor CLI | v6+ |

---

## 🚀 Guía de Instalación Rápida

Si acabas de clonar el repositorio, ejecutá estos comandos en orden:

### 1. Instalación de Dependencias
Descarga todos los paquetes necesarios del package.json.
$ npm install

### 2. Generar el Build de Angular
Compila la aplicación web. Capacitor utilizará estos archivos para "envolverlos" en la app nativa.
$ ng build

[IMPORTANTE]
El archivo capacitor.config.ts está configurado para buscar el código en:
dist/unlamHelper/browser/. Asegúrate de que esa carpeta exista tras el build.

### 3. Sincronizar con Capacitor
Vincula el código compilado con la plataforma nativa y actualiza los plugins.
$ npx cap sync android

### 4. Abrir en Android Studio
Lanza el IDE para la compilación final del archivo APK.
$ npx cap open android

---

## 📱 Generación de la APK

Una vez dentro de Android Studio:

1. Gradle Sync: Esperá a que termine el proceso (revisa la barra de progreso inferior).
2. Build APK: Menú Build > Build Bundle(s) / APK(s) > Build APK(s).
3. Locate: Al finalizar, aparecerá un aviso. Hacé clic en Locate para obtener tu archivo app-debug.apk.

---

## 🎨 Personalización (Branding)

Para cambiar la identidad de la app:

* Nombre de la App: Editalo en android/app/src/main/res/values/strings.xml (parámetro app_name).
* Iconos: Colocá tu logo de 1024x1024px en la carpeta /assets y ejecutá:
  $ npx capacitor-assets generate --android

---

## 🛠️ Comandos de Mantenimiento

* Build + Sync rápido: ng build && npx cap copy android
* Limpiar compilación de Android: ./gradlew clean (dentro de la carpeta /android)
* Verificar cambios en tiempo real: npx cap run android -l --external

[TIP] Recordatorio de Seguridad: No subas el archivo local.properties al repositorio, ya que contiene rutas absolutas de tu SDK local. Revisa siempre que el .gitignore esté activo.
