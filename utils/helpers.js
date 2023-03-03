import crypto from 'crypto';
import bcrypt from 'bcryptjs'
export const generateEmailVerificationToken = () => {
    const buffer = crypto.randomBytes(30);
    const token = buffer.toString('hex');
    return token;
}
export const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000);
}

export const generatePasswordHash = (password) =>
    new Promise((resolve, reject) => {
        bcrypt.hash(password, 10, (err, hash) => {
            if (err) reject(err);
            resolve(hash);
        });
    });

export const comparePasswordHash = (password, hash = '') =>
    new Promise((resolve, reject) => {
        bcrypt.compare(password, hash, (err, res) => {
            if (err) reject(err);
            resolve(res);
        });
    });
