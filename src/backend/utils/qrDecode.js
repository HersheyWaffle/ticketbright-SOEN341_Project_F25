const jimpMod = require('jimp');
const Jimp = jimpMod.Jimp || jimpMod;

const QrCode = require('qrcode-reader'); //This is to decode 
const jsQR = require('jsqr');           

module.exports = async function decodeQrFromBuffer(buffer) {

const image = await Jimp.read(buffer); // if unreadable throw away 

try { //This is to test Qr decode
    const text = await new Promise((resolve, reject) => {
      const qr = new QrCode();
      qr.callback = (err, value) => {
        if (err) return reject(err);
        if (!value || !value.result) return reject(new Error('no-qr'));
        resolve(value.result);
      };
      qr.decode(image.bitmap);
    });
    return text;
  } catch (_) {
}

const { data, width, height } = image.bitmap;
const clamped = new Uint8ClampedArray(data.buffer, data.byteOffset, data.byteLength);
const res = jsQR(clamped, width, height, { inversionAttempts: 'attemptBoth' });

if (res && res.data) return res.data;
    throw new Error('QR not found');
};
