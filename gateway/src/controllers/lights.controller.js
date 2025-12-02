const lightsEmitter = require('../emmiters/lights.emitter');
const lightsClient = require('../infrestructure/client/lights.client');


/**
 * Controller to handle incoming lights messages.
 * @param {String} message message received from lights queue
 */
exports.handleLightsMessage = async (message) => {
    try {
        lightsEmitter.lightsUpdate(message);
    } catch (error) {
        console.log('Error handling lights message:', error);
    }
}

/**
 * Controller to handle taking manual control of a light.
 * @param {String} userId Users ID 
 * @param {String} lightId Light ID
 */
exports.handleTakeManualControl = async (req, res, next) => {
    try{
        const {user_id, light_id} = req.body;
        await lightsClient.takeManualControl(user_id, light_id);
    } catch (error) {
        next(error);
    }
}

/**
 * Controller to handle changing the state of a light.
 * @param {String} lightId Light ID
 * @param {String} newState Light new state
 */
exports.handleLightStateChange = async (req, res, next) => {
    try{
        const { light_id, new_state } = req.body;
        await lightsClient.changeLightState(light_id, new_state);
    } catch (error) {
        console.log('Error changing light state:', error);
    }
}

/**
 * Controller to retrieve all lights from lights service.
 * @returns Array with the lighsts
 */
exports.handleGetAllLights = async (req, res, next) => {
    try{
        const lights = await lightsClient.getAllLights();
        return res.status(200).json(lights);
    } catch (error) {
        next(error);
    }
}

/**
 * Controller to handle releasing manual control of a light.
 * @param {String} lightId Light ID
 */
exports.handleReleaseManualControl = async (req, res, next) => {
    try{
        const { light_id } = req.body;
        await lightsClient.releaseManualControl(light_id);
    } catch (error) {
        next(error);
    }
}
