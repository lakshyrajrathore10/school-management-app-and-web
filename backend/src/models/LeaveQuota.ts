import mongoose, { Schema, Document } from 'mongoose';
import { LeaveType } from '../types/enums';

export interface ILeaveQuota extends Document {
  id: string;
  userId: mongoose.Types.ObjectId | string;
  user?: any;
  year: number;
  leaveType: LeaveType;
  totalAllowed: number;
  used: number;
  remaining: number;
}

const LeaveQuotaSchema = new Schema<ILeaveQuota>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    year: { type: Number, required: true },
    leaveType: { type: String, enum: Object.values(LeaveType), required: true },
    totalAllowed: { type: Number, required: true },
    used: { type: Number, default: 0 },
    remaining: { type: Number, required: true },
  },
  {
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

LeaveQuotaSchema.index({ userId: 1, year: 1, leaveType: 1 }, { unique: true });

LeaveQuotaSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

export const LeaveQuota = mongoose.model<ILeaveQuota>('LeaveQuota', LeaveQuotaSchema);
