const APINAME = "portal";
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { createPdfFileFormBase64, extractPdfImages, deleteFilesFromFolder, getFiles } = require('../utils/convertPdf');
const env = process.env
const cron = require('node-cron')

router.get(`/${APINAME}/test`, async (req, res) => {

    res.status(200).json({
        result: `it is work ${APINAME}`
    })

})

router.get(`/${APINAME}/convertedJson/:id`, async (req, res) => {

    const filePath = path.join(__dirname, "../", "resources", "convertedJson", `${req.params.id}.json`);
    // console.log("yes", filePath)

    res.download(filePath, `${req.params.id}.json`, (err) => {
        if (err) {
            res.status(400).json({
                err
            })
            return
        }
    })
})

router.post(`/${APINAME}/convertjsontofile/:id`, async (req, res) => {
    const id = req.params.id
    const json = req.body

    const filePath = path.join(__dirname, "../", "resources", "convertedJson");

    const downloadPath = path.join(env == "development" ? "http://localhost:3000" : "https://webapp-dev-appws2-epedd7gcb4cxfdga.uaenorth-01.azurewebsites.net", "convertedJson", `${id}`);
    const data = JSON.stringify(json, null, 2)
    fs.writeFile(`${filePath}/${id}.json`, data, 'utf8', (err) => {
        if (err) {
            res.status(400).json({
                err
            })
            return
        }

        fs.readFile(`${filePath}/${id}.json`, 'base64', (err, dataBase) => {

            if (err) {
                res.status(400).json({
                    err
                })
                return
            }
            res.status(200).json({
                downloadURL: downloadPath,
                base64: dataBase
            })
        })

    })

})


router.post(`/${APINAME}/save-json/:id`, (req, res) => {
    try {
        const jsonData = req.body;
        const id = req.params.id
        // Set the filename
        const fileName = `${id}.json`;

        // Save the JSON data to a file
        fs.writeFile(path.join(__dirname, "../", "resources", "convertedJson", fileName), JSON.stringify(jsonData, null, 2), (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Failed to save JSON file' });
            }

            // Generate the download link
            const downloadLink = `https://webapp-dev-appws2-epedd7gcb4cxfdga.uaenorth-01.azurewebsites.net/api/${APINAME}/download/${fileName}`;

            res.status(200).json({ message: 'JSON file saved successfully', downloadLink });
        });
    } catch (e) {
        res.status(400).json({ erorr: e });
    }

});

router.post(`/${APINAME}/convertpdftoimg`, async (req, res) => {
    const { base64Pdf } = req.body;

    if (!base64Pdf) {
        return res.status(400).json({ error: 'No PDF data provided' });
    }

    try {
        const savePath = path.join(__dirname, "document.pdf")
        const outputFolder = path.join(__dirname, "../", "public", "output"); // Output folder

        // const files =  getFiles(outputFolder)
        deleteFilesFromFolder(outputFolder, () => { })

        createPdfFileFormBase64(base64Pdf, savePath, () => {
            extractPdfImages(savePath, outputFolder).then(() => {
                fs.unlinkSync(savePath)
                getFiles(outputFolder, (files) => {
                    const isProduction = true;
                    const baseUrl = `${isProduction ? "https://webapp-dev-appws2-epedd7gcb4cxfdga.uaenorth-01.azurewebsites.net":"http://localhost:3000"}`
                    const perviewFiles = files.map((file) => `${baseUrl}/output/${file}`)
                    const downloadFiles = files.map((file) => `${baseUrl}/api/portal/convertpdftoimg/${file}`)
                    res.status(200).json({ perviewFiles, downloadFiles })
                })
            })
        })
    } catch (e) {
        console.log("eee", e)
        res.status(400).json({ "dd": e })
    }
});

router.get(`/${APINAME}/convertpdftoimg/:filename`, (req, res) => {
    const fileName = req.params.filename;
    const filePath = path.join(__dirname, "../", "public", "output", fileName); // Output folder
  
    // Check if the file exists
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        res.status(404).send('File not found.');
      }
    });
  });
router.get(`/${APINAME}/download/:fileName`, (req, res) => {
    try {
        const fileName = req.params.fileName;
        const filePath = path.join(__dirname, "../", "resources", "convertedJson", fileName);

        // Check if the file exists
        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                return res.status(404).json({ message: 'File not found' });
            }

            // Send the file for download
            res.download(filePath, (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ message: 'Failed to download file' });
                }
            });
        });
    } catch (e) {
        res.status(400).json({ erorr: e });
    }

});

module.exports = router