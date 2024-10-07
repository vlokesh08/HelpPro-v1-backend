
import mongoose from "mongoose";

// Define an interface for the personalInfo document
interface IPersonalInfo extends mongoose.Document {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  user: mongoose.Types.ObjectId;
}

// Define the personalInfo schema

const personalInfoSchema = new mongoose.Schema<IPersonalInfo>({
  username: { type: String, unique: true, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

// Create the personalInfo model
const PersonalInfo = mongoose.model<IPersonalInfo>("PersonalInfo", personalInfoSchema);

export default PersonalInfo;