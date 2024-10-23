import { Router } from 'express'
import {
  uploadImageController,
  uploadVideoController,
  uploadVideoHLSController,
  videoStatusController
} from '~/controllers/medias.controllers'
import { accessTokenValidator } from '~/middlewares/auth.middlewares'
import { verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const mediasRouter = Router()

/**
 * @swagger
 * /medias/upload-image:
 *   post:
 *     tags:
 *       - medias
 *     summary: Upload images
 *     description: Upload multiple images files (up to 4)
 *     operationId: uploadImage
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       description: Multiple image files to upload
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       '200':
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Upload successfully
 *                 result:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       url:
 *                         type: string
 *                       type:
 *                         $ref: '#/components/schemas/MediaType'
 *                   example:
 *                     [
 *                       {
 *                         'url': 'https://twitter-x-clone-v2-ap-southeast-1.s3.ap-southeast-1.amazonaws.com/images/0e556d18531409d9b22192001.jpg',
 *                         'type': 'Image'
 *                       },
 *                       {
 *                         'url': 'https://twitter-x-clone-v2-ap-southeast-1.s3.ap-southeast-1.amazonaws.com/images/0e556d18531409d9b22192002.jpg',
 *                         'type': 'Image'
 *                       },
 *                       {
 *                         'url': 'https://twitter-x-clone-v2-ap-southeast-1.s3.ap-southeast-1.amazonaws.com/images/b970c2dfa1fdd290398e8fb00.jpg',
 *                         'type': 'Image'
 *                       }
 *                     ]
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *       '403':
 *         $ref: '#/components/responses/UserNotVerifiedError'
 *       '500':
 *         $ref: '#/components/responses/FileError'
 */
mediasRouter.post(
  '/upload-image',
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(uploadImageController)
)

/**
 * @swagger
 * /medias/upload-video:
 *   post:
 *     tags:
 *       - medias
 *     summary: Upload video
 *     description: Upload a video file
 *     operationId: uploadVideo
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       description: Video file to upload
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               video:
 *                 type: string
 *                 format: binary
 *     responses:
 *       '200':
 *         description: Video uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Upload successfully
 *                 result:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       url:
 *                         type: string
 *                         example: https://twitter-x-clone-v2-ap-southeast-1.s3.ap-southeast-1.amazonaws.com/videos/RP7xgzZp0oTxZvJBZRQpZ.mp4
 *                       type:
 *                         $ref: '#/components/schemas/MediaType'
 *                         example: Video
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *       '403':
 *         $ref: '#/components/responses/UserNotVerifiedError'
 *       '500':
 *         $ref: '#/components/responses/FileError'
 */
mediasRouter.post(
  '/upload-video',
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(uploadVideoController)
)

/**
 * @swagger
 * /medias/upload-video-hls:
 *   post:
 *     tags:
 *       - medias
 *     summary: Upload video HLS
 *     description: Upload a video file with HLS format
 *     operationId: uploadVideoHLS
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       description: Video file to upload
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               video:
 *                 type: string
 *                 format: binary
 *     responses:
 *       '200':
 *         description: Video uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Upload successfully
 *                 result:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       url:
 *                         type: string
 *                         example: http://localhost:8000/static/video-hls/oHP9OixAX-5pnAXnL6QFk/master.m3u8
 *                       type:
 *                         $ref: '#/components/schemas/MediaType'
 *                         example: HLS
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *       '403':
 *         $ref: '#/components/responses/UserNotVerifiedError'
 *       '500':
 *         $ref: '#/components/responses/FileError'
 */
mediasRouter.post(
  '/upload-video-hls',
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(uploadVideoHLSController)
)

/**
 * @swagger
 * /medias/video-status/{id}:
 *   get:
 *     tags:
 *       - medias
 *     summary: Get video status by ID (HLS)
 *     description: Get the status of a video by its ID (HLS)
 *     operationId: getVideoStatus
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           example: oHP9OixAX-5pnAXnL6QFk
 *         description: The ID of the video to retrieve status
 *     responses:
 *       '200':
 *         description: Video status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Get video status successfully
 *                 result:
 *                   $ref: '#/components/schemas/VideoStatus'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *       '403':
 *         $ref: '#/components/responses/UserNotVerifiedError'
 */
mediasRouter.get(
  '/video-status/:id',
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(videoStatusController)
)

export default mediasRouter
