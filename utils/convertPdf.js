const fs = require('fs');
const path = require('path');
const pdfPoppler = require("pdf-poppler");

const extractPdfImages = async (pdfPath, outputFolder) => {
    const opts = {
        format: "jpeg", // Image format: jpeg/png
        out_dir: outputFolder, // Output directory
        out_prefix: path.basename(pdfPath, path.extname(pdfPath)), // File prefix
        page: null, // Process all pages
    };

    try {
        await pdfPoppler.convert(pdfPath, opts);
        console.log("PDF pages successfully converted to images!");
    } catch (error) {
        console.error("Error converting PDF to images:", error);
    }
};

const getFiles = (Folder, onScan) => {
    fs.readdir(Folder, (err, files) => {
        if (err) {
            console.error(`Error reading folder: ${err.message}`);
            return;
        }
        const docFiles = files.filter(file => !file.includes("git"))
        onScan && onScan(docFiles)
    });
}
const deleteFilesFromFolder = (Folder, onAllDeleted) => {

    fs.readdir(Folder, (err, files) => {
        if (err) {
            console.error(`Error reading folder: ${err.message}`);
            return;
        }

        // Loop through each file and delete it
        files.forEach((file) => {
            const filePath = path.join(Folder, file);
            // console.log("filePath", filePath)
            // Check if it's a file (not a directory)
            fs.stat(filePath, (err, stats) => {
                if (err) {
                    console.error(`Error getting stats of file: ${filePath}`, err);
                    return;
                }

                if (stats.isFile() && !filePath.includes("git")) {
                    fs.unlink(filePath, (err) => {
                        if (err) {
                            console.error(`Error deleting file: ${filePath}`, err);
                        } else {
                            onAllDeleted()
                            // console.log(`Deleted file: ${filePath}`);
                        }
                    });
                }
            });
        });
    });
}

const createPdfFileFormBase64 = (base64Pdf, savePath, onCreate, onErorr) => {
    const buffer = Buffer.from(base64Pdf, 'base64');

    fs.writeFile(savePath, buffer, async (err) => {
        if (err) {
            onErorr(err)
            return
        }
        onCreate()
    });

}


module.exports = {
    extractPdfImages,
    deleteFilesFromFolder,
    createPdfFileFormBase64,
    getFiles
}