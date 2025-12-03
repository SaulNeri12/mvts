import axios from 'https://cdn.jsdelivr.net/npm/axios@1.6.0/+esm';

export default class  SessionService {
  constructor(){
    this.api = axios.create({
      baseURL: 'http://localhost:3000',
      timeout: 3000,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  
  async takeManualControl(userId, lightId){
    try 
    {
      const response = await this.api.put('url', {
          user_id: userId,
          light_id: lightId
        }
      );
      return response.data; 
    } 
    catch (error)
    {
      const errorMessage = error.response?.data;
      throw new Error(errorMessage || 
        'Error inesperado al tomar control de manual');
    }
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
      await this.api.get('url', {});
    }catch(error){
      const errorMessage = error.response?.data;
      throw new Error(errorMessage || 'Error al obtener los semaforos' );
    }
  }

  async releaseManualControl(lightId, newState)
  {
    try{
        return await this.api.patch('', { 
            light_id: lightId,
          }
        );
    }
    catch(error){
      const errorMessage = error.response?.data;
      throw new Error(errorMessage || 'Error al inter liberar el control manual' );
    }
  }

}