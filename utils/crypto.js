import CryptoJS from 'crypto-js';

/**
 * Derives a consistent encryption key from a 6-digit Room Code.
 * We use PBKDF2 to turn a simple 6-digit number into a high-entropy key.
 */
const deriveKeyFromRoom = (roomCode) => {
    // We use a fixed 'salt' for the room logic so the same code 
    // always generates the same key for everyone in that specific room.
    const salt = CryptoJS.enc.Hex.parse('536ec7e3498877e8');
    return CryptoJS.PBKDF2(roomCode, salt, {
        keySize: 256 / 32,
        iterations: 1000
    }).toString();
};

/**
 * Encrypts a message using the derived room key.
 */
export const encryptMessage = (message, roomCode) => {
    try {
        const key = deriveKeyFromRoom(roomCode);
        return CryptoJS.AES.encrypt(message, key).toString();
    } catch (error) {
        console.error("Encryption error:", error);
        return null;
    }
};

/**
 * Decrypts a message using the derived room key.
 */
export const decryptMessage = (ciphertext, roomCode) => {
    try {
        const key = deriveKeyFromRoom(roomCode);
        const bytes = CryptoJS.AES.decrypt(ciphertext, key);
        const decoded = bytes.toString(CryptoJS.enc.Utf8);
        return decoded || null;
    } catch (error) {
        console.error("Decryption error:", error);
        return null;
    }
};

/**
 * No longer needed for individual links, but kept for compatibility
 * if you still want to generate random IDs for rooms.
 */
export const generateKey = () => {
    return CryptoJS.lib.WordArray.random(16).toString();
};