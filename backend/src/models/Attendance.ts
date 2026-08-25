import mongoose, { Schema, Document } from 'mongoose';
import { AttendanceStatus } from '../types/enums';

export interface IAttendance extends Document {
  id: string;
  userId: mongoose.Types.ObjectId | string;
  user?: any;
  schoolId: mongoose.Types.ObjectId | string;
  school?: any;
  date: string; // YYYY-MM-DD
  checkInAt?: Date;
  checkOutAt?: Date;
  workingMinutes: number;
  status: AttendanceStatus;
  isLate: boolean;
  isEarlyCheckOut: boolean;

  checkInLat?: number;
  checkInLon?: number;
  checkInAccuracy?: number;
  checkInSelfieKey?: string;

  checkOutLat?: number;
  checkOutLon?: number;
  checkOutAccuracy?: number;
  checkOutSelfieKey?: string;

  isMockLocation: boolean;
  verificationStatus: string;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    date: { type: String, required: true, index: true },
    checkInAt: { type: Date },
    checkOutAt: { type: Date },
    workingMinutes: { type: Number, default: 0 },
    status: { type: String, enum: Object.values(AttendanceStatus), default: AttendanceStatus.PRESENT },
    isLate: { type: Boolean, default: false },
    isEarlyCheckOut: { type: Boolean, default: false },

    checkInLat: { type: Number },
    checkInLon: { type: Number },
    checkInAccuracy: { type: Number },
    checkInSelfieKey: { type: String },

    checkOutLat: { type: Number },
    checkOutLon: { type: Number },
    checkOutAccuracy: { type: Number },
    checkOutSelfieKey: { type: String },

    isMockLocation: { type: Boolean, default: false },
    verificationStatus: { type: String, default: 'VERIFIED' },
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

AttendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

AttendanceSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

AttendanceSchema.virtual('school', {
  ref: 'School',
  localField: 'schoolId',
  foreignField: '_id',
  justOne: true,
});

export const Attendance = mongoose.model<IAttendance>('Attendance', AttendanceSchema);
