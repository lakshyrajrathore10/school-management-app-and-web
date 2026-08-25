import mongoose, { Schema, Document } from 'mongoose';

export interface ISchool extends Document {
  id: string;
  name: string;
  code: string;
  latitude: number;
  longitude: number;
  allowedRadiusMeters: number;
  shiftStartTime: string;
  shiftEndTime: string;
  graceMinutes: number;
  monthlyPaidLeaves: number;
  latePenaltyMode?: 'DISABLED' | 'PER_MINUTE' | 'PER_LATE_DAY' | 'HALF_DAY_AFTER_N_LATES';
  latePenaltyPerMinute?: number;
  latePenaltyPerDay?: number;
  lateDaysForHalfDayCut?: number;
  timezone: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SchoolSchema = new Schema<ISchool>(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true, index: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    allowedRadiusMeters: { type: Number, default: 200 },
    shiftStartTime: { type: String, default: '09:00' },
    shiftEndTime: { type: String, default: '17:00' },
    graceMinutes: { type: Number, default: 15 },
    monthlyPaidLeaves: { type: Number, default: 2 },
    latePenaltyMode: { type: String, enum: ['DISABLED', 'PER_MINUTE', 'PER_LATE_DAY', 'HALF_DAY_AFTER_N_LATES'], default: 'PER_MINUTE' },
    latePenaltyPerMinute: { type: Number, default: 5 },
    latePenaltyPerDay: { type: Number, default: 100 },
    lateDaysForHalfDayCut: { type: Number, default: 3 },
    timezone: { type: String, default: 'Asia/Kolkata' },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret: any) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

export const School = mongoose.model<ISchool>('School', SchoolSchema);
