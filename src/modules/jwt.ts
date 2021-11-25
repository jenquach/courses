import jwt, { JwtPayload } from 'jsonwebtoken'

export function decode(token: string): JwtPayload {
    return jwt.decode(token) as JwtPayload
}

export function isVerified(token: string): boolean {
    const claims = decode(token)

    return claims.email_verified === true
}