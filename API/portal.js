const APINAME = "portal";
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const env = process.env

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

    const downloadPath = path.join(env == "development" ? "http://localhost:3000" : "https://mrz-code-scanner.onrender.com", "convertedJson", `${id}`);
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

module.exports = router