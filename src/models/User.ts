import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  login: string;
  name: string;
  bio?: string;
  avatar_url?: string;
  location?: string;
  blog?: string;
  followers_url?: string;
  following_url?: string;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  friends: string[];
  isDeleted: boolean;
}

const UserSchema = new Schema<IUser>({
  login: { type: String, required: true, unique: true },
  name: String,
  bio: String,
  avatar_url: String,
  location: String,
  blog: String,
  followers_url: String,
  following_url: String,
  public_repos: Number,
  public_gists: Number,
  followers: Number,
  following: Number,
  created_at: String,
  friends: [String],
  isDeleted: { type: Boolean, default: false }
});

export default mongoose.model<IUser>('User', UserSchema);
 