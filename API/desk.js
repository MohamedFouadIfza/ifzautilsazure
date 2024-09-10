const APINAME = "desk";
const express = require('express');
const router = express.Router();
const pdf = require('pdf-parse');

function removeDuplicateSequences(input) {
    // Use a regular expression to match duplicate sequences
    const regex = /(\d+)\1+/;

    // Replace duplicates with a single occurrence of the sequence
    return input.replace(regex, '$1');
}

router.post(`/${APINAME}/extractDates`, async (req, res) => {

    const base64 = req.body.base64

    let dataBuffer = Buffer.from(base64, 'base64')
    pdf(dataBuffer).then(({ text }) => {
        // console.log("text",text)
        const licenseeRegex = /Licensee\s+([\w\s-]+)/;
        const match = text.match(licenseeRegex);
        const licensee = match[1].trim();
        const dateRegex = /(\d{2}-[A-Za-z]{3}-\d{4})/g;
        const dates = text.match(dateRegex);
        const licenseRegex = /License Number(\d+)/;
        const licenseMatch = text.match(licenseRegex);
        const licenseNumber = licenseMatch ? licenseMatch[1] : null;
        const tradeNameRegex = /Trade Name\s+([\w\s-]+)/;
        const tradeNameMatch = text.match(tradeNameRegex);
        const tradeName = tradeNameMatch[1].trim();

        if (dates) {
            const issueDate = dates[0]; // First occurrence of date (Issue Date)
            const expiryDate = dates[2]; // Third occurrence of date (Expiry Date)

            res.status(200).json({
                expiryDate,
                issueDate,
                licenseNumber: removeDuplicateSequences(licenseNumber),
                licensee: licensee.replaceAll("\n", ""),
                tradeName: tradeName.replaceAll("\n", "")

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