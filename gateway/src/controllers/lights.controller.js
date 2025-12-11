const lightsEmitter = require('../emmiters/lights.emitter');
const lightsClient = require('../infrestructure/client/lights.client');
const takeManualLightService = require('../services/takeManualLightControll.service');
const getAllLightsService = require('../services/getAllLightsService');
const changeLightStateService = require('../services/changeLightState.service');
const freeManualLightControllService = require('../services/freeManualLightControll.service');


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
        const {user_id, light_code} = req.body;
        await takeManualLightService.takeLightManual(user_id, light_code);
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
        const { user_id, light_code, new_state } = req.body;
        await changeLightStateService.changeLightState(user_id, light_code, new_state);
        res.status(200).json();
    } catch (error) {
        next(error);
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
        const { user_id, light_code } = req.query;
        await freeManualLightControllService.releaseManualControl(user_id, light_code);
        res.status(200).json();
    } catch (error) {   
        next(error);
    }
}
