import mongoose, { Document } from "mongoose";
import { comparePassword, hashPassword } from "../utils/bcrypt";

export interface userDocument extends Document{
    name: string,
    email: string,
    password: string,
    profilePicture: string | null,
    comparePassword: (password: string) => Promise<boolean>,
    omitPassword: () => Omit<userDocument, "password">,
    createAt: Date,
    updatedAt: Date
}

const userSchema = new mongoose.Schema<userDocument> (
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },
        password: {
            type: String,
            select: true,
            required: true,
        }
    },
    {
        timestamps: true
    }
)

// hash a user's password before it is stored in the database
userSchema.pre<userDocument>('save', async function (next) {
    if (this.isModified('password')) {
        if(this.password){
            this.password = await hashPassword(this.password, 10)
        }
    }
})

userSchema.methods.omitPassword = function () : Omit<userDocument, "password"> {
    const user = this.toObject();
    delete user.password;
    return user;
}

userSchema.methods.comparePassword = async function (password: string) {
    return await comparePassword(password, this.password)
}

export const User = mongoose.model<userDocument>("User", userSchema)