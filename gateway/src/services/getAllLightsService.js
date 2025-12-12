const manualLightsRepository = require('../repositories/manualLights.repository');
const lightsClient = require('../infrestructure/client/lights.client')

exports.getAllLights = async () => 
{
    try{
        const lights = await lightsClient.getAllLights();
        if(!lights) return

        return addTakenAttribute(lights);
    }
    catch(error){
        throw error
    }
}

function addTakenAttribute(lights) {
    lights.forEach(light => {
        light.taken = manualLightsRepository.validateIfTaken(light.code);
    });
    return lights;
}
