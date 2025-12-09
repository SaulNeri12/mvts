const axios = require('axios');

class SessionService {
  constructor(){
    this.api = axios.create({
      baseURL: 'http://semaforos:3050',
      timeout: 3000,
      headers: { 'Content-Type': 'application/json' } 
    });
  }

  async changeLightState(lightId, newState)
  {
    try{
        return await this.api.patch('url', { 
            light_id: lightId,
            new_state: newState
          }
        );
    }
    catch(error){
      const errorMessage = error.response?.data;
      throw new Error(errorMessage || 'Error al intentar cerrar sesion intente de nuevo');
    }
  }


  async getAllLights(){
    try{
      const response = await this.api.get('/api/v1/semaforos');
      return response.data;
    }catch(error){
      console.log(error);
      const errorMessage = error.response?.data;
      throw new Error(errorMessage || 'Error al obtener los semaforos' );
    }
  }

}

module.exports = new SessionService();