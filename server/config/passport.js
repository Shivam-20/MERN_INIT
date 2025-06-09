import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import User from '../models/User.js';
import { AppError } from '../utils/errorHandler.js';
import env from './env.js';

/**
 * Configure JWT strategy for Passport
 * This middleware verifies the JWT token in the Authorization header
 * and attaches the user to the request object
 */
const jwtOptions = {
  // Extract JWT from the Authorization header as a Bearer token
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  // Secret key to verify the token's signature
  secretOrKey: env.JWT_SECRET,
  // Allow for token expiration to be overridden in tests
  ignoreExpiration: env.NODE_ENV === 'test',
  // Pass request to callback
  passReqToCallback: true,
};

/**
 * JWT authentication strategy
 * Verifies the JWT token and attaches the user to the request object
 * @param {Object} req - Express request object
 * @param {Object} payload - Decoded JWT payload
 * @param {Function} done - Passport callback
 */
const jwtStrategy = async (req, payload, done) => {
  try {
    // Check if token has expired
    if (payload.exp <= Date.now() / 1000) {
      return done(
        new AppError('Token has expired. Please log in again.', 401),
        false
      );
    }

    // Find the user by ID from the token payload
    console.log('JWT Payload:', payload);
    console.log('Searching for user with ID:', payload.id);
    
    // Explicitly select the user with all necessary fields
    const user = await User.findById(payload.id).select('+password +role +isActive');
    
    // Log basic user info (without sensitive data)
    console.log('Found user:', user ? { 
      id: user._id, 
      email: user.email, 
      isActive: user.isActive,
      role: user.role
    } : 'User not found');

    // If user not found
    if (!user) {
      console.log('User not found in database');
      return done(new AppError('User not found', 401), false);
    }
    
    // Check if user is active - default to true if not set
    const isUserActive = user.isActive === undefined ? true : user.isActive;
    console.log('User isActive:', isUserActive, 'Type:', typeof isUserActive);
    
    if (!isUserActive) {
      console.log('User account is not active');
      return done(new AppError('User account is inactive', 401), false);
    }
    
    // Log user data for debugging (without sensitive data)
    console.log('User data:', JSON.stringify({
      _id: user._id,
      email: user.email,
      isActive: user.isActive,
      role: user.role,
      createdAt: user.createdAt
    }, null, 2));

    // Check if user changed password after the token was issued
    if (user.changedPasswordAfter && user.changedPasswordAfter(payload.iat)) {
      return done(
        new AppError('User recently changed password! Please log in again.', 401),
        false
      );
    }

    // Attach user to request object
    req.user = user;

    // Return the user
    return done(null, user);
  } catch (error) {
    console.error('Error in JWT strategy:', error);
    return done(error, false);
  }
};

/**
 * Initialize passport with JWT strategy
 * @param {Object} passport - Passport instance
 */
const configurePassport = (passport) => {
  // Serialize user into the session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from the session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Use JWT strategy
  passport.use(new JwtStrategy(jwtOptions, jwtStrategy));
};

export { configurePassport };
