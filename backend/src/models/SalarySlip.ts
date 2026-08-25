import mongoose, { Schema, Document } from 'mongoose';

export enum SalarySlipStatus {
  GENERATED = 'GENERATED',
  PAID = 'PAID',
  PENDING = 'PENDING',
}

export interface IEarningsBreakdown {
  baseSalary: number;
  hra: number;
  transportAllowance: number;
  specialAllowance: number;
  bonus: number;
}

export interface IDeductionsBreakdown {
  leaveDeduction: number;
  advanceDeduction: number; // Salary Advance taken in the current month (अग्रिम वेतन)
  latePenalty: number;
  pfDeduction: number;
  taxDeduction: number;
}

export interface ISalarySlip extends Document {
  id: string;
  userId: mongoose.Types.ObjectId | string;
  user?: any;
  schoolId: mongoose.Types.ObjectId | string;
  school?: any;
  month: number; // 1-12
  year: number; // e.g. 2026
  baseSalary: number;
  perDaySalary: number;
  totalDaysInMonth: number;
  presentDays: number;
  absentDays: number;
  halfDays: number;
  paidLeaveDays: number;
  unpaidLeaveDays: number;
  holidayDays: number;
  weekendDays: number;
  earnings: IEarningsBreakdown;
  deductionsBreakdown: IDeductionsBreakdown;
  deductions: number;
  allowances: number;
  bonus: number;
  advanceDeduction: number;
  netSalary: number;
  bankDetailsSnapshot?: {
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
    upiId?: string;
    panNumber?: string;
  };
  status: SalarySlipStatus;
  paymentDate?: Date;
  paymentMode?: string; // Cash, Bank Transfer, UPI, Cheque
  transactionRef?: string;
  remarks?: string;
  generatedById: mongoose.Types.ObjectId | string;
  generatedBy?: any;
  createdAt: Date;
  updatedAt: Date;
}

const SalarySlipSchema = new Schema<ISalarySlip>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true },
    baseSalary: { type: Number, required: true, default: 0 },
    perDaySalary: { type: Number, required: true, default: 0 },
    totalDaysInMonth: { type: Number, required: true, default: 30 },
    presentDays: { type: Number, default: 0 },
    absentDays: { type: Number, default: 0 },
    halfDays: { type: Number, default: 0 },
    paidLeaveDays: { type: Number, default: 0 },
    unpaidLeaveDays: { type: Number, default: 0 },
    holidayDays: { type: Number, default: 0 },
    weekendDays: { type: Number, default: 0 },
    earnings: {
      baseSalary: { type: Number, default: 0 },
      hra: { type: Number, default: 0 },
      transportAllowance: { type: Number, default: 0 },
      specialAllowance: { type: Number, default: 0 },
      bonus: { type: Number, default: 0 },
    },
    deductionsBreakdown: {
      leaveDeduction: { type: Number, default: 0 },
      advanceDeduction: { type: Number, default: 0 },
      latePenalty: { type: Number, default: 0 },
      pfDeduction: { type: Number, default: 0 },
      taxDeduction: { type: Number, default: 0 },
    },
    deductions: { type: Number, default: 0 },
    allowances: { type: Number, default: 0 },
    bonus: { type: Number, default: 0 },
    advanceDeduction: { type: Number, default: 0 },
    netSalary: { type: Number, required: true, default: 0 },
    bankDetailsSnapshot: {
      bankName: { type: String, default: '' },
      accountNumber: { type: String, default: '' },
      ifscCode: { type: String, default: '' },
      upiId: { type: String, default: '' },
      panNumber: { type: String, default: '' },
    },
    status: {
      type: String,
      enum: Object.values(SalarySlipStatus),
      default: SalarySlipStatus.GENERATED,
      index: true,
    },
    paymentDate: { type: Date },
    paymentMode: { type: String },
    transactionRef: { type: String },
    remarks: { type: String },
    generatedById: { type: Schema.Types.ObjectId, ref: 'User', required: true },
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

SalarySlipSchema.index({ userId: 1, month: 1, year: 1 }, { unique: true });

SalarySlipSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

SalarySlipSchema.virtual('school', {
  ref: 'School',
  localField: 'schoolId',
  foreignField: '_id',
  justOne: true,
});

SalarySlipSchema.virtual('generatedBy', {
  ref: 'User',
  localField: 'generatedById',
  foreignField: '_id',
  justOne: true,
});

export const SalarySlip = mongoose.model<ISalarySlip>('SalarySlip', SalarySlipSchema);
