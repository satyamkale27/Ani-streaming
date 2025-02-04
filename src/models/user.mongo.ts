import mongoose, { Document, Schema } from "mongoose";

interface IUser extends Document {
  fullName: string;
  userName: string;
  email: string;
  password: string;
  profileImage: string;
  isGoogleUser: boolean;
}

const userSchema: Schema = new mongoose.Schema({
  fullName: { type: String, required: true },
  userName: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String },
  profileImage: { type: String, required: true },
  isGoogleUser: { type: Boolean, default: false },
});
const User = mongoose.model<IUser>("User", userSchema);
export default User;
