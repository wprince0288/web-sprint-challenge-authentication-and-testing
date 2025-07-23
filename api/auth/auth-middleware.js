const db = require("../../data/dbConfig")
module.exports = validation


async function validation(req, res, next) {

    try {
        let user = req.body.username
        let username = await db("users").select("username").where("username", user).first()
        console.log(!req.body.username, !req.body.password)

        if (!req.body.username || !req.body.password || !req.body) {
            return res.status(401).json({ message: "username and password required" })
        }

        if (username) {
            return res.status(401).json({ message: "username taken" })
        }
        next()


    } catch (error) {
        res.status(400).json({ message: "username and password required" })
    }

    //     try {
    //         const { username, password } = req.body;
    //         if (!username || !password) {
    //             return res.status(401).json({ message: 'username and password required' })
    //         }
    //         const existingUser = await db('users').where('username', username).first()

    //         if (existingUser) {
    //             return res.status(401).json({ message: 'username taken' })
    //         }
    //         next();

    //     } catch (error) {
    //         res.status(400).json({ message: 'username and pass required'})
    //     }
}