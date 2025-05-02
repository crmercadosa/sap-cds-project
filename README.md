# Proyecto SAP CDS

## Tecnologías Utilizadas
- **SAP CDS (Core Data Services)**
- **Node.js**
- **MongoDB** (para almacenamiento de datos)
- **Express.js** (para la capa de servicios)

## Instalación y Configuración

### 1. Clonar el repositorio
```sh
git clone https://github.com/crmercadosa/sap-cds-project.git
```

### 2. Instalar dependencias
```sh
npm install
```

### 3. Configurar la conexión a la base de datos
Asegúrate de que el archivo de configuración contiene la conexión correcta a **MongoDB**.

### 4. Iniciar el servidor
```sh
npm run dev
```

El servidor se ejecutará en `http://localhost:3333/`

---

## Uso de la API

La API expone las siguientes rutas para interactuar con el historial de precios:

### 1. Obtener todos los registros de precios
- **Endpoint:** `GET /api/inv/getall`
- **Descripción:** Recupera todos los registros de historial de precios.
- **Ejemplo en Insomnia/Postman:**
```http
GET http://localhost:3333/api/inv/getall
```
- **Respuesta esperada:**
```json
[
  {
    "ID": 1,
    "DATE": "2025-03-29T00:00:00Z",
    "OPEN": 100.5,
    "HIGH": 101.0,
    "LOW": 99.8,
    "CLOSE": 100.2,
    "VOLUME": 10000
  }
]
```

### 2. Obtener un registro por ID
- **Endpoint:** `GET /api/inv/getall?IdPrice={id}`
- **Descripción:** Recupera un registro específico basado en el ID proporcionado.
- **Ejemplo:**
```http
GET http://localhost:3333/api/inv/getall?IdPrice=4
```
- **Respuesta esperada:**
```json
{
  "ID": 4,
  "DATE": "2025-03-29T00:00:00Z",
  "OPEN": 102.3,
  "HIGH": 103.5,
  "LOW": 101.7,
  "CLOSE": 102.8,
  "VOLUME": 15000
}
```

### 3. Agregar un nuevo historial de precios
- **Endpoint:** `POST /api/inv/addone`
- **Descripción:** Agrega un nuevo registro al historial de precios.
- **Ejemplo de solicitud:**
```http
POST http://localhost:3333/api/inv/addone
Content-Type: application/json
```
```json
{
  "prices": {
    "ID": 5,
    "DATE": "2025-04-01T00:00:00Z",
    "OPEN": 105.2,
    "HIGH": 106.3,
    "LOW": 104.8,
    "CLOSE": 105.7,
    "VOLUME": 12000
  }
}
```
- **Respuesta esperada:**
```json
{
  "message": "Registro agregado exitosamente",
  "data": {
    "ID": 5,
    "DATE": "2025-04-01T00:00:00Z",
    "OPEN": 105.2,
    "HIGH": 106.3,
    "LOW": 104.8,
    "CLOSE": 105.7,
    "VOLUME": 12000
  }
}
```

---

## Notas Adicionales
- Asegúrate de que **MongoDB** esté corriendo antes de iniciar la API.
- Puedes utilizar herramientas como **Postman** o **Insomnia** para probar los endpoints.
- Para modificar la configuración de la API, revisa los archivos en `src/api/`.

---

