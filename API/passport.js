const express = require('express');
const router = express.Router();
const APINAME = "passport";
const path = require('path')
const fs = require('fs');
const { sendPassport, fireOCR, getApplicant } = require('../utils/sumSub');
const multer = require('multer');
const fileDIr = path.join(__dirname, "../", "resources");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Specify the folder where you want to store the uploaded files
        cb(null, path.join(__dirname, "../", "resources"));
    },
    filename: function (req, file, cb) {
        // Use the original file name, or customize it if needed
        // console.log("file", file)
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

router.post(`/${APINAME}/ocr`, async (req, res) => {
    try {
        const {
            applicantId,
            base64,
            fileName,
            country,
            externalUserId,
            secretKey,
            token
        } = req.body

        const fileDIr = path.join(__dirname, "../", "resources");

        fs.writeFile(`${fileDIr}/${fileName}`, base64, { encoding: "base64" }, async (err) => {
            if (err) {
                console.log("errr", err)
                res.status(400).json({
                    err
                })
                return
            }


            await sendPassport(applicantId, `${fileDIr}/${fileName}`, {
                country,
                idDocType: "PASSPORT"
            }, secretKey, token)

            await fireOCR(applicantId, secretKey, token)
            setTimeout(async () => {
                getApplicant(externalUserId, secretKey, token).then((app) => {
                    console.log("app", app.data)
                    res.status(200).json({
                        appData: app.data
                    })
                }).catch((E) => {
                    res.status(400).json({
                        appData: E
                    })
                })
            }, 3000);


            fs.rm(`${fileDIr}/${fileName}`, (err) => {
                if (err) {
                    res.status(400).json({
                        err
                    })
                    return
                }
                console.log("file deleted")
            })
        })
    } catch (r) {
        console.log("r", r)
        res.status(400).json({
            r
        })
    }


})

router.post(`/${APINAME}/ocrr`, upload.single('file'), async (req, res) => {
    try {
        const {
            applicantId,
            country,
            externalUserId,
            secretKey,
            token
        } = req.query
        console.log("req.params", req.query)
        // 3876578000686585498
        const fileName = req.file.filename;

        const fullFilePath = path.join(`${fileDIr}`, `${fileName}`)
        await sendPassport(applicantId, fullFilePath, {
            country,
            idDocType: "PASSPORT"
        }, secretKey, token)

        await fireOCR(applicantId, secretKey, token)

        fs.rm(fullFilePath, (err) => {
            if (err) {
                res.status(400).json({
                    err
                })
                return
            }
            console.log("file deleted")
            res.status(200).json({
                status: "done"
            })
        })

      

        // setTimeout(async () => {
        //     getApplicant(externalUserId, secretKey, token).then((app) => {
        //         console.log("app", app.data)
        //         res.status(200).json({
        //             appData: app.data
        //         })
        //     }).catch((E) => {
        //         res.status(400).json({
        //             appData: E
        //         })
        //     }).finally(() => {
        //         fs.rm(fullFilePath, (err) => {
        //             if (err) {
        //                 res.status(400).json({
        //                     err
        //                 })
        //                 return
        //             }
        //             console.log("file deleted")
        //         })
        //     })
        // }, 3000);


    } catch (EE) {
        res.status(400).json({
            EE
        })
    }


})


module.exports = router