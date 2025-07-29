# <span style="color: #e0b800;">Ecuador Interactivo</span>

<div align="center">

![Ecuador Interactivo](https://img.shields.io/badge/Ecuador-Interactivo-green?style=for-the-badge)
![React](https://img.shields.io/badge/React-19.1.0-blue?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-6.3.5-yellow?style=for-the-badge&logo=vite)
![Python](https://img.shields.io/badge/Python-Flask-green?style=for-the-badge&logo=python)

**<span style="color: #3a248b;">Juego educativo interactivo para aprender sobre las provincias del Ecuador</span>**

*<span style="color: #904d18;">Combina tecnología moderna con aprendizaje cultural</span>*

</div>

---

## <span style="color: #3a248b;">Descripción</span>

Ecuador Interactivo es una aplicación educativa que permite a los usuarios aprender sobre las provincias del Ecuador de manera divertida e interactiva. El proyecto incluye integración con hardware Arduino, inteligencia artificial para ajuste dinámico de dificultad, y tecnología de síntesis de voz para una experiencia inmersiva.

## <span style="color: #3a248b;">Características Principales</span>

### <span style="color: #f3634e;">Gameplay</span>
- **Sistema de preguntas dinámico** con 10 preguntas por partida
- **Sistema de vidas** para mecánica de juego engaging
- **Puntuación inteligente** basada en rendimiento
- **Tabla de posiciones** para competencia entre jugadores

### <span style="color: #f3634e;">Inteligencia Artificial</span>
- **Ajuste dinámico de dificultad** basado en ML
- **Modelo predictivo** entrenado con datos de jugadores
- **Personalización automática** según el rendimiento del usuario

### <span style="color: #f3634e;">Audio y Accesibilidad</span>
- **Text-to-Speech** con ElevenLabs AI
- **Auto-reproducción** de preguntas
- **Control manual** de audio
- **Interfaz responsive** para todos los dispositivos

### <span style="color: #f3634e;">Hardware Integration</span>
- **Integración Arduino** via Serial Port
- **Botones físicos** para interacción
- **Comunicación en tiempo real** con WebSockets

## <span style="color: #3a248b;">Arquitectura del Proyecto</span>

```
ecuador-interactivo/
├── Frontend (React + Vite)
│   ├── src/components/     # Componentes UI
│   ├── src/context/        # Estado global
│   ├── src/services/       # APIs y servicios
│   └── src/utils/          # Utilidades
├── Backend (Python Flask)
│   ├── models/             # Modelos ML
│   ├── data/               # Datasets
│   └── app.py             # API principal
├── Hardware (Node.js)
│   ├── sever.js           # Servidor Arduino
│   └── close-serial.js    # Gestión puertos
└── Data & ML
    ├── model_difficulty.ipynb
    └── dataset_dificultad_pregunta.xlsx
```

## <span style="color: #3a248b;">Instalación y Configuración</span>

### <span style="color: #f3634e;">Requisitos Previos</span>

- **Node.js** (v16 o superior)
- **Python** (v3.8 o superior)
- **pip** (gestor de paquetes de Python)
- **Arduino IDE** (para hardware opcional)
- **Cuenta ElevenLabs** (para TTS opcional)

> **⚠️ Importante:** Se recomienda encarecidamente usar un entorno virtual de Python (venv) para aislar las dependencias del proyecto.

### <span style="color: #f3634e;">1. Clonar el Repositorio</span>

```bash
git clone https://github.com/Eliathx/ecuador-interactivo.git
cd ecuador-interactivo
```

### <span style="color: #f3634e;">2. Instalación de Dependencias</span>

```bash
# Frontend
npm install

# Backend (Python) - Recomendado usar entorno virtual
cd backend

# Crear entorno virtual (recomendado)
python -m venv venv

# Activar entorno virtual
# En Windows:
venv\Scripts\activate
# En macOS/Linux:
source venv/bin/activate

# Instalar dependencias de Python
pip install -r requirements.txt
cd ..
```

> **💡 Nota importante:** Es altamente recomendable usar un entorno virtual (venv) para Python para evitar conflictos entre dependencias de diferentes proyectos.

### <span style="color: #f3634e;">3. Configuración de Variables de Entorno</span>

Copia el archivo de ejemplo y configúralo con tus valores:

```bash
# Copiar el archivo de ejemplo
cp .env.example .env
```

Luego edita el archivo `.env` con tus configuraciones específicas.

<!-- ```env
# ElevenLabs TTS (Opcional)
VITE_ELEVENLABS_API_KEY=tu_api_key_aqui

# Base de datos
DB_USER=tu_usuario_db
DB_HOST=localhost
DB_NAME=ecuador_interactivo
DB_PASSWORD=tu_password_db
DB_PORT=5432

# Configuración Arduino
SERIAL_PORT=COM3  # Ajustar según tu puerto (Windows: COM3, macOS/Linux: /dev/ttyUSB0)
BAUD_RATE=9600    # Velocidad de comunicación (opcional, por defecto 9600)
``` -->

> **💡 Consejo:** El archivo `.env.example` contiene todas las variables necesarias con comentarios explicativos. Úsalo como guía para configurar tu entorno.

### <span style="color: #f3634e;">4. Configuración de Base de Datos</span>

El proyecto utiliza PostgreSQL para almacenar datos de jugadores y estadísticas. Sigue estos pasos:

1. **Instalar PostgreSQL** (si no lo tienes):
   - **Windows**: Descarga desde [postgresql.org](https://www.postgresql.org/download/windows/)
   - **macOS**: `brew install postgresql`
   - **Linux**: `sudo apt-get install postgresql postgresql-contrib`

2. **Crear la base de datos**:
   ```bash
   # Conectar a PostgreSQL como superusuario
   sudo -u postgres psql
   
   # Crear la base de datos
   CREATE DATABASE ecuador_interactivo;
   
   # Crear usuario (opcional)
   CREATE USER tu_usuario WITH PASSWORD 'tu_password';
   GRANT ALL PRIVILEGES ON DATABASE ecuador_interactivo TO tu_usuario;
   
   # Salir
   \q
   ```

3. **Ejecutar el script de inicialización**:
   ```bash
   # Crear tablas y estructura inicial
   psql -d ecuador_interactivo -f src/database.sql
   ```

> **📋 Nota:** El archivo `src/database.sql` contiene la estructura de tablas necesaria para el leaderboard, estadísticas de jugadores y datos del juego.

## <span style="color: #3a248b;">Uso del Proyecto</span>

### <span style="color: #f3634e;">Modo Desarrollo Completo</span>

Para ejecutar toda la aplicación (Frontend + Backend + Arduino):

```bash
npm run start:full
```

### <span style="color: #f3634e;">Ejecución Individual</span>

```bash
# Solo Frontend
npm run dev

# Solo Backend Python (con entorno virtual activado)
cd backend
# Asegúrate de tener el entorno virtual activado
# venv\Scripts\activate (Windows) o source venv/bin/activate (macOS/Linux)
python app.py

# Solo servidor Arduino
npm run arduino
```

### <span style="color: #f3634e;">Scripts Disponibles</span>

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo |
| `npm run build` | Construye la aplicación para producción |
| `npm run preview` | Previsualiza la build de producción |
| `npm run backend` | Inicia el servidor Node.js |
| `npm run arduino` | Inicia comunicación con Arduino |
| `npm run start:full` | Inicia todos los servicios |
| `npm run close-serial` | Cierra conexiones seriales |

## <span style="color: #3a248b;">Integración con Arduino</span>

### <span style="color: #f3634e;">Configuración Hardware</span>

1. **Conecta tu Arduino** con botones en los pines:
   - Pin 2: Opción A
   - Pin 3: Opción B  
   - Pin 4: Opción C
   - Pin 5: Opción D

2. **Configura el puerto serial** en el archivo `.env`:
   ```env
   SERIAL_PORT=COM3        # Windows (ej: COM3, COM4, COM5)
   # SERIAL_PORT=/dev/ttyUSB0  # Linux (ej: /dev/ttyUSB0, /dev/ttyACM0)
   # SERIAL_PORT=/dev/tty.usbmodem  # macOS
   BAUD_RATE=9600          # Opcional, por defecto 9600
   ```

3. **Identifica tu puerto Arduino**:
   - **Windows**: Revisa el Administrador de dispositivos
   - **macOS**: Usa `ls /dev/tty.*` en terminal
   - **Linux**: Usa `ls /dev/ttyUSB* /dev/ttyACM*` en terminal

4. **Ejecuta el servidor Arduino**:
   ```bash
   npm run arduino
   ```

### <span style="color: #f3634e;">Protocolo de Comunicación</span>

El sistema usa WebSockets para comunicación en tiempo real entre Arduino y la aplicación web.

## <span style="color: #3a248b;">Sistema de IA y Dificultad</span>

El proyecto incluye un modelo de Machine Learning que:

- **<span style="color: #904d18;">Analiza el rendimiento</span>** del jugador
- **<span style="color: #904d18;">Ajusta la dificultad</span>** automáticamente
- **<span style="color: #904d18;">Aprende de los datos</span>** para mejorar la experiencia
- **<span style="color: #904d18;">Se actualiza constantemente</span>** con nuevos datos

### <span style="color: #f3634e;">Entrenar el Modelo</span>

```bash
cd backend
python -c "import joblib; # Ejecutar notebook model_difficulty.ipynb"
```

## <span style="color: #3a248b;">Tecnologías Utilizadas</span>

### <span style="color: #f3634e;">Frontend</span>
- **React 19.1.0** - Framework UI
- **Vite 6.3.5** - Build tool y dev server
- **Material-UI** - Componentes UI
- **Tailwind CSS** - Estilos utilitarios
- **Lucide React** - Iconografía
- **Socket.io Client** - WebSockets

### <span style="color: #f3634e;">Backend</span>
- **Python Flask** - API REST
- **Scikit-learn** - Machine Learning
- **Pandas** - Manipulación de datos
- **Joblib** - Serialización de modelos

### <span style="color: #f3634e;">Hardware & Servicios</span>
- **Node.js** - Servidor Arduino
- **SerialPort** - Comunicación serie
- **Socket.io** - WebSockets
- **ElevenLabs API** - Text-to-Speech

## <span style="color: #3a248b;">Estructura Detallada</span>

<details>
<summary>Ver estructura completa del proyecto</summary>

```
ecuador-interactivo/
├── backend/
│   ├── app.py                 # API Flask principal
│   ├── requirements.txt       # Dependencias Python
│   ├── data/
│   │   └── dataset_dificultad_pregunta.xlsx
│   └── models/
│       ├── model_difficulty.ipynb
│       ├── encoder_dificultad_pregunta.pkl
│       └── modelo_dificultad.pkl
├── src/
│   ├── App.jsx               # Componente principal
│   ├── main.jsx              # Punto de entrada
│   ├── components/
│   │   ├── screens/
│   │   │   ├── StartScreen.jsx
│   │   │   ├── GameScreen.jsx
│   │   │   ├── FeedbackScreen.jsx
│   │   │   └── FinishedScreen.jsx
│   │   ├── Leaderboard.jsx
│   │   └── TTSButton.jsx
│   ├── context/
│   │   └── GameContext.jsx
│   ├── data/
│   │   ├── questions.js
│   │   └── provinceMapping.js
│   ├── services/
│   │   └── api.js
│   └── utils/
│       └── elevenLabsManager.js
├── public/
├── readme folder/         # Documentación adicional
│   ├── DEBUGGING.md
│   ├── DIFFICULTY_GUIDE.md
│   ├── GAME_DOCUMENTATION.md
│   └── TTS_README.md
├── package.json
├── vite.config.js
├── tailwind.config.js
├── sever.js                  # Servidor Arduino
└── close-serial.js          # Gestión puertos serie
```

</details>

## <span style="color: #3a248b;">Contribución</span>

1. **Fork** el proyecto
2. **Crea** una rama feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'Add: AmazingFeature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. **Abre** un Pull Request

## <span style="color: #3a248b;">Roadmap</span>

- [ ] <span style="color: #904d18;">Mejoras en la interfaz de usuario</span>
- [ ] <span style="color: #904d18;">Soporte multiidioma</span>
- [ ] <span style="color: #904d18;">Aplicación móvil nativa</span>
- [ ] <span style="color: #904d18;">Efectos de sonido adicionales</span>
- [ ] <span style="color: #904d18;">Sistema de logros y medallas</span>
- [ ] <span style="color: #904d18;">Modo multijugador</span>
- [ ] <span style="color: #904d18;">Dashboard de estadísticas</span>
- [ ] <span style="color: #904d18;">Actualizaciones automáticas de contenido</span>

## <span style="color: #3a248b;">Licencia</span>

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## <span style="color: #3a248b;">Autores</span>

- **Eliathx** - [GitHub](https://github.com/Eliathx)

## <span style="color: #3a248b;">Contacto</span>

¿Tienes preguntas o sugerencias? ¡Contáctanos!

- <span style="color: #904d18;">Email:</span> [tu-email@ejemplo.com]
- <span style="color: #904d18;">Issues:</span> [GitHub Issues](https://github.com/Eliathx/ecuador-interactivo/issues)
- <span style="color: #904d18;">Discussions:</span> [GitHub Discussions](https://github.com/Eliathx/ecuador-interactivo/discussions)

---

<div align="center">

**<span style="color: #e0b800;">⭐ ¡Dale una estrella si te gusta el proyecto! ⭐</span>**

*<span style="color: #904d18;">Hecho con ❤️ para la educación ecuatoriana</span>*

</div>

<!-- 
Paleta de colores:
- H1: #e0b800 (Dorado)
- H2: #3a248b (Morado oscuro) 
- H3: #f3634e (Rojo coral)
- Destacados: #904d18 (Marrón)
-->
