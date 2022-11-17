import { readTextFile, FsTextFileOption, writeTextFile, Dir, createDir, readBinaryFile, writeBinaryFile, FsBinaryFileOption, FsOptions } from "@tauri-apps/api/fs";
import { StatusCodes } from "../StatusCodes";

export class FileManager {
    static filePaths = {
        products: "products.txt",
        customers: "customers.txt",
        productGridItems: "gridItems.txt",
        dayListOfVaults: "Vault\\dayList.txt",
        productLogs: "productLogs.txt"
    }


    static async getListFromDocuments<T>(filePathAndName: string): Promise<Array<T>> {
        const path = "SellApp\\" + filePathAndName
        try {
            const string = await readTextFile(path, { dir: Dir.Document })
            return JSON.parse(string)
        } catch (error) {
            console.error(error)
            const status = await FileManager.tryCreateDirDueToError(FileManager.getPathWithoutFileName(path))
            if (status) return await this.getListFromDocuments(filePathAndName)
            return []
        }
    }

    static async writeListIntoDocuments<T>(filePathAndName: string, newList: Array<T>): Promise<boolean> {
        const path = "SellApp\\" + filePathAndName
        try {
            const string = JSON.stringify(newList)
            const tfOptions: FsTextFileOption = {
                path: path,
                contents: string
            }
            await writeTextFile(tfOptions, { dir: Dir.Document })
            return true
        } catch (error) {
            console.error(error)
            const status = await FileManager.tryCreateDirDueToError(FileManager.getPathWithoutFileName(path))
            if (status) return await this.writeListIntoDocuments(filePathAndName, newList)
            return false
        }
    }

    static async readBinaryFromAnyPath(path: string): Promise<Uint8Array | undefined> {
        try {
            return await readBinaryFile(path)
        } catch (error) {
            return undefined
        }
    }

    static async readBinaryFromImagesFolderByBarcode(barcode: number): Promise<Uint8Array | undefined> {
        try {
            return await readBinaryFile(`SellApp\\Images\\${barcode}.png`, { dir: Dir.Document })
        } catch (error) {
            return undefined
        }
    }

    static async writeBinaryToImagesFolderByBarcode(barcode: number, binary: Uint8Array): Promise<StatusCodes> {
        try {
            await writeBinaryFile(`SellApp\\Images\\${barcode}.png`, binary, { dir: Dir.Document })
            return StatusCodes.SUCCESS
        } catch (error) {
            const status = await FileManager.tryCreateDirDueToError("SellApp\\Images")
            if (status) return this.writeBinaryToImagesFolderByBarcode(barcode, binary)
            return StatusCodes.FAIL
        }
    }

    static getPathWithoutFileName(path: string) {
        const folderPathList = path.split("\\")
        folderPathList.pop()
        return folderPathList.toString().replaceAll(",", "\\")
    }

    private static lastCreatedDir: string = ""
    private static async tryCreateDirDueToError(dirName: string | undefined): Promise<boolean> {
        if (FileManager.lastCreatedDir != dirName && dirName != undefined) {
            console.log("creating " + dirName)
            FileManager.lastCreatedDir = dirName
            await this.createDirInDocuments(dirName)
            setTimeout(() => {
                this.lastCreatedDir = ""
            }, 500);
            return true
        } else
            return false
    }

    static async createDirInDocuments(pathAndDirName: string) {
        try {
            await createDir(pathAndDirName, { dir: Dir.Document })
        } catch (error) {
            console.error(error)
        }
    }
}