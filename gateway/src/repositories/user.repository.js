const userModel = require('../models/user.model');

/**
 * Find a user by the id given in the parameter.
 * @param {String} userId 
 * @returns 
 */
exports.getUserById = async (userId) => 
{
    try
    {
        return await userModel.findOne({id: userId}, {_id: 0, classes: 0});
    }
    catch(error)
    {
        console.log("Error al intentar obtener el usuario", error.message);
        throw new Error();
    }
}