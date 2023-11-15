import passport from "passport";
import local from 'passport-local';
import GithubStrategy from 'passport-github2';

import UserManager from "../dao/mongo/managers/userManager.js";
import auth from "../services/auth.js";


//Estrategia local = Registro y Login
const LocalStrategy = local.Strategy; // Local = username/email + password

const usersService = new UserManager();

const initializeStrategies = () =>{
    //¿Qué estrategias instalé?

    //PASSPORT ODIA CUALQUIER COSA QUE NO SEA USERNAME
    passport.use('register',new LocalStrategy({passReqToCallback:true, usernameField:'email'},async (req,email,password,done)=>{
        //FINALMENTE meto la lógica de mi registro
        const {
            firstName,
            lastName,
            age
        } = req.body;
        if(!firstName||!email||!password) return done(null,false,{message:"Incomplete values"})
        //Validar que el usuario no esté registrado ya

        //Aquí va mi validación return done(null,false,{message:"User already exists"})

        //Si ya pasó la validación, antes de crear, hasheo la contraseña
        const hashedPassword = await auth.createHash(password);
        const newUser = {
            firstName,
            lastName,
            email,
            age,
            password: hashedPassword
        }
        const result = await usersService.create(newUser);
        //Si salió bien, SIEMPRE devuelve al user
        done(null,result)
    }))

    passport.use('login', new LocalStrategy({usernameField:'email'},async(email,password, done)=>{
    //Oye, se supone que debe estar registrado ¿no?, entonces hay que buscarlo en la base de datos
    if(!email||!password) return done(null,false,{message:"Incomplete values"})
    const user = await usersService.getBy({email})
    if(!user) return done(null,false,{message:"Incorrect Credentials"})
    //Ya que existe el usuario, ahora debo comparar las contraseñas
    const isValidPassword = await auth.validatePassword(password,user.password);
    if(!isValidPassword) return done(null,false,{message:"Incorrect Credentials"});

    //La magia de "done" es devolver al usuario, por lo tanto, no puedo usar req.session aquí
        done(null,user);
    }))

    passport.use('github', new GithubStrategy({
        clientID:'Iv1.659d3061512319a8',
        clientSecret:'d3beeffddee24da92a91c1f657c2c377daa8fd84',
        callbackURL:'http://localhost:8080/api/sessions/githubcallback'
    },async (accessToken, refreshToken, profile, done)=> {
        console.log(profile);
        const {email, name} = profile._json;
        //Ahora sí, comenzamos a trabajar con NUESTRA base de datos
        // ¿El usuario ya existía? 
        const user = await usersService.getBy({email});
        if(!user){
            //No existe? LO CREO
            const newUser = {
                firstName:name,
                email,
                password:''
            }
            const result = await usersService.create(newUser);
            done(null, result);
        }else {
            //Sí existe? entonces sólo devuélvelo.
            done(null,user);
        }
    }))

    //FUTURAS ESTRATEGIAS (FACEBOOK, APPLE, TIKTOK, GITHUB)

    passport.serializeUser((user,done)=>{
        return done(null,user._id);
    });
    
    passport.deserializeUser(async(id,done)=>{
        const user = await usersService.getBy({_id:id});
        done(null,user);
    });

}

export default initializeStrategies;