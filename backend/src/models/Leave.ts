import mongoose, { Schema, Document } from 'mongoose';
import { LeaveStatus, LeaveType } from '../types/enums';

export interface ILeave extends Document {
  id: string;
  userId: mongoose.Types.ObjectId | string;
  user?: any;
  leaveType: LeaveType;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  totalDays: number;
  reason: string;
  attachmentKey?: string;
  status: LeaveStatus;
  appliedAt: Date;
  reviewedAt?: Date;
  reviewedById?: mongoose.Types.ObjectId | string;
  reviewedBy?: any;
  reviewComment?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LeaveSchema = new Schema<ILeave>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    leaveType: { type: String, enum: Object.values(LeaveType), required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    totalDays: { type: Number, required: true },
    reason: { type: String, required: true },
    attachmentKey: { type: String },
    status: { type: String, enum: Object.values(LeaveStatus), default: LeaveStatus.PENDING, index: true },
    appliedAt: { type: Date, default: Date.now },
    reviewedAt: { type: Date },
    reviewedById: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewComment: { type: String },
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

LeaveSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

LeaveSchema.virtual('reviewedBy', {
  ref: 'User',
  localField: 'reviewedById',
  foreignField: '_id',
  justOne: true,
});

export const Leave = mongoose.model<ILeave>('Leave', LeaveSchema);
