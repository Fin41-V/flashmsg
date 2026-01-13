import CryptoJS from 'crypto-js';

export const generateKey = () => {
    return CryptoJS.lib.WordArray.random(16).toString();
};

export const encryptMessage = (message, key) => {
    return CryptoJS.AES.encrypt(message, key).toString();
};

export const decryptMessage = (ciphertext, key) => {
    try {
        const bytes = CryptoJS.AES.decrypt(ciphertext, key);
        return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
        return null;
    }
};