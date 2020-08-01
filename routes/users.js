const express = require('express');
const path = require('path');
const fs = require('fs');
const md5 = require('md5');
const httpErrors = require('http-errors');
const _ = require('lodash');
const router = express.Router();

const USER_DIR = path.join(__dirname, '../data/users');

router.post('/sign-in', (req, res, next) => {
    try {
        const {email, password} = req.body;
        const userFile = path.join(USER_DIR, email + '.json');
        if (!fs.existsSync(userFile)) {
            throw httpErrors(403, 'wrong email or password')
        }

        const data = fs.readFileSync(userFile, 'utf-8');
        const user = JSON.parse(data);
        if (user.password !== md5(md5(password) + '_safe')) {
            throw httpErrors(403, 'wrong email or password')
        }
        const signIn = path.join(USER_DIR, 'signIn.json');
        if (fs.existsSync(signIn)) {
            throw httpErrors(403, `profile ${email} pleas logout`)
        }

        fs.writeFileSync(signIn, JSON.stringify(user))
        // delete user.password;
        res.send({
            status: 'ok',
            user,
        })

    } catch (e) {
        next(e);
    }
});

router.post('/send-message', (req, res, next) => {
    try {
        const {email, message} = req.body;
        const signInEmail = path.join(USER_DIR, 'signIn.json');
        const signInEmailReade = fs.readFileSync(signInEmail, 'utf-8')
        const signInEmailData = JSON.parse(signInEmailReade)
        const sendUser = path.join(USER_DIR, signInEmailData.email + '.json');
        const inboxUser = path.join(USER_DIR, email + '.json')
        if (!fs.existsSync(sendUser) || !fs.existsSync(inboxUser) || !fs.existsSync(signInEmail)) {
            throw httpErrors(404, `note found`)
        }

        const readSendUser = fs.readFileSync(sendUser, 'utf-8')
        const readInboxUser = fs.readFileSync(inboxUser, 'utf-8')

        const sendUserData = JSON.parse(readSendUser)
        const inboxUserData = JSON.parse(readInboxUser)

        sendUserData.messageSend = [
            ...sendUserData.messageSend, {
                "id": _.uniqueId(),
                email: inboxUserData.email, message
            }
        ]

        inboxUserData.messageInbox = [
            ...inboxUserData.messageInbox, {
                "id": _.uniqueId(),
                email: sendUserData.email,
                message: message
            }]

        fs.writeFileSync(path.join(USER_DIR, sendUserData.email + '.json'), JSON.stringify(sendUserData))
        fs.writeFileSync(inboxUser, JSON.stringify(inboxUserData))
        fs.writeFileSync(signInEmail, JSON.stringify(sendUserData))

        res.send({
            status: 'ok',
        })

    } catch (e) {
        next(e);
    }
});

router.post('/logout', (req, res, next) => {
    try {
        const logout = path.join(USER_DIR, 'signIn.json');
        fs.unlinkSync(logout)
        res.send({
            status: 'ok',
        })
    } catch (e) {
        next(e);
    }
});


router.post('/sign-up', (req, res, next) => {
    try {
        const {name, email, password, birth} = req.body;
        const userFile = path.join(USER_DIR, email + '.json');

        if (fs.existsSync(userFile)) {
            throw httpErrors(422, 'user already exists')
        }

        fs.writeFileSync(path.join(USER_DIR, email + '.json'), JSON.stringify({
            name,
            email,
            password: md5(md5(password) + '_safe'),
            birth,
            messageSend: [],
            messageInbox: []
        }))

        res.json({
            status: 'ok'
        })

    } catch (e) {
        next(e);
    }
});


router.delete('/remove', (req, res, next) => {
    try {
        const {email, password} = req.body;

        const userFile = path.join(USER_DIR, email + '.json');
        const data = fs.readFileSync(userFile, "utf-8")
        const userPassword = JSON.parse(data);

        if (!fs.existsSync(userFile)) {
            throw httpErrors(404, 'wrong username or password')
        }

        if (userPassword.password !== md5(md5(password) + '_safe')) {
            throw httpErrors(404, 'wrong username or password')
        }

        fs.unlinkSync(userFile)

        res.json({
            status: 'ok',
        })

    } catch (e) {
        next(e);
    }
})

router.get('/', (req, res, next) => {
    try {

        const userFiles = fs.readdirSync(USER_DIR);

        const users = userFiles.map((file) => {
            const userFile = path.join(USER_DIR, file);
            const data = fs.readFileSync(userFile, 'utf-8');
            const user = JSON.parse(data);
            delete user.password;
            return user;
        })

        res.json({
            status: 'ok',
            users,
        })
    } catch (e) {
        next(e);
    }
});


module.exports = router;
