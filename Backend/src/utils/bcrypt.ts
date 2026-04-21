import bcrypt from 'bcrypt'

const hashPassword =  (value: string, saltRounds: number = 10) => {
    return bcrypt.hash(value, saltRounds)
} 

const comparePassword = (value: string, hashValue: string) => {
    return bcrypt.compare(value, hashValue)
}

export {
    hashPassword,
    comparePassword
}