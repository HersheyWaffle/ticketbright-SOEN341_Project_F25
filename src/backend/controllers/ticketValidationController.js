const fs = require('fs');
const jimpMod = require('jimp');
const Jimp = jimpMod.Jimp || jimpMod;
const decodeQrFromBuffer = require('../utils/qrDecode');

exports.validateTicket = async (req, res) => {
console.log('[QR] hit', new Date().toISOString()); //this is to debug
console.log('[QR] hasFile?', !!req.file);
if (req.file) {
    console.log('[QR] name/mime/size', req.file.originalname, req.file.mimetype, req.file.size);
try {
    fs.writeFileSync('/tmp/last-upload.bin', req.file.buffer);
    const sig = Array.from(req.file.buffer.slice(0, 8));
    console.log('[QR] saved /tmp/last-upload.bin; magic bytes:', sig);
    } catch (e) {
      console.log('[QR] could not write /tmp/last-upload.bin:', e.message);
    }
}
try {
if (!req.file) {
    return res.status(400).json({
    errors: { file: 'QR image file is required (field name: "file")' }
      });
}

try { //checks if Jimp works 
    const img = await Jimp.read(req.file.buffer);
    console.log('[QR] Jimp read OK. size =', img.bitmap.width, 'x', img.bitmap.height);
    } 
    catch (e) {
    console.log('[QR] Jimp read FAILED:', e.message);
    return res.status(400).json({ valid: false, message: 'Image load failed: ' + e.message });
}
let qrText;
try { //decode QR code 
    qrText = await decodeQrFromBuffer(req.file.buffer);
    console.log('[QR] decoded text:', qrText);
    } 
    catch (e) {
    console.log('[QR] decode FAILED:', e.message);
    return res.status(400).json({ valid: false, message: 'Unable to read QR image (decoder): ' + e.message });
    }

const ticketId = String(qrText).trim();
const looksLikeId = /^[A-Za-z0-9-_]{6,}$/.test(ticketId);
if (!looksLikeId) {
    return res.status(404).json({
    valid: false,
    ticketId,
    message: 'Ticket not found or invalid (demo rule).'
      });
}

return res.json({
    valid: true,
    ticketId,
    message: 'Ticket is valid (demo validation — replace with DB checks next sprint).'
});
  } 
catch (err) {
    console.error('[QR] unexpected error:', err);
    return res.status(400).json({ valid: false, message: 'Unable to read QR image.' });
  }
};