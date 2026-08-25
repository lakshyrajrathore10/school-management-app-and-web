import mongoose, { Schema, Document } from 'mongoose';

export enum LoanStatus {
  ACTIVE = 'ACTIVE',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}

export interface IRepayment {
  salarySlipId?: mongoose.Types.ObjectId | string;
  amount: number;
  date: Date;
  month: number;
  year: number;
  note?: string;
}

export interface IStaffLoan extends Document {
  id: string;
  userId: mongoose.Types.ObjectId | string;
  user?: any;
  schoolId: mongoose.Types.ObjectId | string;
  title: string;
  totalAmount: number;
  monthlyEmi: number;
  remainingAmount: number;
  status: LoanStatus;
  disbursedDate: Date;
  remarks?: string;
  repaymentHistory: IRepayment[];
  createdAt: Date;
  updatedAt: Date;
}

const RepaymentSchema = new Schema<IRepayment>(
  {
    salarySlipId: { type: Schema.Types.ObjectId, ref: 'SalarySlip' },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    note: { type: String },
  },
  { _id: false }
);

const StaffLoanSchema = new Schema<IStaffLoan>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    title: { type: String, required: true, default: 'Staff Advance Loan' },
    totalAmount: { type: Number, required: true, min: 0 },
    monthlyEmi: { type: Number, required: true, min: 0 },
    remainingAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: Object.values(LoanStatus),
      default: LoanStatus.ACTIVE,
      index: true,
    },
    disbursedDate: { type: Date, default: Date.now },
    remarks: { type: String },
    repaymentHistory: [RepaymentSchema],
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

StaffLoanSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

export const StaffLoan = mongoose.model<IStaffLoan>('StaffLoan', StaffLoanSchema);
