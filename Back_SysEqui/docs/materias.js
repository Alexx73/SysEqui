/**
 * @swagger
 * tags:
 *   name: materias
 *   description: Endpoints para la cargar equivalencias como materia
 */

//GET - /materias
/**
 * @swagger
 * /materias:
 *   get:
 *     tags: [materias]
 *     summary: Obtiene la lista de materias disponibles
 *     responses:
 *       200:
 *         description: Información de todas las materias disponibles
 *       404:
 *         description: Materias no encontrados
 *       500:
 *         description: Error interno del servidor
 */

//POST - /materias
/**
 * @swagger
 * /materias:
 *   post:
 *     tags: [materias]
 *     summary: Crea una equivalencia
 *     description: Crea una equivalencia
 *     produces: application/json
 *     requestBody:
 *       description: Datos necesarios para crear una equivalencia
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - year
 *               - shift
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre de la materia
 *                 example: "Electrónica"
 *               year:
 *                 type: number
 *                 description: Año de la materia
 *                 example: 2021
 *               shift:
 *                 type: string
 *                 description: Turno de la materia
 *                 example: "diurno"
 *     responses:
 *       201:
 *         description: Equivalencia creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Mensaje de creación de equivalencia
 *                   example: "Equivalencia creada exitosamente"
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
 *                   example: "No se pudo crear la equivalencia. Intente nuevamente más tarde."
 */

//GET - /materias/{idMateria}
/**
 * @swagger
 * /materias/{idMateria}:
 *   get:
 *     tags: [materias]
 *     summary: Obtiene info de la materia
 *     parameters:
 *       - in: path
 *         name: idMateria
 *         required: true
 *         schema:
 *           type: string
 *         description: Id de la materia
 *     responses:
 *       200:
 *         description: Información de la materia
 *       404:
 *         description: Materia no encontrada
 *       500:
 *         description: Error interno del servidor
 */

//PATCH - /materias/{idMateria}
/**
 * @swagger
 * /materias/{idMateria}:
 *   patch:
 *     tags: [materias]
 *     summary: Actualiza la materia
 *     description: Actualiza la materia
 *     produces: application/json
 *     parameters:
 *       - in: path
 *         name: idMateria
 *         required: true
 *         schema:
 *           type: string
 *         description: Id de la materia
 *     requestBody:
 *       description: Datos necesarios para actualizar la materia
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - year
 *               - shift
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre de la materia
 *                 example: "Electrónica"
 *               year:
 *                 type: number
 *                 description: Año de la materia
 *                 example: 2021
 *               shift:
 *                 type: string
 *                 description: Turno de la materia
 *                 example: "diurno"
 *     responses:
 *       200:
 *         description: Materia actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Mensaje de actualización de materia
 *                   example: "Materia actualizada exitosamente"
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
 *                   example: "No se pudo actualizar la equivalencia. Intente nuevamente más tarde."
 */

//DELETE - /materias/{idMateria}
/**
 * @swagger
 * /materias/{idMateria}:
 *   delete:
 *     tags: [materias]
 *     summary: Baja lógica de la materia
 *     parameters:
 *       - in: path
 *         name: idMateria
 *         required: true
 *         schema:
 *           type: string
 *         description: Id de la materia
 *     responses:
 *       200:
 *         description: Materia eliminada lógicamente
 *       404:
 *         description: Materia no encontrada
 *       500:
 *         description: Error interno del servidor
 */

//PATCH - /materias/{idMateria}/activate
/**
 * @swagger
 * /materias/{idMateria}/activate:
 *   patch:
 *     tags: [materias]
 *     summary: Activa la materia
 *     description: Activa la materia
 *     produces: application/json
 *     parameters:
 *       - in: path
 *         name: idMateria
 *         required: true
 *         schema:
 *           type: string
 *         description: Id de la materia
 *     responses:
 *       200:
 *         description: Materia activada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Mensaje de activación de materia
 *                   example: "Materia activada exitosamente"
 *       404:
 *         description: Materia no encontrada
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
 *                   example: "No se pudo activar la equivalencia. Intente nuevamente más tarde."
 */
