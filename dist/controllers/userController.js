"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSortedUsers = exports.softDeleteUser = exports.updateUserInfo = exports.searchUsers = exports.updateFriends = exports.saveGitHubUser = void 0;
const axios_1 = __importDefault(require("axios"));
const User_1 = __importDefault(require("../models/User"));
const saveGitHubUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("controller called");
    const username = req.params.username;
    try {
        const existingUser = yield User_1.default.findOne({ login: username, isDeleted: false });
        console.log("existingUser", existingUser);
        if (existingUser) {
            res.status(200).json({ message: 'User already exists in DB', user: existingUser });
            return;
        }
        const { data } = yield axios_1.default.get(`https://api.github.com/users/${username}`);
        const newUser = new User_1.default({
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
        yield newUser.save();
        res.status(201).json({ message: 'User saved', user: newUser });
    }
    catch (error) {
        res.status(500).json({ message: 'GitHub fetch or DB save failed', error: error.message });
    }
});
exports.saveGitHubUser = saveGitHubUser;
const updateFriends = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const username = req.params.username;
    try {
        const user = yield User_1.default.findOne({ login: username, isDeleted: false });
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
        const [followersRes, followingRes] = yield Promise.all([
            axios_1.default.get(`https://api.github.com/users/${username}/followers`),
            axios_1.default.get(`https://api.github.com/users/${username}/following`)
        ]);
        const followers = followersRes.data.map((u) => u.login);
        const following = followingRes.data.map((u) => u.login);
        // ✅ Get mutuals
        const mutuals = following.filter((login) => followers.includes(login));
        // ✅ Save mutuals to user
        user.friends = mutuals;
        yield user.save();
        res.status(200).json({ message: 'Mutual friends updated and saved', friends: mutuals });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error updating mutual friends', error: err.message });
    }
});
exports.updateFriends = updateFriends;
const searchUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { query } = req.query;
    try {
        const searchRegex = new RegExp(query, 'i'); // case-insensitive
        const users = yield User_1.default.find({
            isDeleted: false,
            $or: [
                { login: { $regex: searchRegex } },
                { name: { $regex: searchRegex } },
                { location: { $regex: searchRegex } },
            ],
        });
        res.status(200).json({ count: users.length, users });
    }
    catch (err) {
        res.status(500).json({ message: 'Search failed', error: err.message });
    }
});
exports.searchUsers = searchUsers;
const updateUserInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.params;
    const { location, blog, bio } = req.body;
    try {
        const user = yield User_1.default.findOne({ login: username, isDeleted: false });
        if (!user) {
            res.status(404).json({ message: 'User not found in DB' });
            return;
        }
        // Only update if fields are present
        if (location !== undefined)
            user.location = location;
        if (blog !== undefined)
            user.blog = blog;
        if (bio !== undefined)
            user.bio = bio;
        yield user.save();
        res.status(200).json({ message: 'User updated successfully', user });
    }
    catch (err) {
        res.status(500).json({ message: 'Update failed', error: err.message });
    }
});
exports.updateUserInfo = updateUserInfo;
const softDeleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.params;
    try {
        const deletedUser = yield User_1.default.findOneAndUpdate({ login: username, isDeleted: false }, { isDeleted: true }, { new: true });
        if (!deletedUser) {
            res.status(404).json({ message: 'User not found or already deleted' });
            return;
        }
        res.status(200).json({ message: 'User soft deleted', user: deletedUser });
    }
    catch (error) {
        res.status(500).json({ message: 'Error during soft delete', error: error.message });
    }
});
exports.softDeleteUser = softDeleteUser;
const getSortedUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { sortBy = 'created_at', order = 'desc' } = req.query;
    const validFields = ['followers', 'following', 'public_repos', 'public_gists', 'created_at'];
    if (!validFields.includes(sortBy)) {
        res.status(400).json({ message: 'Invalid sort field' });
        return;
    }
    const sortOrder = order === 'asc' ? 1 : -1;
    try {
        const users = yield User_1.default.find({ isDeleted: false }).sort({
            [sortBy]: sortOrder,
        });
        res.status(200).json({ count: users.length, users });
    }
    catch (err) {
        res.status(500).json({ message: 'Error fetching sorted users', error: err.message });
    }
});
exports.getSortedUsers = getSortedUsers;
