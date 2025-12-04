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
}