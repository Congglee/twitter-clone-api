import { Router } from 'express'
import {
  serveImageController,
  serveM3u8Controller,
  serveSegmentController,
  serveVideoStreamController
} from '~/controllers/medias.controllers'

const staticRouter = Router()

staticRouter.get('/image/:name', serveImageController)

staticRouter.get('/video-stream/:name', serveVideoStreamController)

/**
 * @swagger
 * /static/video-hls/{id}/master.m3u8:
 *   get:
 *     tags:
 *       - static
 *     summary: Serve M3U8 file
 *     description: Serve the M3U8 file of a video by its ID
 *     operationId: serveVideoHLS
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           example: oHP9OixAX-5pnAXnL6QFk
 *         description: The ID of the video to be served
 *     responses:
 *       '200':
 *         description: Video served successfully
 *         content:
 *           application/vnd.apple.mpegurl:
 *             schema:
 *               type: string
 *               format: binary
 *       '404':
 *         description: Video not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Not found
 */
staticRouter.get('/video-hls/:id/master.m3u8', serveM3u8Controller)

/**
 * @swagger
 * /static/video-hls/{id}/{v}/{segment}:
 *   get:
 *     tags:
 *       - static
 *     summary: Serve video segment
 *     description: Serve the video segment of a video by its ID, version, and segment
 *     operationId: serveVideoSegment
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           example: oHP9OixAX-5pnAXnL6QFk
 *         description: The ID of the video to be served
 *       - name: v
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           example: 0
 *         description: The version of the video to be served
 *       - name: segment
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           example: 0.ts
 *         description: The segment of the video to be served
 *     responses:
 *       '200':
 *         description: Video segment served successfully
 *         content:
 *           application/vnd.apple.mpegurl:
 *             schema:
 *               type: string
 *               format: binary
 *       '404':
 *         description: Video not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Not found
 */
staticRouter.get('/video-hls/:id/:v/:segment', serveSegmentController)

export default staticRouter
