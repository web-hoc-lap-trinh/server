const userService = require('./user.service');

const getProfile = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const userProfile = await userService.getUserProfile(userId);
        res.json(userProfile);
    } catch (err) {
        console.error(err);
        res.status(404).json({ message: err.message });
    }
};
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.user_id; 
        const { full_name, email, password } = req.body;
        
        const dataToUpdate = {};

        if (full_name) dataToUpdate.full_name = full_name;
        if (email) dataToUpdate.email = email;
        if (password) dataToUpdate.password = password;

        if (req.file) {
            dataToUpdate.avatar_url = `/uploads/avatars/${req.file.filename}`;
        }
        
        const updatedUser = await userService.updateUserProfile(userId, dataToUpdate);

        res.json({
            message: "Cập nhật hồ sơ thành công",
            user: updatedUser
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message || "Lỗi server" });
    }
};
const deleteProfile = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const result = await userService.deleteUserProfile(userId);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    deleteProfile,
};