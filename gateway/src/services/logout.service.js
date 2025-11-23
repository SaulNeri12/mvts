const userRepository = require('../repositories/user.repository');


// Function to handle user logout
exports.handleLogout = async (userId) =>{
    try {
        await userRepository.incrementTokenVersion(userId);
    } catch (error) {
        console.error('Logout error:', error);
        throw new Error('Logout failed');
    }
}
