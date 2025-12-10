const lightsEmitter = require('../emmiters/lights.emitter');
const lightsClient = require('../infrestructure/client/lights.client');
const takeManualLightService = require('../services/takeManualLightControll.service');
const getAllLightsService = require('../services/getAllLightsService');


/**
 * Controller to handle incoming lights messages.
 * @param {Object} req Request object.
 * @param {Object} res Response object.
 * @param {Object} next Middlware object.
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
 * @param {Object} req Request object.
 * @param {Object} res Response object.
 * @param {Object} next Middlware object.
 */
exports.handleTakeManualControl = async (req, res, next) => {
    try{
        const {user_id, light_id} = req.body;
        await takeManualLightService.takeLightManual(user_id, light_id);
        res.status(200).json({ message: "Light successfully taken" });
    } catch (error) {
        next(error);
    }
}

/**
 * Controller to handle changing the state of a light.
 * @param {Object} req Request object.
 * @param {Object} res Response object.
 * @param {Object} next Middlware object.
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
 * @param {Object} req Request object.
 * @param {Object} res Response object.
 * @param {Object} next Middlware object.
 */
exports.handleGetAllLights = async (req, res, next) => {
    try{
        const lights = await getAllLightsService.getAllLights();
        return res.status(200).json(lights);
    } catch (error) {
        next(error);
    }
}

/**
 * Controller to handle releasing manual control of a light.
 * @param {Object} req Request object.
 * @param {Object} res Response object.
 * @param {Object} next Middlware object.
 */
exports.handleReleaseManualControl = async (req, res, next) => {
    try{
        const { light_id } = req.body;
        await lightsClient.releaseManualControl(light_id);
    } catch (error) {
        next(error);
    }
}
