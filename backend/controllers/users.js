import User from "../models/User.js";

/* Read */
export const getUser = async (req, res) => {
    try {
        const {id} = req.params;
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({message: "User not found"});
        }

        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({message: "Internal Server Error"});
    }
};

export const getUserFriends = async (req, res) => {
    try {
        const {id} = req.params;
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({message: "User not found"});
        }

        const friends = await Promise.all(
            user.friends.map((id) => User.findById(id))
        );

        // Check if any friend is not found in the database.
        const nonExistingFriends = friends.filter((friend) => !friend);
        if (nonExistingFriends.length > 0) {
            return res.status(404).json({message: "One or more friends not found"});
        }

        const formattedFriends = friends.map(
            ({_id, firstName, lastName, occupation, location, picturePath}) => {
                return {_id, firstName, lastName, occupation, location, picturePath};
            }
        );
        res.status(200).json(formattedFriends);
    } catch (err) {
        res.status(404).json({message: err.message});
    }
};

/* Update */
export const addRemoveFriend = async (req, res) => {
    try {
        const {id, friendId} = req.params;
        const user = await User.findById(id);
        const friend = await User.findById(friendId);

        if (!user) {
            return res.status(404).json({message: "User not found."});
        }

        if (!friend) {
            return res.status(404).json({message: "Friend not found."});
        }

        if (user.friends.includes(friendId)) {
            user.friends = user.friends.filter((id) => id !== friendId);
            friend.friends = friend.friends.filter((id) => id !== id);
        } else {
            user.friends.push(friendId);
            friend.friends.push(id);
        }
        await user.save();
        await friend.save();

        const friends = await Promise.all(
            user.friends.map((id) => User.findById(id))
        );
        const formattedFriends = friends.map(
            ({_id, firstName, lastName, occupation, location, picturePath}) => {
                return {_id, firstName, lastName, occupation, location, picturePath};
            }
        );

        res.status(200).json(formattedFriends);
    } catch (err) {
        res.status(500).json({message: "Something went wrong."});
    }
};