# Fullstack Trabajo Final

## Descripción
Este es un proyecto fullstack que contiene un frontend desarrollado con React y un backend con Node.js para gestión de ventas.

## Requisitos previos
- Node.js (versión 14 o superior)
- npm o yarn
- Git
- Docker y Docker Compose (para ejecutar con contenedores)

## Instalación

### Opción 1: Usando Docker (Recomendado)

1. Clonar el repositorio:
```bash
git clone https://github.com/AndersonFlores2006/fullstack_trabajo_final.git
cd fullstack_trabajo_final
```

2. Configurar variables de entorno:

Crear archivo `backend/.env`:
```env
# Database Configuration
DB_HOST=turntable.proxy.rlwy.net
DB_USER=root
DB_PASSWORD=zAbgeCNfUOmgRMUjooltDVFfoifYOBXQ
DB_PORT=15309
DB_NAME=railway

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# API Configuration
API_PREFIX=/api
```

Crear archivo `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

3. Iniciar los servicios con Docker:
```bash
# Construir e iniciar todos los servicios
docker-compose up --build

# Para ejecutar en segundo plano
docker-compose up -d --build

# Para detener los servicios
docker-compose down

# Para ver los logs
docker-compose logs -f
```

La aplicación estará disponible en:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- Base de datos MySQL: localhost:3306

### Opción 2: Instalación Manual

### Clonar el repositorio
```bash
git clone https://github.com/AndersonFlores2006/fullstack_trabajo_final.git
cd fullstack_trabajo_final
```

### Instalar dependencias del backend
```bash
cd backend
npm install
```

### Instalar dependencias del frontend
```bash
cd frontend
npm install
```

## Ejecución del proyecto

### Iniciar el backend
```bash
cd backend
npm start
```
El servidor se iniciará en http://localhost:5000 por defecto.

### Iniciar el frontend
```bash
cd frontend
npm run dev
```
La aplicación de React se iniciará en http://localhost:5173 por defecto.

## Comandos útiles

### Backend

- Iniciar en modo desarrollo con nodemon:
```bash
npm run dev
```

- Ejecutar pruebas:
```bash
npm test
```

### Frontend

- Compilar para producción:
```bash
npm run build
```

- Vista previa de la versión de producción:
```bash
npm run preview
```

## Estructura del proyecto
```
fullstack_trabajo_final/
├── backend/            # Servidor Node.js
│   ├── config/         # Configuración de la aplicación
│   ├── controllers/    # Controladores de la aplicación
│   ├── models/         # Modelos de datos
│   ├── routes/         # Rutas de la API
│   └── server.js       # Punto de entrada del servidor
│
├── frontend/           # Aplicación React
│   ├── public/         # Archivos estáticos
│   ├── src/            # Código fuente
│   │   ├── components/ # Componentes de React
│   │   ├── pages/      # Páginas de la aplicación
│   │   ├── services/   # Servicios para la comunicación con el backend
│   │   └── App.jsx     # Componente principal
│   └── vite.config.js  # Configuración de Vite
│
└── README.md           # Este archivo
```

## Variables de Entorno

### Backend (.env)
```env
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_PORT=3306
DB_NAME=your_database_name
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
API_PREFIX=/api
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## Comandos Docker

### Iniciar la aplicación
```bash
# Construir e iniciar
docker-compose up --build

# Iniciar en segundo plano
docker-compose up -d --build
```

### Gestión de contenedores
```bash
# Detener servicios
docker-compose down

# Ver logs
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f db
```

### Gestión de datos
```bash
# Limpiar volúmenes (¡CUIDADO! Esto eliminará todos los datos)
docker-compose down -v
```

## Contribuir
Las contribuciones son bienvenidas. Por favor, haz un fork del proyecto y crea un pull request con tus cambios.

## Licencia
MIT 