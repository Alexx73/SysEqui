/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Endpoints para la gestión de usuarios
 */

//GET - /users
/**
 * @swagger
 * /users:
 *   get:
 *     tags: [Users]
 *     summary: Obtiene la información de todos los usuarios
 *     responses:
 *       200:
 *         description: Información de todos los usuarios
 *       404:
 *         description: Usuarios no encontrados
 *       500:
 *         description: Error interno del servidor
 */

//GET - /users/profile
/**
 * @swagger
 * /users/profile:
 *   get:
 *     tags: [Users]
 *     summary: Obtiene el perfil del usuario autenticado
 *     responses:
 *       200:
 *         description: Perfil del usuario autenticado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     dni:
 *                       type: string
 *                       example: 12345678
 *                     name:
 *                       type: string
 *                       example: Juan Perez
 *                     email:
 *                       type: string
 *                       example: juanperez@email.com
 *                     phone:
 *                       type: string
 *                       example: 123456789
 *                     lastname:
 *                       type: string
 *                       example: Perez
 *                     role:
 *                       type: string
 *                       example: user
 *       404:
 *         description: Usuario no autenticado
 *       500:
 *         description: Error interno del servidor
 */

//PATCH - /users/profile
/**
 * @swagger
 * /users/profile:
 *   patch:
 *     tags: [Users]
 *     summary: Actualiza el perfil del usuario autenticado
 *     description: Actualiza el perfil del usuario autenticado
 *     produces: application/json
 *     requestBody:
 *       description: Datos necesarios para actualizar el perfil del usuario
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             one of:
 *               - name
 *               - lastname
 *               - email
 *               - phone
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre del usuario
 *                 example: "Juan"
 *               lastname:
 *                 type: string
 *                 description: Apellido del usuario
 *                 example: "Pérez"
 *               email:
 *                 type: string
 *                 description: Dirección de correo electrónico UNICO del usuario
 *                 example: "usuario@example.com"
 *               phone:
 *                 type: string
 *                 description: Número de celular
 *                 example: "+541112345678"
 *     responses:
 *       200:
 *         description: Perfil actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Mensaje de perfil actualizado
 *                   example: "Perfil actualizado"
 *       400:
 *         description: Error en los datos proporcionados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Mensaje de error
 *                   example: "Debes completar al menos un campo"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Mensaje de error
 *                   example: "No se pudo actualizar el perfil del usuario. Intente nuevamente más tarde."
 *       404:
 *         description: Usuario no autenticado
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               error:
 *                 type: string
 *                 description: Mensaje de error
 *                 example: "No se pudo procesar la solicitud. Intente nuevamente más tarde."
 */

//PATCH - /users/profile/password
/**
 * @swagger
 * /users/profile/password:
 *   patch:
 *     tags: [Users]
 *     summary: Actualiza la contraseña del usuario autenticado
 *     description: Valida la contraseña actual y guarda una nueva contraseña hasheada
 *     produces: application/json
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: Contraseña actual del usuario
 *                 example: "strongP@ssw0rd"
 *               newPassword:
 *                 type: string
 *                 description: Nueva contraseña del usuario
 *                 example: "newStrongP@ssw0rd1"
 *               confirmPassword:
 *                 type: string
 *                 description: Confirmación de la nueva contraseña
 *                 example: "newStrongP@ssw0rd1"
 *     responses:
 *       200:
 *         description: Contraseña actualizada exitosamente
 *       400:
 *         description: Datos incompletos, contraseña inválida o confirmación incorrecta
 *       401:
 *         description: Contraseña actual incorrecta
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */

//POST - /users/register
/**
 * @swagger
 * /users/register:
 *   post:
 *     tags: [Users]
 *     summary: Registra un nuevo usuario
 *     description: Registra un nuevo usuario en la base de datos
 *     produces: application/json
 *     requestBody:
 *       description: Datos necesarios para registrar un nuevo usuario
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dni
 *               - password
 *               - email
 *               - name
 *               - lastname
 *             properties:
 *               dni:
 *                 type: number
 *                 description: Documento Nacional de Identidad único del usuario
 *                 example: 12345678
 *                 unique: true
 *               password:
 *                 type: string
 *                 description: Contraseña del usuario (mínimo 8 caracteres), debe incluir al menos una letra mayúscula, una letra minúscula, un número y un carácter especial
 *                 example: "strongP@ssw0rd"
 *               email:
 *                 type: string
 *                 description: Dirección de correo electrónico UNICO del usuario
 *                 example: "usuario@example.com"
 *               name:
 *                 type: string
 *                 description: Nombre del usuario
 *                 example: "Juan"
 *               lastname:
 *                 type: string
 *                 description: Apellido del usuario
 *                 example: "Pérez"
 *               cellphone:
 *                 type: string
 *                 description: Número de celular (opcional)
 *                 example: "+541112345678"
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Mensaje de creación de usuario
 *                   example: "Usuario creado exitosamente"
 *       400:
 *         description: Error en los datos proporcionados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Mensaje de error
 *                   example: "Todos los campos obligatorios deben ser completados."
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Mensaje de error
 *                   example: "No se pudo registrar el usuario. Intente nuevamente más tarde."
 */

//POST - /users/login
/**
 * @swagger
 * /users/login:
 *   post:
 *     tags: [Users]
 *     summary: Inicia sesión un usuario
 *     description: Permite a un usuario registrado iniciar sesión proporcionando sus credenciales
 *     produces: application/json
 *     requestBody:
 *       description: Credenciales necesarias para iniciar sesión
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dni
 *               - password
 *             properties:
 *               dni:
 *                 type: number
 *                 description: Documento Nacional de Identidad del usuario
 *                 example: 12345678
 *               password:
 *                 type: string
 *                 description: Contraseña del usuario
 *                 example: "strongP@ssw0rd"
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   description: Nombre del usuario
 *                   example: "Juan"
 *                 lastname:
 *                   type: string
 *                   description: Apellido del usuario
 *                   example: "Pérez"
 *                 email:
 *                   type: string
 *                   description: Dirección de correo electrónico UNICO del usuario
 *                   example: "usuario@example.com"
 *                 phone:
 *                   type: string
 *                   description: Número de celular
 *                   example: "+541112345678"
 *                 role:
 *                   type: string
 *                   description: Rol del usuario
 *                   example: "user"
 *                 dni:
 *                   type: number
 *                   description: DNI del usuario
 *                   example: 12345678
 *       400:
 *         description: Datos incompletos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Mensaje de error
 *                   example: "DNI y contraseña son obligatorios"
 *       401:
 *         description: Error en las credenciales proporcionadas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Mensaje de error
 *                   example: "Credenciales inválidas o cuenta inactiva."
 *       429:
 *         description: Demasiados intentos fallidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Mensaje de error
 *                   example: "Demasiados intentos fallidos. Intente más tarde."
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Mensaje de error
 *                   example: "No se pudo procesar la solicitud. Intente nuevamente más tarde."
 */

//POST - /users/logout
/**
 * @swagger
 * /users/logout:
 *   post:
 *     tags: [Users]
 *     summary: Cierra la sesión del usuario
 *     description: Cierra la sesión del usuario
 *     produces: application/json
 *     responses:
 *       200:
 *         description: Sesión finalizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Mensaje de sesión finalizada
 *                   example: "Sesión finalizada"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Mensaje de error
 *                   example: "No se pudo procesar la solicitud. Intente nuevamente más tarde."
 */

//GET - /users/unauth
/**
 * @swagger
 * /users/unauth:
 *   get:
 *     tags: [Users]
 *     summary: Obtiene la información de todos los usuarios no autenticados
 *     responses:
 *       200:
 *         description: Información de todos los usuarios no autenticados
 *       404:
 *         description: Usuarios no encontrados
 *       500:
 *         description: Error interno del servidor
 */

//POST - /users/unauth
/**
 * @swagger
 * /users/unauth:
 *   post:
 *     tags: [Users]
 *     summary: Valida un usuario no autenticado
 *     description: Valida un usuario no autenticado
 *     produces: application/json
 *     requestBody:
 *       description: Datos necesarios para validar un usuario no autenticado
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - accountId
 *             properties:
 *               accountId:
 *                 type: ObjectId
 *                 description: Referencia al usuario no autenticado
 *                 example: "5f8d9f1d8a6d5c0008b459b0"
 *     responses:
 *       201:
 *         description: Usuario validado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Mensaje de validación de usuario
 *                   example: "Usuario validado"
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Mensaje de error
 *                   example: "No se pudo validar el usuario. Intente nuevamente más tarde."
 */

//GET - /users/{dni}
/**
 * @swagger
 * /users/{dni}/request-password-reset:
 *   post:
 *     tags: [Users]
 *     summary: Solicita el cambio obligatorio de contraseña durante 24 horas (solo admin)
 *     parameters:
 *       - in: path
 *         name: dni
 *         required: true
 *         schema: { type: number }
 *     responses:
 *       200: { description: Restablecimiento solicitado }
 *       400: { description: DNI inválido o cuenta inactiva }
 *       403: { description: Sin permiso o cuenta administrativa }
 *       404: { description: Usuario no encontrado }
 */

/**
 * @swagger
 * /users/complete-password-reset:
 *   post:
 *     tags: [Users]
 *     security: []
 *     summary: Guarda la contraseña nueva de una solicitud vigente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [dni, newPassword, confirmPassword]
 *             properties:
 *               dni: { type: number }
 *               newPassword: { type: string, minLength: 8, maxLength: 20 }
 *               confirmPassword: { type: string }
 *     responses:
 *       200: { description: Contraseña restablecida }
 *       400: { description: Datos o contraseña inválidos }
 *       404: { description: Usuario no encontrado }
 *       409: { description: No hay solicitud pendiente }
 *       410: { description: Solicitud vencida }
 */

//GET - /users/{dni}
/**
 * @swagger
 * /users/{dni}:
 *   get:
 *     tags: [Users]
 *     summary: Obtiene información del usuario por DNI
 *     parameters:
 *       - in: path
 *         name: dni
 *         required: true
 *         schema:
 *           type: number
 *         description: DNI del usuario
 *     responses:
 *       200:
 *         description: Información del usuario
 *       404:
 *         description: Usuario no encontrado
 */

//DELETE - /users/{dni}
/**
 * @swagger
 * /users/{dni}:
 *   delete:
 *     tags: [Users]
 *     summary: Baja lógica de un usuario por DNI
 *     parameters:
 *       - in: path
 *         name: dni
 *         required: true
 *         schema:
 *           type: number
 *         description: DNI del usuario
 *     responses:
 *       200:
 *         description: Usuario eliminado lógicamente
 *       404:
 *         description: Usuario no encontrado
 */
