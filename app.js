//jshint esversion:6
import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');

mongoose.connect('mongodb://localhost:27017/userDB');

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

const saltRounds = 10;

userSchema.pre('save', async function (next) {
    const user = this;
    if (!user.isModified('password')) return next();

    try {
        const hash = await bcrypt.hash(user.password, saltRounds);
        user.password = hash;
        next();
    } catch (err) {
        return next(err);
    }
});

const User = mongoose.model('User', userSchema);


app.get("/", function (req, res) {
    res.render("home");
})

app.get("/login", function (req, res) {
    res.render("login");
})

app.get("/register", function (req, res) {
    res.render("register");
})

app.post("/register", function (req, res) {
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    });

    newUser.save()
        .then(() => {
            res.render("secrets");
        })
        .catch((err) => {
            console.error(err);
            res.render("error", { message: "Registration failed. Please try again." });
        });
});

app.post("/login", function (req, res) {
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({ email: username })
        .then((foundUser) => {
            if (foundUser) {
                // For demonstration purposes, comparing passwords in plain text
                if (foundUser.password === password) {
                    res.render("secrets");
                } else {
                    res.render("error", { message: "Incorrect password. Please try again." });
                }
            } else {
                res.render("error", { message: "User not found. Please register." });
            }
        })
        .catch((err) => {
            console.error(err);
            res.render("error", { message: "Login failed. Please try again." });
        });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});