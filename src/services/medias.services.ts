import { Request } from 'express'
import path from 'path'
import sharp from 'sharp'
import { getNameFromFullname, handleUploadImage, handleUploadVideo } from '~/utils/file'
import fs from 'fs'
import fsPromise from 'fs/promises'
import { UPLOAD_IMAGE_DIR } from '~/config/dir'
import { isProduction } from '~/config/config'
import { encodeHLSWithMultipleVideoStreams } from '~/utils/video'
import prisma from '~/client'
import { EncodingStatus } from '@prisma/client'

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
        await encodeHLSWithMultipleVideoStreams(videoPath)
        this.items.shift()
        await fsPromise.unlink(videoPath)
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
    const files = await handleUploadImage(req)

    // const result: Media[]
    const result = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFromFullname(file.newFilename) // Get name without extension from filename ==> ex: 123.jpg => 123
        const newPath = path.resolve(UPLOAD_IMAGE_DIR, `${newName}.jpg`) // Get new path to save file after compress and convert to jpg format

        sharp.cache(false) // Disable sharp cache
        await sharp(file.filepath).jpeg().toFile(newPath) // Use sharp to compress and convert to jpg format
        fs.unlinkSync(file.filepath)

        return {
          url: isProduction
            ? `${process.env.HOST}/static/image/${newName}.jpg`
            : `http://localhost:${process.env.PORT}/static/image/${newName}.jpg`,
          // type: MediaType.Image
          type: 'Image'
        }
      })
    )

    return result
  }
  async uploadVideo(req: Request) {
    const files = await handleUploadVideo(req)

    // const result: Media[]
    const result = files.map((file) => {
      return {
        url: isProduction
          ? `${process.env.HOST}/static/video/${file.newFilename}`
          : `http://localhost:${process.env.PORT}/static/video/${file.newFilename}`,
        // type: MediaType.Video
        type: 'Video'
      }
    })

    return result
  }
  async uploadVideoHLS(req: Request) {
    const files = await handleUploadVideo(req)
    // const result: Media[]
    const result = await Promise.all(
      files.map(async (file) => {
        await encodeHLSWithMultipleVideoStreams(file.filepath)
        const newName = getNameFromFullname(file.newFilename)
        queue.enqueue(file.filepath)

        return {
          url: isProduction
            ? `${process.env.HOST}/static/video-hls/${newName}.m3u8`
            : `http://localhost:${process.env.PORT}/static/video-hls/${newName}.m3u8`,
          // type: MediaType.HLS
          type: 'HLS'
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
