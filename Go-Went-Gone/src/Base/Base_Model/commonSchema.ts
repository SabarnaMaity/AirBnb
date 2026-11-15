import { modelOptions, prop } from "@typegoose/typegoose";
import mongoose from "mongoose";

@modelOptions({ schemaOptions: { _id: false } })
export class NameModel {
  @prop()
  first?: string;

  @prop()
  last?: string;

  @prop()
  firstName?: string;

  @prop()
  lastName?: string;
}

@modelOptions({ schemaOptions: { _id: false } })
export class IGeoLocation {
  @prop({ required: true})
  lat!: number;

  @prop({ required: true })
  lng!: number;

  @prop({ required: true})
  ip!: string
}


@modelOptions({ schemaOptions: { _id: false } })
export class Address {
  @prop({  trim: true })
  addressLine?: string;

  @prop({ trim: true })
  city?: string;

  @prop({  trim: true })
  state?: string;

  @prop({ trim: true })
  country?: string;

  @prop({ trim: true })
  postalCode?: string;

}


@modelOptions({ schemaOptions: { _id: false } })
export class ContactInfo {
  @prop()
  phone?: string;

  @prop()
  email?: string;

  @prop()
  emergencyContact?: string;
}


@modelOptions({ schemaOptions: { _id: false } })
export class PropertyVerification {
  @prop({ required: true})
  pan !: string

  @prop({ required: true})
  propertyDetails!: string

  @prop({ default: false})
  verification !: boolean
}

@modelOptions({ schemaOptions: { _id: false } })
export class BankDetails {
  @prop({ trim: true, default: "HDFC Bank" })
  bankName?: string;

  @prop({ trim: true, default: "Host Account" })
  AccountHoldername?: string;

  @prop({ trim: true })
  accountHolderName?: string;

  @prop({ default: 5010023456789 })
  accountNumber?: number;

  @prop({ trim: true, default: "HDFC0001234" })
  IFSC?: string;

  @prop({ trim: true })
  ifscCode?: string;

  @prop({ default: false })
  verfication?: boolean;
}

export class review {
  @prop({ type: () => mongoose.Types.ObjectId })
  user !: mongoose.Types.ObjectId

  @prop({ type: String })
  comment !: mongoose.Types.ObjectId

  @prop({ type: () => Number })
  rating !: number

}

export class UserDocument {
  @prop({ type: () => String })
  document !: string
}
 