import { User } from '../../types/user.interface';

// Allows to set user property for request.session object
declare module 'express-session' {
  interface SessionData {
    user: User;
    // Other necessary properties can be added here
  }
}
