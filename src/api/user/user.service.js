const db = require('../../config/db');
const bcrypt = require('bcryptjs');

const getUserProfile = async (userId) => {
    const [user] = await db.query(
        'SELECT user_id, email, full_name, role, avatar_url, created_at FROM users WHERE user_id = ?',
        [userId]
    );

    if (user.length === 0) {
        throw new Error("Không tìm thấy người dùng");
    }

    return user[0];
};
const updateUserProfile = async (userId, dataToUpdate) => {
    if (dataToUpdate.password) {
        dataToUpdate.password_hash = await bcrypt.hash(dataToUpdate.password, 10);
        delete dataToUpdate.password; 
    }

    const fields = Object.keys(dataToUpdate);
    const values = Object.values(dataToUpdate);

    if (fields.length === 0) {
        throw new Error("Không có thông tin nào để cập nhật");
    }

    const setClause = fields.map(field => `${field} = ?`).join(', ');
    
    const query = `UPDATE users SET ${setClause} WHERE user_id = ?`;
    values.push(userId); 

    await db.query(query, values);

    const [updatedUser] = await db.query(
        'SELECT user_id, email, full_name, role, avatar_url FROM users WHERE user_id = ?',
        [userId]
    );

    if (updatedUser.length === 0) {
        throw new Error("Không tìm thấy người dùng sau khi cập nhật");
    }

    return updatedUser[0];
};

const deleteUserProfile = async (userId) => {
    const [result] = await db.query('DELETE FROM users WHERE user_id = ?', [userId]);

    if (result.affectedRows === 0) {
        throw new Error("Không tìm thấy người dùng để xóa");
    }

    return { message: "Tài khoản đã được xóa thành công" };
};

module.exports = {
    getUserProfile,
    updateUserProfile,
    deleteUserProfile,
};
