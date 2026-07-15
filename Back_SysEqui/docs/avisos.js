/**
 * @swagger
 * tags:
 *   name: avisos
 *   description: Avisos mostrados en la página de inicio
 * components:
 *   schemas:
 *     Aviso:
 *       type: object
 *       properties:
 *         _id: { type: string }
 *         titulo: { type: string, maxLength: 120 }
 *         contenido: { type: string, maxLength: 2000 }
 *         activo: { type: boolean }
 *         autor: { type: string }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 */

/**
 * @swagger
 * /avisos:
 *   get:
 *     tags: [avisos]
 *     summary: Lista los avisos visibles; los administradores reciben también los inactivos
 *     responses:
 *       200: { description: Lista de avisos }
 *       401: { description: Sesión requerida }
 *   post:
 *     tags: [avisos]
 *     summary: Crea un aviso (solo administrador)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [titulo, contenido]
 *             properties:
 *               titulo: { type: string, maxLength: 120 }
 *               contenido: { type: string, maxLength: 2000 }
 *               activo: { type: boolean, default: true }
 *     responses:
 *       201: { description: Aviso creado }
 *       400: { description: Datos inválidos }
 *       403: { description: Solo administradores }
 */

/**
 * @swagger
 * /avisos/{id}:
 *   patch:
 *     tags: [avisos]
 *     summary: Modifica un aviso (solo administrador)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo: { type: string, maxLength: 120 }
 *               contenido: { type: string, maxLength: 2000 }
 *               activo: { type: boolean }
 *     responses:
 *       200: { description: Aviso actualizado }
 *       400: { description: Datos o identificador inválidos }
 *       403: { description: Solo administradores }
 *       404: { description: Aviso no encontrado }
 *   delete:
 *     tags: [avisos]
 *     summary: Elimina un aviso (solo administrador)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Aviso eliminado }
 *       400: { description: Identificador inválido }
 *       403: { description: Solo administradores }
 *       404: { description: Aviso no encontrado }
 */
