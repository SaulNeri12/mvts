import axios from 'https://cdn.jsdelivr.net/npm/axios@1.6.0/+esm';

export default class  NotificationClient {
  constructor(baseURL = 'http://localhost:8080'){
    this.api = axios.create({
      baseURL,
      timeout: 15000,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  /**
   * REST Client to get all the notifications from the server.
   * @returns Array of notifications.
   */  
  async getAllNotifications()
  {
    try{
        const lights =  await this.api.get('/api/v1/alerts/today');
        return lights.data;
    }
    catch(error){
      const errorMessage = error.response?.data;
      throw new Error(errorMessage || 'Error al intentar obtener las notificaciones');
    }
  }

}