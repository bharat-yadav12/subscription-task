import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IUsageRecord extends Document {
  userId: Types.ObjectId;
  action: string;
  usedUnits: number;
  createdAt: Date;
}

const UsageRecordSchema = new Schema<IUsageRecord>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true
  },
  usedUnits: {
    type: Number,
    required: true,
    min: 1
  }
}, {timestamps: true  });

export default mongoose.model<IUsageRecord>('UsageRecord', UsageRecordSchema);