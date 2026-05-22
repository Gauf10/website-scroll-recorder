Website Scroll Recorder

Capturá videos automáticos haciendo scroll en cualquier sitio web.
Ideal para portfolios, showcases, productos, redes sociales, mockups y demos.

Convierte una URL en:

videos .webm
.mp4
.gif

con scroll automático, múltiples dispositivos y export listo para redes.

Demo
URL a grabar: gaufgang.com

Dispositivo:
1.Mobile
2.Tablet
3.Desktop

Velocidad:
1.Lento elegante
2.Estándar
3.Rápido
4.Ultra rápido

Formato:
1.webm
2.mp4
3.gif

Resultado:

gaufgang_com_mobile_2026-05-22_18-42.mp4

Características

✅ Scroll automático
✅ Mobile / Tablet / Desktop
✅ Export .webm
✅ Conversión .mp4 y .gif
✅ Fade in automático
✅ Espera inteligente de render
✅ Oculta cursores custom
✅ Naming automático por URL y fecha
✅ Compatible con Playwright + FFmpeg
✅ Open Source
✅ Funciona localmente
✅ Ideal para mockups y reels

Casos de uso
Mostrar portfolios
Presentar landing pages
Grabar demos de producto
Reels para Instagram
Videos para LinkedIn
Mockups animados
Antes/después de rediseños
Showcase para clientes
Documentación visual
Instalación
1. Clonar repositorio
git clone https://github.com/TUUSUARIO/website-scroll-recorder.git
cd website-scroll-recorder
2. Instalar dependencias
npm install
3. Instalar Playwright
npx playwright install
Instalar FFmpeg

Este proyecto utiliza FFmpeg para convertir videos.

Windows

Descargar:

FFmpeg Windows Builds

Luego:

Descargar versión Essentials
Extraer carpeta
Renombrarla como:
ffmpeg
Ubicarla junto a:
scroll.js

Debe quedar:

project/
│
├── scroll.js
├── ffmpeg/
│   └── bin/
│       └── ffmpeg.exe
macOS

Instalar con Homebrew:

brew install ffmpeg
Linux

Ubuntu / Debian:

sudo apt install ffmpeg
Uso

Ejecutar:

node scroll.js

Luego responder:

URL
dispositivo
velocidad
formato

El archivo final se exporta automáticamente en:

/videos
Velocidades
Opción	Descripción
1	Lento elegante
2	Estándar
3	Rápido
4	Ultra rápido
Dispositivos
Opción	Resolución
Mobile	430x932
Tablet	834x1194
Desktop	1440x900
Formatos soportados
Formato	Uso recomendado
.webm	máxima calidad
.mp4	redes sociales
.gif	previews rápidas
Estructura
website-scroll-recorder/
│
├── scroll.js
├── package.json
├── videos/
├── ffmpeg/
└── README.md
Tecnologías
Playwright
FFmpeg
Node.js
Roadmap
v1
CLI funcional
export webm/mp4/gif
velocidades
múltiples dispositivos

Pull requests, ideas y mejoras son bienvenidas.

Si encontrás bugs o querés proponer features:

abrir issue
compartir ejemplos
sugerir mejoras
Licencia

MIT

Inspiración

Herramienta creada para facilitar showcases visuales de sitios web, productos y experiencias digitales de manera simple y rápida.

Especialmente útil para:

creativos
diseñadores
developers
founders
speakers
portfolios
demos

Autor
Gabriel Aufgang
