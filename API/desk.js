const APINAME = "desk";
const express = require('express');
const router = express.Router();
const pdf = require('pdf-parse');


router.post(`/${APINAME}/extractDates`, async (req, res) => {

    const base64 = req.body.base64

    let dataBuffer = Buffer.from(base64, 'base64')
    pdf(dataBuffer).then(({ text }) => {
        // console.log("text", extractEnglishText(text))

        const dateRegex = /(\d{2}-[A-Za-z]{3}-\d{4})/g;
        const dates = text.match(dateRegex);

        if (dates) {
            const issueDate = dates[0]; // First occurrence of date (Issue Date)
            const expiryDate = dates[2]; // Third occurrence of date (Expiry Date)

            res.status(200).json({
                expiryDate,
                issueDate
            })
        } else {
            res.status(400).json({
              err: "No dates found"
            })
        }

    })
        .catch((er) => {
            console.log("err", er)
            res.status(400).json({
                er
            })
        })
})

module.exports = router