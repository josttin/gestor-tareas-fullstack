Gestor de Tareas y Equipos - Aplicación Full-Stack
🚀 Demo en Vivo
Accede a la aplicación desplegada aquí: https://gestor-tareas-fullstack-sigma.vercel.app

📋 Descripción General del Proyecto
Gestor de Tareas y Equipos es una aplicación web completa diseñada para centralizar y optimizar la gestión de proyectos en un entorno empresarial. La plataforma ofrece una solución robusta para la asignación de responsabilidades, el seguimiento del progreso y la comunicación interna, todo ello a través de una interfaz intuitiva y diferenciada por roles.

El sistema se estructura en torno a dos tipos de usuarios: Jefes y Empleados, cada uno con un dashboard y un conjunto de herramientas adaptadas a sus funciones. Mientras que los empleados se centran en la ejecución y el reporte de sus tareas, los jefes disponen de una visión panorámica del rendimiento del equipo, métricas visuales y herramientas de administración avanzadas.

Este proyecto fue desarrollado utilizando un stack tecnológico moderno, con un backend en Node.js/Express conectado a una base de datos PostgreSQL, y un frontend reactivo en Next.js/TypeScript desplegado en Vercel.

✨ Características Principales
Autenticación Segura: Sistema de registro e inicio de sesión basado en JSON Web Tokens (JWT).

Dashboard por Roles: Vistas completamente diferentes y personalizadas para Jefes y Empleados.

Gestión Completa de Tareas: Creación, asignación (individual o por departamento), seguimiento de estado y fechas límite.

Estructura Organizacional: Creación de departamentos, asignación de empleados y designación de líderes.

Métricas y Analíticas: El dashboard del jefe incluye gráficos interactivos para visualizar el rendimiento del equipo en tiempo real.

Agenda y Calendario Interactivo: Una herramienta para que los jefes gestionen sus compromisos personales y visualicen las cargas de trabajo y fechas de entrega.

Comunicación Centralizada: Sistema de comentarios y subida de archivos adjuntos en cada tarea.

Sistema de Solicitudes: Flujo de trabajo para que los empleados soliciten extensiones de plazo.

🔑 Roles y Credenciales para Probar
Para facilitar la exploración de la plataforma, puedes utilizar las siguientes credenciales de prueba. Se recomienda abrir dos navegadores diferentes (o uno en modo incógnito) para experimentar ambos roles simultáneamente.

Rol	Correo Electrónico	Contraseña
👑 Jefe	Jefe@empresa.com	123456789
🧑‍💼 Empleado	empleado@empresa.com	123456789

Exportar a Hojas de cálculo
📚 Guía de Uso Detallada
A continuación, se explica paso a paso cómo utilizar cada una de las funcionalidades de la aplicación.

1. Registro e Inicio de Sesión
Cualquier nuevo visitante puede crear una cuenta.

Crear una cuenta nueva:

Ve a la página principal y haz clic en el enlace "Regístrate aquí".

Completa el formulario con tu nombre completo, email y contraseña.

Al registrarte, serás creado automáticamente con el rol de Empleado.

Serás redirigido a la página de login para iniciar sesión.

Iniciar Sesión:

Introduce las credenciales (puedes usar las de prueba de arriba).

Al entrar, la aplicación te redirigirá automáticamente al dashboard correspondiente a tu rol.

2. El Dashboard del Jefe 👑
El jefe tiene acceso a todas las herramientas de gestión y visualización.

Métricas Generales
En la parte superior, encontrarás cuatro gráficos que ofrecen una visión instantánea del estado del equipo:

Tareas por Estado: Un gráfico de pastel que muestra la proporción de tareas pendientes, en progreso y completadas.

Completadas por Empleado: Un gráfico de barras que muestra cuántas tareas ha completado cada empleado.

Tareas por Departamento: Un gráfico de barras que compara la cantidad de tareas asignadas a cada departamento.

Tiempo Promedio por Tarea: Un gráfico que indica las horas promedio que tardan los empleados en completar una tarea.

Agenda y Vencimientos
Este calendario interactivo es el centro de mando del jefe:

Visualización de Eventos: Los días con eventos se marcan con puntos de colores:

🔵 Azul: Vencimiento de una o más tareas.

🟢 Verde: Compromiso personal del jefe.

🟡 Amarillo: Permiso de ausencia de un empleado (próximamente).

Ver Detalles: Haz clic en cualquier día con puntos para abrir una ventana emergente con la lista detallada de los eventos de esa fecha.

Añadir Compromisos: (Funcionalidad futura) Desde la ventana de detalles, el jefe podrá añadir notas o eventos personales a su calendario.

Gestión de Tareas
Crear una Tarea:

Utiliza el formulario en la sección "Gestión de Tareas".

Puedes asignar la tarea directamente a un Empleado o a un Departamento completo.

Añade un título, una descripción y una fecha límite opcional.

Filtrar Tareas: Usa los menús desplegables para filtrar la lista de tareas por un empleado o departamento específico, facilitando el seguimiento.

Gestión de Empleados
Asignar Departamento: En esta tabla, puedes asignar o cambiar a un empleado de departamento de forma rápida usando el menú desplegable junto a su nombre.

Administrar Usuarios: El botón "Administrar Usuarios" te lleva a una página dedicada donde puedes:

Editar los datos de cualquier usuario (nombre, email, rol).

Ascender a un Empleado al rol de Jefe.

Eliminar usuarios del sistema.

Gestión de Departamentos
Crear un Departamento: Simplemente escribe el nombre en el campo de texto y haz clic en "Crear".

Asignar Líder: Para cada departamento, puedes designar a un usuario como líder desde el menú desplegable.

Eliminar un Departamento: Puedes eliminar departamentos que ya no sean necesarios.

Gestión de Solicitudes
En esta sección, verás las solicitudes de extensión de plazo de los empleados.

Revisa el motivo y la fecha sugerida por el empleado.

Haz clic en "Aprobar". Puedes aceptar la fecha sugerida o establecer una nueva fecha límite.

Haz clic en "Rechazar" si la solicitud no es válida.

3. El Dashboard del Empleado 🧑‍💼
La vista del empleado está diseñada para la productividad y el enfoque en sus responsabilidades.

Mis Tareas Asignadas
Esta es la lista principal de tareas que el empleado debe realizar.

Actualizar Estado: El empleado puede cambiar el estado de sus tareas (Pendiente, En Progreso, Completada) usando el menú desplegable. Este cambio se refleja inmediatamente en el dashboard del jefe.

Solicitar Extensión: Si una tarea requiere más tiempo, el empleado puede hacer clic en "Solicitar Extensión", llenar un motivo y proponer una nueva fecha. La solicitud se enviará al jefe para su aprobación.

Tareas de Mi Departamento
Si el empleado pertenece a un departamento, aquí verá todas las tareas asignadas a su equipo. Esto fomenta la colaboración, ya que puede ver en qué están trabajando sus compañeros.

Mis Solicitudes
En esta sección, el empleado puede ver el historial de todas las solicitudes que ha enviado y verificar si fueron aprobadas o rechazadas.

4. Página de Detalle de Tarea (Ambos Roles)
Tanto jefes como empleados pueden hacer clic en el título de cualquier tarea para acceder a su página de detalle.

Ver Información Completa: Muestra la descripción completa, el estado, la fecha límite y a quién está asignada.

Añadir Comentarios: Es el canal de comunicación principal para una tarea. Aquí se pueden dejar actualizaciones, hacer preguntas o discutir detalles.

Adjuntar Archivos: Se pueden subir documentos, imágenes u otros archivos relevantes para la tarea, los cuales se almacenan de forma segura en la nube.

💻 Stack Tecnológico
Frontend: Next.js, React, TypeScript, Tailwind CSS, shadcn/ui, Radix UI, Recharts, Axios.

Backend: Node.js, Express.js, PostgreSQL, JWT, Bcrypt.js, Cloudinary, Multer.

Despliegue: Vercel (Frontend), Render (Backend y Base de Datos).

Desarrollo: Docker, Docker Compose, Nodemon.
