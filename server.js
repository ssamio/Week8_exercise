const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const passport = require('passport');
const session = require('express-session');

app.use(express.json());

let todoData = [];
let userData = [];

function getUserByName(name){
    return userData.find(userData => userData.username === name)
}

function getUserById(id){
    return userData.find(userData => userData.id === id)
}

const initPassport = require('./passport-config');
initPassport(passport, getUserByName, getUserById);

app.use(session({
    secret: "FcBZn8j50MCAYn9FlluDa55sX",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());


app.get('/', (req, res) =>{
    res.send('This is the start!');
});

app.post('/api/user/register', checkNotAuth, async (req, res) =>{
    try{
       if(userData.find(e => e.username === req.body.username)){
        return res.status(400).send("User exists already");
       }
       else{
        const hashedPw = await bcrypt.hash(req.body.password, 8);
        const target = {
            id: Date.now().toString(),
            username: req.body.username,
            password: hashedPw
        }
        userData.push(target);
        res.send(target);
       }
    }
    catch{
        res.redirect("/api/user/register");
    }
});

app.post('/api/user/login', checkNotAuth, passport.authenticate('local', { failureMessage: true }),
    function(req, res) {
        res.send("Logged in");
    }    
);

app.get('/api/secret', checkAuth, (req, res) =>{
    res.status(200).send("ok");
});

//Maybe should have try-catch structure, but lazy :(
app.post('/api/todos', checkAuth, (req, res) =>{
    const data = todoData.find(e => e.id === req.user.id);
    if(data){
        data.todos.push(req.body.todo);
        return res.send(data);
    }
    else{
        let target = {"id": req.user.id, "todos": [req.body.todo]};
        todoData.push(target);
        res.send(target);
    }
});

app.get('/api/todos/list', checkAuth, (req, res) =>{
    res.send(todoData);
});

app.get('/api/user/list', checkAuth, (req, res) =>{
    res.send(userData);
});

function checkNotAuth(req, res, next){
    if (req.isAuthenticated()){
        return res.redirect("/");
    }
    return next();
}

function checkAuth(req, res, next){
    if (req.isAuthenticated()){
        return next();
    }
    return res.status(401).send("Not logged in!");
}

app.listen(3000, ()=>{
    console.log("Server running!")
});