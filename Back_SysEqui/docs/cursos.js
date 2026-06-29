/**
 * @swagger
 * tags:
 *   name: cursos
 *   description: Endpoints para la gestión de cursos
 */

// GET - /cursos
/**
 * @swagger
 * /cursos:
 *   get:
 *     tags: [cursos]
 *     summary: Obtiene la lista de todos los cursos
 *     responses:
 *       200:
 *         description: Lista de cursos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cursos:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "64a1b2c3d4e5f6a7b8c9d0e1"
 *                       idMateria:
 *                         type: string
 *                         example: "64a1b2c3d4e5f6a7b8c9d0e2"
 *                       docentesEncargados:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["64a1b2c3d4e5f6a7b8c9d0e3"]
 *                       alumnos:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             idAlumno:
 *                               type: string
 *                             nota:
 *                               type: integer
 *                               minimum: 1
 *                               maximum: 10
 *                       shift:
 *                         type: string
 *                         example: "diurno"
 *                       fechaInicio:
 *                         type: string
 *                         format: date-time
 *                       fechaEstimadaFin:
 *                         type: string
 *                         format: date-time
 *       500:
 *         description: Error interno del servidor
 */

// POST - /cursos
/**
 * @swagger
 * /cursos:
 *   post:
 *     tags: [cursos]
 *     summary: Crea un nuevo curso
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idMateria
 *             properties:
 *               idMateria:
 *                 type: string
 *                 description: ID de la materia asociada
 *                 example: "64a1b2c3d4e5f6a7b8c9d0e2"
 *               docentesEncargados:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: IDs de los docentes a cargo
 *                 example: ["64a1b2c3d4e5f6a7b8c9d0e3"]
 *               alumnos:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: IDs de los alumnos inscriptos
 *                 example: []
 *               fechaInicio:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-03-01T00:00:00.000Z"
 *               fechaEstimadaFin:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-12-01T00:00:00.000Z"
 *               shift:
 *                 type: string
 *                 enum: [diurno, vespertino, nocturno]
 *                 example: "diurno"
 *     responses:
 *       201:
 *         description: Curso creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Curso creado"
 *       400:
 *         description: Datos inválidos (idMateria faltante o materia inexistente)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "El id de la materia es obligatorio"
 *       500:
 *         description: Error interno del servidor
 */

// GET - /cursos/searchByProfessor/:id
/**
 * @swagger
 * /cursos/searchByProfessor/{id}:
 *   get:
 *     tags: [cursos]
 *     summary: Obtiene los cursos a cargo de un docente
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del docente (UsersProfile)
 *         example: "64a1b2c3d4e5f6a7b8c9d0e3"
 *     responses:
 *       200:
 *         description: Lista de cursos del docente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cursos:
 *                   type: array
 *                   items:
 *                     type: object
 *       404:
 *         description: No se encontraron cursos para ese docente
 *       500:
 *         description: Error interno del servidor
 */

// GET - /cursos/:id
/**
 * @swagger
 * /cursos/{id}:
 *   get:
 *     tags: [cursos]
 *     summary: Obtiene un curso por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del curso
 *         example: "64a1b2c3d4e5f6a7b8c9d0e1"
 *     responses:
 *       200:
 *         description: Datos del curso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 curso:
 *                   type: object
 *       404:
 *         description: Curso no encontrado
 *       500:
 *         description: Error interno del servidor
 */

// PATCH - /cursos/:id
/**
 * @swagger
 * /cursos/{id}:
 *   patch:
 *     tags: [cursos]
 *     summary: Actualiza los datos de un curso
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del curso
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               idMateria:
 *                 type: string
 *               docentesEncargados:
 *                 type: array
 *                 items:
 *                   type: string
 *               alumnos:
 *                 type: array
 *                 items:
 *                   type: string
 *               fechaInicio:
 *                 type: string
 *                 format: date-time
 *               fechaEstimadaFin:
 *                 type: string
 *                 format: date-time
 *               shift:
 *                 type: string
 *                 enum: [diurno, vespertino, nocturno]
 *     responses:
 *       200:
 *         description: Curso actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Curso actualizado"
 *       404:
 *         description: Curso no encontrado
 *       500:
 *         description: Error interno del servidor
 */

// DELETE - /cursos/:id
/**
 * @swagger
 * /cursos/{id}:
 *   delete:
 *     tags: [cursos]
 *     summary: Elimina un curso por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del curso
 *     responses:
 *       200:
 *         description: Curso eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Curso eliminado"
 *       404:
 *         description: Curso no encontrado
 *       500:
 *         description: Error interno del servidor
 */

// PATCH - /cursos/assignNote/:id
/**
 * @swagger
 * /cursos/assignNote/{id}:
 *   patch:
 *     tags: [cursos]
 *     summary: Asigna o actualiza la nota de un alumno en un curso
 *     description: >
 *       Asigna una nota entera (1–10) a un alumno inscripto en el curso.
 *       Si el alumno ya tiene nota, solo un usuario con rol `admin` puede modificarla (403 para otros roles).
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del curso
 *         example: "64a1b2c3d4e5f6a7b8c9d0e1"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idAlumno
 *               - nota
 *             properties:
 *               idAlumno:
 *                 type: string
 *                 description: ID del alumno (debe ser un ObjectId válido e inscripto en el curso)
 *                 example: "64a1b2c3d4e5f6a7b8c9d0e4"
 *               nota:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *                 description: Nota entera entre 1 y 10
 *                 example: 8
 *     responses:
 *       200:
 *         description: Nota asignada. Si nota >= 6 se genera una equivalencia completada automáticamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 curso:
 *                   type: object
 *       400:
 *         description: Campos faltantes, nota fuera de rango (0–10), nota no entera, o idAlumno inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "El idAlumno no es un ObjectId válido"
 *       403:
 *         description: El alumno ya tiene una nota y el solicitante no es administrador
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No puedes cambiar la nota de un alumno que ya tiene una nota asignada"
 *       404:
 *         description: Curso o alumno no encontrado en el curso
 *       500:
 *         description: Error interno del servidor
 */
