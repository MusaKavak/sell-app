import { open } from '@tauri-apps/api/dialog';
import { FileManager } from './FileManager';
import { StatusCodes } from '../StatusCodes';

export class ImageManager {
  imgCache: { barcode: number, img: string | undefined }[] = []

  async getBase64WithBarcode(barcode: number): Promise<string | undefined> {
    const findInCache = this.imgCache.find(c => c.barcode == barcode)
    if (findInCache != undefined) {
      return findInCache.img
    } else {

      var binary = ''
      const byteArray = await FileManager.readBinaryFromImagesFolderByBarcode(barcode)
      if (byteArray != undefined) {
        for (let i = 0; i < byteArray.byteLength; i++) {
          binary += String.fromCharCode(byteArray[i])
        }
        const base64String = window.btoa(binary)
        this.imgCache.push({
          barcode,
          img: base64String
        })
        return base64String
      } else {
        this.imgCache.push({
          barcode,
          img: undefined
        })
        return undefined
      }
    }

  }

  async selectImageByBarcode(barcode: number): Promise<StatusCodes> {
    const response = await this.openSelectImageDialog()
    if (response.status == StatusCodes.SUCCESS) {
      this.imgCache = this.imgCache.filter(c => c.barcode != barcode)
      return FileManager.writeBinaryToImagesFolderByBarcode(barcode, response.array!!)
    }

    return response.status
  }

  private async openSelectImageDialog(): Promise<{ status: StatusCodes, array: Uint8Array | null }> {
    try {
      const selectedImage = await open({
        multiple: false,
        title: 'Ürün Görseli Seçin',
        filters: [{
          name: "Image",
          extensions: ["jpg", "jpeg", "png"]
        }]
      })
      if (selectedImage == null || Array.isArray(selectedImage)) {
        return { status: StatusCodes.NOT_SELECTED, array: null }
      } else {
        const array = await FileManager.readBinaryFromAnyPath(selectedImage)
        if (array != undefined) {
          return {
            status: StatusCodes.SUCCESS,
            array
          }
        } else {
          return {
            status: StatusCodes.NOT_FOUND,
            array: null
          }
        }
      }
    } catch (error) {
      console.error(error);
      return { status: StatusCodes.FAIL, array: null }
    }
  }
}
