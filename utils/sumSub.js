const crypto = require('crypto')
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

async function sendPassport(applicantId, filePath, metadata = { idDocType: 'PASSPORT', country: 'NLD' }, secretKey, token ) {

    var form = new FormData();
    form.append('metadata', JSON.stringify(metadata));

    var content = fs.readFileSync(filePath);
    form.append('content', content, filePath);

    const stamp = Math.floor(Date.now() / 1000).toString();
    const valueToSign = stamp + `POST/resources/applicants/${applicantId}/info/idDoc`;
    const hash = crypto.createHmac('SHA256', secretKey).update(valueToSign).update(form.getBuffer()).digest('hex');



    const options = {
        method: 'POST',
        url: `https://api.sumsub.com/resources/applicants/${applicantId}/info/idDoc`,
        headers: {
            'X-App-Token': token,
            "X-App-Access-Sig": hash,
            "X-App-Access-Ts": stamp,
            'Accept': 'application/json',
            ...form.getHeaders()
        },
        data: form
    };

    const res = await axios(options)
    return res
}

async function getApplicant(externalUserId, secretKey, token) {
    const stamp = Math.floor(Date.now() / 1000).toString();
    const valueToSign = stamp + `GET/resources/applicants/-;externalUserId=${externalUserId}/one`;
    const hash = crypto.createHmac('SHA256', secretKey).update(valueToSign).digest('hex');

    const options = {
        method: 'GET',
        url: `https://api.sumsub.com/resources/applicants/-;externalUserId=${externalUserId}/one`,
        headers: {
            'X-App-Token': token,
            "X-App-Access-Sig": hash,
            "X-App-Access-Ts": stamp,
            'Accept': 'application/json',
        },
    };

    const res = await axios(options)
    return res
}

async function fireOCR(applicantId, secretKey, token) {
    const stamp = Math.floor(Date.now() / 1000).toString();
    const valueToSign = stamp + `POST/resources/applicants/${applicantId}/status/pending`;
    const hash = crypto.createHmac('SHA256', secretKey).update(valueToSign).digest('hex');
    const options = {
        method: 'POST',
        url: `https://api.sumsub.com/resources/applicants/${applicantId}/status/pending`,
        headers: {
            'X-App-Token': token,
            "X-App-Access-Sig": hash,
            "X-App-Access-Ts": stamp,
            'Accept': 'application/json',
        }
    };

    const res = await axios(options)
    return res
}

module.exports = {
    sendPassport,
    getApplicant,
    fireOCR
}