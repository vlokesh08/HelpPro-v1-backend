import mongoose, { Document, Schema, Model } from "mongoose";
import bcrypt from "bcryptjs";

// Define an interface for the user document
interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  personalInfo?: mongoose.Types.ObjectId;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

// Define the user schema
const userSchema: Schema<IUser> = new Schema(
  {
    email: { type: String, unique: true, required: true },
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    personalInfo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PersonalInfo",
    },
  },
  { timestamps: true }
);

// Method to match password
userSchema.methods.matchPassword = async function (enteredPassword: string): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Middleware to hash password before saving
userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Create the user model
const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export default User;
