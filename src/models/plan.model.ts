import mongoose, { Document, Schema } from 'mongoose';

export interface IPlan extends Document {
  name: string;
  monthlyQuota: number;
  extraChargePerUnit: number;
}

const PlanSchema = new Schema<IPlan>({
  name: {
    type: String,
    required: true,
  },
  monthlyQuota: {
    type: Number,
    required: true
  },
  extraChargePerUnit: {
    type: Number,
    required: true
  }
}, {timestamps: true});

export default mongoose.model<IPlan>('Plan', PlanSchema);