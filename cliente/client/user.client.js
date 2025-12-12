import axios from 'https://cdn.jsdelivr.net/npm/axios@1.6.0/+esm';

export default class  UserClient {
  constructor(baseURL = 'http://localhost:8080'){
    this.api = axios.create({
      baseURL,
      timeout: 15000,
      headers: { 'Content-Type': 'application/json' }
    });

    this.api.interceptors.request.use(config => {
      if(this.accessToken){
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${this.accessToken}`;
      }
      return config;
    });
  }

  setAccessToken(token){
    this.accessToken = token || null;
  }

  /**
   * REST Client to log in a user and bring his information
   * (id, rol, name and tokens).
   * 
   * @param {String} id identificator of the user.
   * @param {String} password password of the user.
   * @returns 
   */
  async login(UserId, password){
    try 
    {
      const response = await this.api.post('/user/api/v1/login', {
          user_id: UserId,
          password: password
        }
      );
      return response.data; 
    } 
    catch (error)
    {
      const errorMessage = error.response?.data;
      throw new Error(errorMessage || 'Error de conexion intente de nuevo');
    }
  }

  /**
   * 
   * @param {*} payload 
   * @param {*} config 
   * @returns 
   */
  refreshToken(payload, config = {}){
    return this.api.post('/refresh_token', payload, config).then(res => res.data);
  }

  /**
   * REST Client to close a session in the server.
   * 
   * @param {String} id identificator of the user.
   * @param {*} refreshToken refresh token of the session.
   * @returns 
   */  
  async singleLogout(userId, refreshToken)
  {
    try{
        return await this.api.delete('/api/v1/sessions/logout', {
          data: { 
            user_id: userId,
            refresh_token: refreshToken
          }
        });
    }
    catch(error){
      const errorMessage = error.response?.data;
      throw new Error(errorMessage || 'Error al intentar cerrar sesion intente de nuevo');
    }
  }
}