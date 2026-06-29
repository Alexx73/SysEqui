/**
 * @swagger
 * tags:
 *   name: Equivalencias Pendientes
 *   description: Endpoints para la gestión de equivalencias pendientes
 */

/**
 * @swagger
 * /pendientes:
 *   get:
 *     tags: [Equivalencias Pendientes]
 *     summary: Obtiene la lista de equivalencias pendientes
 *     responses:
 *       200:
 *         description: Lista de equivalencias pendientes
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
 * /pendientes:
 *   post:
 *     tags: [Equivalencias Pendientes]
 *     summary: Crea una nueva equivalencia pendiente
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
 * /pendientes/{id}:
 *   get:
 *     tags: [Equivalencias Pendientes]
 *     summary: Obtiene una equivalencia pendiente por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la equivalencia pendiente
 *     responses:
 *       200:
 *         description: Detalles de la equivalencia pendiente
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
 * /pendientes/{id}:
 *   put:
 *     tags: [Equivalencias Pendientes]
 *     summary: Actualiza una equivalencia pendiente por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la equivalencia pendiente
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
 * /pendientes/{id}:
 *   delete:
 *     tags: [Equivalencias Pendientes]
 *     summary: Elimina una equivalencia pendiente por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la equivalencia pendiente
 *     responses:
 *       200:
 *         description: Equivalencia eliminada exitosamente
 *       404:
 *         description: Equivalencia no encontrada
 *       500:
 *         description: Error interno del servidor
 */
