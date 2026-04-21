import mongoose, { Document } from "mongoose";

export enum ReportStatusEnum {
    SENT = "SENT",
    PENDING = "PENDING",
    FAILED = "FAILED",
}

export interface reportDocument extends Document {
    userId: mongoose.Types.ObjectId,
    period: string,
    sentDate: Date,
    status: keyof typeof ReportStatusEnum,
    createAt: Date,
    updateAt: Date
}

const reportSchema = new mongoose.Schema<reportDocument>(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User"
        },
        period: {
            type: String,
            required: true
        },
        sentDate: {
            type: Date,
            required: true
        },
        status: {
            type: String,
            enum: Object.values(ReportStatusEnum),
            default: ReportStatusEnum.PENDING
        }
    },
    { 
        timestamps: true 
    }
)

export const Report = mongoose.model<reportDocument>("Report", reportSchema)