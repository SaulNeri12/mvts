import axios from 'https://cdn.jsdelivr.net/npm/axios@1.6.0/+esm';

export default class  LightsClient {
  constructor(baseURL = 'http://localhost:8080'){
    this.api = axios.create({
      baseURL,
      timeout: 15000,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  /**
   * REST Client to get al the semaphores from the server.
   * @returns All the semaphores.
   */  
  async getAllLights()
  {
    try{
        const lights =  await this.api.get('/api/v1/lights');
        return lights.data;
    }
    catch(error){
      const errorMessage = error.response?.data;
      throw new Error(errorMessage || 'Error al intentar obtener los semaforos');
    }
  }

  async getManualLights(userId){
    try{
        const lights =  await this.api.get(`/api/v1/lights/${userId}/manual/lights`);
        return lights.data;
    }
    catch(error){
      const errorMessage = error.response?.data;
      throw new Error(errorMessage || 'Error al intentar obtener los semaforos');
    }
  }

  async takeManualLightControll(userId, lightCode, section, state)
  {
    try{
        await this.api.post('/api/v1/lights/manual/control', 
          {
            user_id: userId,
            light: {
              code: lightCode,
              section: section,
              status: state
            }
          });
    }
    catch(error){
      const errorMessage = error.response?.data;
      throw new Error(errorMessage || 'Error al intentar tomar el control manual');
    }
  }

  async changeLightState(userId, lightCode, newState)
  {
    try{
        await this.api.post('/api/v1/lights/change/state', 
          {
            user_id: userId,
            light_code: lightCode,
            new_state: newState
          });
    }
    catch(error){
      const errorMessage = error.response?.data;
      throw new Error(errorMessage || 'Error al intentar tomar el control manual');
    }
  }

    async freeLightManualControll(userId, lightCode) 
    {
      try {
        await this.api.delete('/api/v1/lights/user/manual/light/control', {
          data: {
            user_id: userId,
            light_code: lightCode,
          }
        });
      } catch (error) {
        const errorMessage = error.response?.data;
        throw new Error(errorMessage || 'Error al intentar liberar el semáforo');
      }
    }
  
}