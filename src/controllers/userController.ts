import axios from 'axios';
import { Request, Response } from 'express';
import User from '../models/User';
import { promises } from 'dns';

export const saveGitHubUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  console.log("controller called")
  const username = req.params.username;

  try {
    const existingUser = await User.findOne({ login: username, isDeleted: false });
    console.log("existingUser",existingUser)
    if (existingUser) {
      res.status(200).json({ message: 'User already exists in DB', user: existingUser });
      return;
    }

    const { data } = await axios.get(`https://api.github.com/users/${username}`);
    
    const newUser = new User({
      login: data.login,
      name: data.name,
      bio: data.bio,
      avatar_url: data.avatar_url,
      location: data.location,
      blog: data.blog,
      followers_url: data.followers_url,
      following_url: data.following_url,
      public_repos: data.public_repos,
      public_gists: data.public_gists,
      followers: data.followers,
      following: data.following,
      created_at: data.created_at,
    });

    await newUser.save();
    res.status(201).json({ message: 'User saved', user: newUser });

  } catch (error: any) {
    res.status(500).json({ message: 'GitHub fetch or DB save failed', error: error.message });
  }
};

export const updateFriends = async (req: Request, res: Response): Promise<void> => {
  const username = req.params.username;

  try {
    const user = await User.findOne({ login: username, isDeleted: false });
    if (!user) {
      res.status(404).json({ message: 'User not found in DB' });
      return;
    }

    // ✅ Check if mutual friends are already saved
    if (user.friends && user.friends.length > 0) {
      res.status(200).json({ message: 'Mutual friends already exist in DB', friends: user.friends });
      return;
    }

    // 🌀 Fetch followers and following from GitHub
    const [followersRes, followingRes] = await Promise.all([
      axios.get(`https://api.github.com/users/${username}/followers`),
      axios.get(`https://api.github.com/users/${username}/following`)
    ]);

    const followers = followersRes.data.map((u: any) => u.login);
    const following = followingRes.data.map((u: any) => u.login);

    // ✅ Get mutuals
    const mutuals = following.filter((login: string) => followers.includes(login));

    // ✅ Save mutuals to user
    user.friends = mutuals;
    await user.save();

    res.status(200).json({ message: 'Mutual friends updated and saved', friends: mutuals });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: 'Error updating mutual friends', error: err.message });
  }
};

export const searchUsers = async (req: Request, res: Response) => {
  const { query } = req.query;

  try {
    const searchRegex = new RegExp(query as string, 'i'); // case-insensitive
    const users = await User.find({
      isDeleted: false,
      $or: [
        { login: { $regex: searchRegex } },
        { name: { $regex: searchRegex } },
        { location: { $regex: searchRegex } },
      ],
    });

    res.status(200).json({ count: users.length, users });
  } catch (err: any) {
    res.status(500).json({ message: 'Search failed', error: err.message });
  }
};


export const updateUserInfo = async (req: Request, res: Response):Promise<void> => {
  const { username } = req.params;
  const { location, blog, bio } = req.body;

  try {
    const user = await User.findOne({ login: username, isDeleted: false });

    if (!user) {
       res.status(404).json({ message: 'User not found in DB' });
       return
    }

    // Only update if fields are present
    if (location !== undefined) user.location = location;
    if (blog !== undefined) user.blog = blog;
    if (bio !== undefined) user.bio = bio;

    await user.save();

    res.status(200).json({ message: 'User updated successfully', user });
  } catch (err: any) {
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
};

export const softDeleteUser = async (req: Request, res: Response):Promise<void> => {
  const { username } = req.params;

  try {
    const deletedUser = await User.findOneAndUpdate(
      { login: username, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );

    if (!deletedUser) {
       res.status(404).json({ message: 'User not found or already deleted' });
       return
    }

    res.status(200).json({ message: 'User soft deleted', user: deletedUser });
  } catch (error: any) {
    res.status(500).json({ message: 'Error during soft delete', error: error.message });
  }
};

export const getSortedUsers = async (req: Request, res: Response):Promise<void> => {
  const { sortBy = 'created_at', order = 'desc' } = req.query;

  const validFields = ['followers', 'following', 'public_repos', 'public_gists', 'created_at'];
  if (!validFields.includes(sortBy as string)) {
     res.status(400).json({ message: 'Invalid sort field' });
     return
  }

  const sortOrder = order === 'asc' ? 1 : -1;

  try {
    const users = await User.find({ isDeleted: false }).sort({
      [sortBy as string]: sortOrder,
    });

    res.status(200).json({ count: users.length, users });
  } catch (err: any) {
    res.status(500).json({ message: 'Error fetching sorted users', error: err.message });
  }
};

