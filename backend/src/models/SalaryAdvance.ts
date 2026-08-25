import mongoose, { Schema, Document } from 'mongoose';

export interface ISalaryAdvance extends Document {
  id: string;
  userId: mongoose.Types.ObjectId | string;
  user?: any;
  schoolId: mongoose.Types.ObjectId | string;
  amount: number;
  date: Date;
  month: number; // 1-12
  year: number; // e.g. 2026
  paymentMode: string; // Cash, UPI, Bank Transfer
  remarks?: string;
  isDeducted: boolean;
  generatedSlipId?: mongoose.Types.ObjectId | string;
  createdById: mongoose.Types.ObjectId | string;
  createdBy?: any;
  createdAt: Date;
  updatedAt: Date;
}

const SalaryAdvanceSchema = new Schema<ISalaryAdvance>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    amount: { type: Number, required: true, min: 1 },
    date: { type: Date, default: Date.now },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true },
    paymentMode: { type: String, default: 'Cash' },
    remarks: { type: String },
    isDeducted: { type: Boolean, default: false },
    generatedSlipId: { type: Schema.Types.ObjectId, ref: 'SalarySlip' },
    createdById: { type: Schema.Types.ObjectId, ref: 'User', required: true },
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

SalaryAdvanceSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

SalaryAdvanceSchema.virtual('createdBy', {
  ref: 'User',
  localField: 'createdById',
  foreignField: '_id',
  justOne: true,
});

export const SalaryAdvance = mongoose.model<ISalaryAdvance>('SalaryAdvance', SalaryAdvanceSchema);
