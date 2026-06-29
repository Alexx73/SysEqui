/**
 * @swagger
 * tags:
 *   name: Equivalencias Completadas
 *   description: Endpoints para la gestión de equivalencias completadas
 */

/**
 * @swagger
 * /completadas:
 *   get:
 *     tags: [Equivalencias Completadas]
 *     summary: Obtiene la lista de equivalencias completadas
 *     responses:
 *       200:
 *         description: Lista de equivalencias completadas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   year:
 *                     type: number
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /completadas:
 *   post:
 *     tags: [Equivalencias Completadas]
 *     summary: Crea una nueva equivalencia completada
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - year
 *             properties:
 *               name:
 *                 type: string
 *                 description: El nombre de la equivalencia
 *                 example: "Matemáticas"
 *               year:
 *                 type: number
 *                 description: El año de la equivalencia
 *                 example: 2
 *     responses:
 *       201:
 *         description: Equivalencia creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 year:
 *                   type: number
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Error en los datos enviados
 */

/**
 * @swagger
 * /completadas/{id}:
 *   get:
 *     tags: [Equivalencias Completadas]
 *     summary: Obtiene una equivalencia completada por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la equivalencia completada
 *     responses:
 *       200:
 *         description: Detalles de la equivalencia completada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 year:
 *                   type: number
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Equivalencia no encontrada
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /completadas/{id}:
 *   put:
 *     tags: [Equivalencias Completadas]
 *     summary: Actualiza una equivalencia completada por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la equivalencia completada
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nuevo nombre de la equivalencia
 *               year:
 *                 type: number
 *                 description: Nuevo año de la equivalencia
 *     responses:
 *       200:
 *         description: Equivalencia actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 year:
 *                   type: number
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Equivalencia no encontrada
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /completadas/{id}:
 *   delete:
 *     tags: [Equivalencias Completadas]
 *     summary: Elimina una equivalencia completada por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la equivalencia completada
 *     responses:
 *       200:
 *         description: Equivalencia eliminada exitosamente
 *       404:
 *         description: Equivalencia no encontrada
 *       500:
 *         description: Error interno del servidor
 */
