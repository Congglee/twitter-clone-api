import { NextFunction, Request, Response } from 'express'
import path from 'path'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '~/config/dir'
import HTTP_STATUS from '~/config/httpStatus'
import { MEDIAS_MESSAGES } from '~/config/messages'
import mediasService from '~/services/medias.services'
import fs from 'fs'

export const uploadImageController = async (req: Request, res: Response, next: NextFunction) => {
  const url = await mediasService.uploadImage(req)
  return res.json({ message: MEDIAS_MESSAGES.UPLOAD_SUCCESS, result: url })
}

export const uploadVideoController = async (req: Request, res: Response, next: NextFunction) => {
  const url = await mediasService.uploadVideo(req)
  return res.json({ message: MEDIAS_MESSAGES.UPLOAD_SUCCESS, result: url })
}

export const uploadVideoHLSController = async (req: Request, res: Response, next: NextFunction) => {
  const url = await mediasService.uploadVideoHLS(req)
  return res.json({ message: MEDIAS_MESSAGES.UPLOAD_SUCCESS, result: url })
}

export const serveImageController = (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.params
  return res.sendFile(path.resolve(UPLOAD_IMAGE_DIR, name), (err) => {
    if (err) {
      res.status((err as any).status).send('Not found')
    }
  })
}

/*
 * Format of header Content-Range: bytes <start>-<end>/<videoSize>
 * For example: Content-Range: bytes 1048576-3145727/3145728
 * The requirement is that `end` must always be less than `videoSize`
 * ❌ 'Content-Range': 'bytes 0-100/100'
 * ✅ 'Content-Range': 'bytes 0-99/100'
 *
 * Content-Length will be end - start + 1. Represents distance.
 * To make it easier to imagine, imagine that from 0 to 10, we have 11 numbers.
 * Bytes are similar, if start = 0, end = 10 then we have 11 bytes.
 * The formula is end - start + 1
 *
 * ChunkSize = 50
 * VideoSize = 100
 * |0----------------50|51----------------99|100 (end)
 * Stream 1: start = 0, end = 50, contentLength = 51
 * Stream 2: start = 51, end = 99, contentLength = 49
 */

export const serveVideoStreamController = async (req: Request, res: Response, next: NextFunction) => {
  const mime = (await import('mime')).default
  const range = req.headers.range
  if (!range) {
    return res.status(HTTP_STATUS.BAD_REQUEST).send('Requires Range header')
  }

  const { name } = req.params
  const videoPath = path.resolve(UPLOAD_VIDEO_DIR, name) // Path to video
  const videoSize = fs.statSync(videoPath).size // Size of video
  const chunkSize = 10 ** 6 // 1MB
  const start = Number(range.replace(/\D/g, '')) // Get start byte from Range header (ex: bytes=1048576-)
  const end = Math.min(start + chunkSize, videoSize - 1) // Get end byte from Range header (ex: bytes=1048576-2097151), if exceed videoSize then get videoSize

  const contentLength = end - start + 1 // Calculate actual size for each video stream chunk, usually is chunkSize, except for the last chunk
  const contentType = mime.getType(videoPath) || 'video/*' // Get content type of video
  const headers = {
    'Content-Range': `bytes ${start}-${end}/${videoSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': contentLength,
    'Content-Type': contentType
  }

  res.writeHead(HTTP_STATUS.PARTIAL_CONTENT, headers)

  const videoStreams = fs.createReadStream(videoPath, { start, end })
  videoStreams.pipe(res)
}

export const serveM3u8Controller = (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params

  return res.sendFile(path.resolve(UPLOAD_VIDEO_DIR, id, 'master.m3u8'), (err) => {
    if (err) {
      res.status((err as any).status).send('Not found')
    }
  })
}

export const serveSegmentController = (req: Request, res: Response, next: NextFunction) => {
  const { id, v, segment } = req.params
  // segment: master.m3u8, video_0.ts, video_1.ts, video_2.ts, ...

  return res.sendFile(path.resolve(UPLOAD_VIDEO_DIR, id, v, segment), (err) => {
    if (err) {
      res.status((err as any).status).send('Not found')
    }
  })
}

export const videoStatusController = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params
  const result = await mediasService.getVideoStatus(id as string)

  return res.json({ message: MEDIAS_MESSAGES.GET_VIDEO_STATUS_SUCCESS, result })
}
