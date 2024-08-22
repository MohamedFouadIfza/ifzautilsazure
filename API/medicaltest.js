const express = require('express');
const router = express.Router();
const pdf = require('pdf-parse');

const APINAME = "medicaltest";

router.post(`/${APINAME}/test`, async (req,res)=>{

    res.status(200).json({
        result: "it is work"
    })

})

router.post(`/${APINAME}/ocr`, async (req, res) => {

    try {
        const base64Data = req.body.image
        const visaID = req.body?.id || "default"

        let dataBuffer = Buffer.from(base64Data, 'base64')
        pdf(dataBuffer).then(function (data) {

            // The text content of the PDF
            const text = data.text;
            // Use regular expressions to extract the information
            const passportRegex = /Passport No\.\s*(\d+)/i;
            const fitnessResultRegex = /Medical Fitness Result\s*“\s*(\w+)\s*”/i;

            const passportRegex1 = /Passport No\.\s*(\w+)/i;
            const fitnessResultRegex1 = /Medical Fitness Result\s*“\s*(\w+)\s*”/i;

            const passportRegex2 = /Passport Number\s*(\w+)/i;
            const fitnessResultRegex2 = /Medically Fit|لائق طبياً/g;

            const passportRegex3 = /Passport No\.\s*(\w+)/i;
            const fitnessResultRegex3 = /Medical Fitness Result:\s*“\s*(\w+)\s*”/i;

            const wordRegex2 = /لائق طبيا/g;
            ////////////////////////////////////////////////////////

            const passportMatch = text.match(passportRegex);
            const fitnessResultMatch = text.match(fitnessResultRegex);

            const passportMatch1 = text.match(passportRegex1);
            const fitnessResultMatch1 = text.match(fitnessResultRegex1);

            const passportMatch2 = text.match(passportRegex2);
            const fitnessResultMatch2 = text.match(fitnessResultRegex2);

            const matchDoc1 = text.match(wordRegex2);

            const passportMatch3 = text.match(passportRegex3);
            const fitnessResultMatch3 = text.match(fitnessResultRegex3);



            if (passportMatch3 && fitnessResultMatch3) {
                console.log("goverment of dubai", visaID)
                const passportNumber = passportMatch3[1];
                const medicalFitnessResult = fitnessResultMatch3[1];
                res.status(200).json({
                    passportNum: passportNumber,
                    result: medicalFitnessResult
                })
            } else if (passportMatch1 && fitnessResultMatch1) {
                console.log("Salem", visaID)
                const passportNumber = passportMatch1[1];
                const fitnessResult = fitnessResultMatch1[1];
                res.status(200).json({
                    passportNum: passportNumber,
                    result: fitnessResult
                })
            } else if (passportMatch && fitnessResultMatch) {
                console.log("third doc", visaID)
                const passportNumber = passportMatch[1];
                const fitnessResult = fitnessResultMatch[1];

                res.status(200).json({
                    passportNum: passportNumber,
                    result: fitnessResult
                })
            } else if (passportMatch2 && fitnessResultMatch2) {
                console.log("Laiq arabic", visaID)
                const passportNumber = passportMatch2[1];
                const fitnessResult = fitnessResultMatch2[0];
                console.log("includted arabic and has passport")
                res.status(200).json({
                    passportNum: passportNumber,
                    result: fitnessResult.replace("Medically ", "").toUpperCase()
                })
            } else if (matchDoc1) {
                console.log("EHC arabic without passport number", visaID)
                res.status(200).json({
                    passportNum: "0",
                    result: "FIT"
                })
                // passportNum: "No Passport Number",
            } else {
                res.status(200).json({
                    passportNum: "0"
                })
                // passportNum: "image resolution is not good or worng file"
                console.log('image resolution is not good', visaID);
            }
        });

    } catch (e) {
        res.status(500).json({
            erorr: e
        })
        console.log('eeee', e)
    }

});


module.exports = router