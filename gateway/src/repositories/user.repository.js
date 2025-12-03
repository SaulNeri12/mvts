const userModel = require('../models/user.model');
const {RepositoryError} = require('../errors/errors')

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
        console.log(`An error ocurred while getting the user: ${userId}: `, error.message);
        throw new RepositoryError();
    }
}