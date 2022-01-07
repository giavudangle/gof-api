import * as fs from 'fs'
export function createDirectorySyncUtil(dirPath : string) {
    const _fs: any = fs;
    if (!fs.existsSync(dirPath)) {
        _fs.mkdirSync(dirPath, { recursive: true }, (err) => {
            if (err) {
                console.error("createDir Error:", err);
            } else {
                console.log("Directory is made!");
            }
        });
    }
}