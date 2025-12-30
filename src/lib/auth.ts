import { SignJWT, jwtVerify } from 'jose';

const SECRET_KEY = process.env.JWT_SECRET || 'default-secret-key-change-this-in-prod';
const key = new TextEncoder().encode(SECRET_KEY);

export async function signJWT(payload: any) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(key);
}

export async function verifyJWT(token: string) {
    try {
        const { payload } = await jwtVerify(token, key, {
            algorithms: ['HS256'],
        });
        return payload;
    } catch (error) {
        return null;
    }
}
