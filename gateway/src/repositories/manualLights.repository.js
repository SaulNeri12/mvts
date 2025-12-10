const { RepositoryError } = require('../errors/errors');

/**
 * Repository for tracking manual control assignments of lights by users.
 *
 * Data structure: manualLights: { [userId]: Array<string> }
 *
 * Each user may take up to `MAX_PER_USER` lights concurrently.
 */
const MAX_PER_USER = 3;
const manualLights = {};

/**
 * Add a manual control assignment for a user and a light.
 * If the user already has the light assigned, the function is a no-op.
 * If the user already reached the maximum allowed lights, the function
 * returns false and does not add the assignment.
 *
 * @param {string} userId - User identifier.
 * @param {string} lightCode - Light identifier code.
 * @returns {boolean} True if the assignment was added, false otherwise.
 */
exports.addManualControll = (userId, lightCode) => {
    if (!manualLights[userId]) manualLights[userId] = [];

    const userLights = manualLights[userId];
    if (userLights.includes(lightCode)) return false;

    userLights.push(lightCode);
    return true;
};

/**
 * Check if any user already uses that light in manual
 *
 * @param {string} lightCode - Light identifier code.
 */
exports.validateIfAlreadyTaken = (lightCode) => {
    for (const lights of Object.values(manualLights)) {
        if (Array.isArray(lights) && lights.includes(lightCode)) {
            throw new RepositoryError('El semáforo ya se encuentra bajo control');
        }
    }
};

/**
 * Check if the light is taken
 *
 * @param {string} lightCode - Light identifier code.
 */
exports.validateIfTakenByUser = (userId, lightCode) => {
    const userLights = manualLights[userId];
    if (!userLights || userLights.length === 0) {
        return false;
    }
    return userLights.includes(lightCode);
};

exports.validateIfTaken = (lightCode) => {
    for (const lights of Object.values(manualLights)) {
        if (Array.isArray(lights) && lights.includes(lightCode)) {
            return true;
        }
    }
    return false;
};


/**  
 * Validate whether the user can take more lights (i.e. is below the maximum).
 *
 * @param {string} userId - User identifier.
 */
exports.validateMaximumInControll = (userId) => {
    if (!userId) return false;
    const userLights = manualLights[userId];
    if (!Array.isArray(userLights)) return true;

    if(userLights.length > MAX_PER_USER) {
        throw new RepositoryError('Maximo de semaforos en manual alcanzado')
    }
};


/**
 * Free a single manual control assignment for a user.
 *
 * @param {string} userId - User identifier.
 * @param {string} lightCode - Light identifier code to free.
 * @returns {boolean} True if the assignment was removed, false if it did not exist.
 */
exports.freeManualControll = (userId, lightCode) => 
{
    if (!userId || !lightCode) return false;
    const userLights = manualLights[userId];
    if (!Array.isArray(userLights) || userLights.length === 0) return false;

    const idx = userLights.indexOf(lightCode);
    if (idx === -1) return false;
    userLights.splice(idx, 1);
    if (userLights.length === 0) delete manualLights[userId];
    return true;
};

/**
 * Free all manual control assignments for a user.
 *
 * @param {string} userId - User identifier.
 * @returns {boolean} True if any assignments were removed, false otherwise.
 */
exports.freeAllManualControllLights = (userId) => 
{
    if (!userId) return false;
    if (!manualLights[userId]) return false;
    delete manualLights[userId];
    return true;
};