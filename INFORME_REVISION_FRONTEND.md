Hallazgos principales:

LoginPage.jsx
Tiene DNI precargado en hardcodedFormValues.
Hace console.log(formValues), exponiendo la contraseña.
Recomendación: iniciar vacío y quitar logs sensibles.

ProfilePage.jsx
El cambio de contraseña parece solo visual: no llama a un endpoint real.
Usa userData.password, algo que nunca debería estar disponible en frontend.
Recomendación: crear endpoint real de cambio de clave y validar en backend.

UsersAPI.js
getStaffByRole usa /staff:role, pero backend espera /staff/:role.
createStaff llama /createstaff, backend define /createStaff.
deleteUser no coincide con las rutas reales del backend.
ProfesoresPage.jsx llama UsersAPI.deleteStaffById, pero esa función no existe.

ProfesoresPage.jsx
Rol inicial: "profesor" pero backend espera "professor".
El campo DNI está deshabilitado incluso al crear staff, así que el formulario puede quedar inutilizable.

Rutas por rol
El navbar muestra /listaAlumnos para preceptor, pero la ruta está protegida solo para admin.
Recomendación: permitir esa ruta a preceptor o quitar el link.

Seguridad general
Se usan cookies con withCredentials, pero no vi protección CSRF para operaciones mutantes.
Recomendación: centralizar Axios en un apiClient, agregar interceptores y evaluar CSRF.

UX/calidad
Muchos alert() / window.confirm().
Textos con codificación rota: SesiÃ³n, ContraseÃ±a, AÃ±o.
ESLint está configurado para React 18.3 aunque el proyecto usa React 19.1.1.