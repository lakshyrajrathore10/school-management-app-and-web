import mongoose, { Schema, Document } from 'mongoose';
import { Role } from '../types/enums';

export interface IBankDetails {
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  upiId?: string;
  panNumber?: string;
}

export interface IUser extends Document {
  id: string;
  employeeId: string;
  email?: string;
  passwordHash: string;
  name: string;
  phone?: string;
  designation?: string;
  department?: string;
  role: Role;
  avatarUrl?: string;
  baseSalary?: number;
  bankDetails?: IBankDetails;
  isActive: boolean;
  schoolId: mongoose.Types.ObjectId | string;
  school?: any;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    employeeId: { type: String, required: true, unique: true, index: true },
    email: { type: String, unique: true, sparse: true, index: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: String },
    designation: { type: String },
    department: { type: String },
    role: { type: String, enum: Object.values(Role), default: Role.STAFF },
    avatarUrl: { type: String },
    baseSalary: { type: Number, default: 0 },
    bankDetails: {
      bankName: { type: String, default: '' },
      accountNumber: { type: String, default: '' },
      ifscCode: { type: String, default: '' },
      upiId: { type: String, default: '' },
      panNumber: { type: String, default: '' },
    },
    isActive: { type: Boolean, default: true },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    lastLoginAt: { type: Date },
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

UserSchema.virtual('school', {
  ref: 'School',
  localField: 'schoolId',
  foreignField: '_id',
  justOne: true,
});

export const User = mongoose.model<IUser>('User', UserSchema);
