import passport from 'passport';
import local from 'passport-local';
import github from 'passport-github2';
import { usersModel } from '../dao/models/users.model.js';
import { createHash, validatePassword } from '../utils.js';
import { config } from './config.js';

export function initializePassport() {

  passport.use('signup', new local.Strategy(
    {
      passReqToCallback: true, usernameField: 'email' // Tell passport to pass the req to our function and that the username is the email
    },

    async (req, username, password, done) => {
      try {
        let {name, age, role='user'} = req.body; // Get data from req body
        if(!username || !password || !age || !name) {
          return done(null, false);
        } else {
          try {
            let findUser = await usersModel.findOne({email:username});
            if (findUser) {
              return done(null, false);
            } 
            password = await createHash(password); // Hash password to store it in the DB
            let newUser = await usersModel.create({name, age, email:username, password, role})
            console.log('New User: ', newUser)
            console.log('Req session on LOGIN: ', req.session);
            return done(null, newUser)
          } catch (error) {
            console.log(error)
            return done(null, false);
          }
        }
      } catch (error) {
        return done(error, null);
      }
    }
  ))

  passport.use('login', new local.Strategy(
    {
      usernameField: 'email'
    },

    async (username, password, done)=> {
      if(!username || !password) {
        return done(null, false);
      }
      try {
        let findUser = await usersModel.findOne({email:username}).lean();
        if (!findUser) { // User not found
          return done(null, false);
        }
        let passwordValid = await validatePassword(findUser, password);
        if (!passwordValid) { // Checks if the login password matches the hash in the DB
          return done(null, false);
        }  
        return done(null, findUser);
      } catch (error) {
        console.log(error);
        return done(error, false);
      }
    }
  ))

  passport.use('github', new github.Strategy(
    {
      clientID: 'Iv1.185facca79f0b420',
      clientSecret: config.CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/api/sessions/callbackGithub'
    },
    async (accessToken, refreshToken, profile, done)=>{
      try {
        let user = await usersModel.findOne({email:profile._json.email}); // See if the user is already registered, if not, create a new one with the data we pull from github
        if (!user) {
          let newUser = {
            name: profile._json.name,
            email: profile._json.email,
            age: 18,
            role: 'user',
            profile: profile
          }
          user = await usersModel.create(newUser);
        }
        return done(null, user);

      } catch (error) {
        return done(error);
      }
    }
  ))

  passport.serializeUser((user, done)=>{
    return done(null, user._id);
  })

  passport.deserializeUser(async (id, done)=>{
    let user = await usersModel.findById(id);
    return done(null, user);
  })

}