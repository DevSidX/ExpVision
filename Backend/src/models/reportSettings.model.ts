import mongoose, { Document } from "mongoose";

export enum ReportFrequencyEnum {
    MONTHLY = "MONTHLY",
}

export interface reportSettingsDocument extends Document {
    userId: mongoose.Types.ObjectId,
    frequency: keyof typeof ReportFrequencyEnum,
    isEnabled: boolean,
    nextReportDate?: Date,
    lastSentDate?: Date,
    createdAt: Date,
    updatedAt: Date
}

const reportSettingsSchema = new mongoose.Schema<reportSettingsDocument>(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        frequency: {
            type: String,
            enum: Object.values(ReportFrequencyEnum),
            default: ReportFrequencyEnum.MONTHLY
        },
        isEnabled: {
            type: Boolean,
            default: false
        },
        nextReportDate: {
            type: Date
        },
        lastSentDate: {
            type: Date
        }
    },
    {
        timestamps: true
    }
)

export const ReportSettings = mongoose.model<reportSettingsDocument>("ReportSettings", reportSettingsSchema)