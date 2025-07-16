const db = require("../../data/dbConfig")

module.exports = async function validation(req, res, next) {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: 'username and password required' })
        }
        const existingUser = await db('users').where('username', username).first()

        if (existingUser) {
            return res.status(400).json({ message: 'username taken' })
        }
        next();
    } catch (error) {
        res.status(500).json({ message: 'internal error', error: error.message })
    }
};
