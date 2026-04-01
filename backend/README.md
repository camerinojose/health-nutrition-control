# BienestarApp - Backend (Go)

API REST en Go (Gin) con autenticación JWT y PostgreSQL para el seguimiento de composición corporal.

## Inicio Rápido

### Requisitos Previos
- Go 1.20+ instalado

### Instalación y Ejecución

```bash
# Descargar dependencias
go mod tidy

# Ejecutar el servidor (desarrollo con clave JWT por defecto)
go run .

# Ejecutar con JWT_SECRET personalizada (recomendado en producción)
JWT_SECRET="tu-clave-secreta-fuerte-aqui" go run .
```

El servidor iniciará en `http://localhost:8080`

## Configuración

### Variables de Entorno

La aplicación lee la variable de entorno `JWT_SECRET` para firmar tokens JWT:

```bash
export JWT_SECRET="tu-clave-secreta-muy-fuerte-aqui"
go run .
```

Si no se configura, usará una clave de desarrollo (mostrará un warning).

## Base de Datos

// ...existing code...
- **Tablas**: `users` y `histories`

## Notas de Seguridad

- Las contraseñas se hashean con bcrypt
- En producción, **DEBE** configurarse `JWT_SECRET`
- CORS habilitado para localhost:5173
