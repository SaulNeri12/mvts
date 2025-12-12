const axios = require('axios');
const { GatewayError } = require('../../errors/errors');

class LightsService {
  constructor(){
    this.api = axios.create({
      baseURL: 'http://semaforos:3050',
      timeout: 3000,
      headers: { 'Content-Type': 'application/json' } 
    });
  }

  async changeLightState(lightCode, state)
  {
    try{
        return await this.api.post(`/api/v1/semaforos/${lightCode}/hold/state`,
          { estado: state });
    }
    catch(error){
      const errorMessage = error.response?.data;
      throw new GatewayError(errorMessage || 'Error al intentar cambiar el estado del semaforo');
    }
  }


  async getAllLights(){
    try{
      const response = await this.api.get('/api/v1/semaforos');
      return response.data;
    }catch(error){
      console.log(error);
      const errorMessage = error.response?.data;
      throw new GatewayError(errorMessage || 'Error al obtener los semaforos' );
    }
  }

}

module.exports = new LightsService();