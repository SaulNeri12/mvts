export class UserService {
  
  //Static property to hold the single instance
  static instance = null;

  //Property to hold the current user
  currentUser = null;

  //Private constructor
  constructor() {
    if (UserService.instance) {
      return UserService.instance; // Returns the existing instance if already created
    }
    UserService.instance = this; // Saves the instance
  }

  loginUser(id, password) {
    this.currentUser = {
      identifier: id,
      password: password,
      name: "John Doe",
      role: "NORMAL_USER"
    };
  }

  getCurrentUser() {
    return this.currentUser;
  }
  
}
