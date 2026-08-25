import mongoose, { Schema, Document } from 'mongoose';
import { HolidayType } from '../types/enums';

export interface IHoliday extends Document {
  id: string;
  schoolId: mongoose.Types.ObjectId | string;
  school?: any;
  name: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string;  // YYYY-MM-DD
  dayName: string;
  type: HolidayType;
  description?: string;
  createdAt: Date;
}

const HolidaySchema = new Schema<IHoliday>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    name: { type: String, required: true },
    startDate: { type: String, required: true, index: true },
    endDate: { type: String },
    dayName: { type: String, required: true },
    type: { type: String, enum: Object.values(HolidayType), default: HolidayType.FESTIVAL },
    description: { type: String },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
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

HolidaySchema.virtual('school', {
  ref: 'School',
  localField: 'schoolId',
  foreignField: '_id',
  justOne: true,
});

export const Holiday = mongoose.model<IHoliday>('Holiday', HolidaySchema);
