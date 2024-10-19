import { Request } from 'express'
import path from 'path'
import sharp from 'sharp'
import { getFiles, getNameFromFullname, handleUploadImage, handleUploadVideo } from '~/utils/file'
import fsPromise from 'fs/promises'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '~/config/dir'
import { isProduction } from '~/config/config'
import { encodeHLSWithMultipleVideoStreams } from '~/utils/video'
import prisma from '~/client'
import { EncodingStatus, MediaType } from '@prisma/client'
import { uploadFileToS3 } from '~/utils/s3'
import { CompleteMultipartUploadCommandOutput } from '@aws-sdk/client-s3'
import { TweetMedia } from '~/types/tweets.types'
import { rimrafSync } from 'rimraf'

// * A Queue class to process encode video task in order
// * And avoid multiple encoding at the same time
class Queue {
  items: string[]
  encoding: boolean

  constructor() {
    this.items = []
    this.encoding = false
  }

  async enqueue(item: string) {
    this.items.push(item) // item = /path/to/video.mp4

    const idName = getNameFromFullname(
      item.includes('\\') ? (item.split('\\').pop() as string) : (item.split('/').pop() as string)
    )

    await prisma.videoStatus.create({
      data: { name: idName, status: EncodingStatus.Pending }
    })

    this.processEncode()
  }
  async processEncode() {
    const mime = (await import('mime')).default

    if (this.encoding) return

    if (this.items.length > 0) {
      this.encoding = true
      const videoPath = this.items[0]
      const idName = getNameFromFullname(
        videoPath.includes('\\') ? (videoPath.split('\\').pop() as string) : (videoPath.split('/').pop() as string)
      )

      await prisma.videoStatus.updateMany({
        where: { name: idName },
        data: { status: EncodingStatus.Processing }
      })

      try {
        this.items.shift()
        await encodeHLSWithMultipleVideoStreams(videoPath)

        const files = getFiles(path.resolve(UPLOAD_VIDEO_DIR, idName))
        await Promise.all([
          files.map((filepath) => {
            const filename = 'videos-hls/' + filepath.replace(path.resolve(UPLOAD_VIDEO_DIR), '').replace(/\\/g, '')
            return uploadFileToS3({
              filepath,
              filename,
              contentType: mime.getType(filepath) as string
            })
          })
        ])

        rimrafSync(path.resolve(UPLOAD_VIDEO_DIR, idName))

        await prisma.videoStatus.updateMany({
          where: { name: idName },
          data: { status: EncodingStatus.Success }
        })

        console.log(`Encode video ${videoPath} success`)
      } catch (error) {
        await prisma.videoStatus
          .updateMany({
            where: { name: idName },
            data: { status: EncodingStatus.Failed }
          })
          .catch((err) => {
            console.error(`Update video status failed`, err)
          })
        console.error(`Encode video ${videoPath} failed`, error)
      }

      this.encoding = false
      this.processEncode()
    } else {
      console.log('Encode video queue is empty')
    }
  }
}

const queue = new Queue()

class MediasService {
  async uploadImage(req: Request) {
    const mime = (await import('mime')).default
    const files = await handleUploadImage(req)

    const result: TweetMedia[] = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFromFullname(file.newFilename) // Get name without extension from filename ==> ex: 123.jpg => 123
        const newFullFileName = `${newName}.jpg` // Get new filename with jpg extension ==> ex: 123.jpg
        const newPath = path.resolve(UPLOAD_IMAGE_DIR, newFullFileName) // Get new path to save file ==> ex: /path/to/project/static/image/123.jpg

        // sharp.cache(false) // Disable sharp cache
        await sharp(file.filepath).jpeg().toFile(newPath) // Use sharp to compress and convert to jpg format

        const s3Result = await uploadFileToS3({
          filename: 'images/' + newFullFileName,
          filepath: newPath,
          contentType: mime.getType(newPath) as string
        })

        await Promise.all([
          fsPromise.unlink(file.filepath), // Delete original file
          fsPromise.unlink(newPath) // Delete new file
        ])

        return {
          url: (s3Result as CompleteMultipartUploadCommandOutput).Location as string,
          type: MediaType.Image
        }
      })
    )

    return result
  }
  async uploadVideo(req: Request) {
    const files = await handleUploadVideo(req)
    const mime = (await import('mime')).default

    const result: TweetMedia[] = await Promise.all(
      files.map(async (file) => {
        const s3Result = await uploadFileToS3({
          filename: 'videos/' + file.newFilename,
          contentType: mime.getType(file.filepath) as string,
          filepath: file.filepath
        })

        fsPromise.unlink(file.filepath)

        return {
          url: (s3Result as CompleteMultipartUploadCommandOutput).Location as string,
          type: MediaType.Video
        }
      })
    )

    return result
  }
  async uploadVideoHLS(req: Request) {
    const files = await handleUploadVideo(req)
    const result: TweetMedia[] = await Promise.all(
      files.map(async (file) => {
        await encodeHLSWithMultipleVideoStreams(file.filepath)
        const newName = getNameFromFullname(file.newFilename)
        queue.enqueue(file.filepath)

        return {
          url: isProduction
            ? `${process.env.HOST}/static/video-hls/${newName}/master.m3u8`
            : `http://localhost:${process.env.PORT}/static/video-hls/${newName}/master.m3u8`,
          type: MediaType.HLS
        }
      })
    )

    return result
  }
  async getVideoStatus(id: string) {
    const data = await prisma.videoStatus.findFirst({ where: { name: id } })
    return data
  }
}

const mediasService = new MediasService()
export default mediasService
