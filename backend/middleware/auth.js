import jwt from "jsonwebtoken";

export const verifyToken = async (req, res, next) => {
    try {
        let token = req.header("Authorization");

        if (!token) {
            return res.status(403).json({error: "Access Denied"});
        }

        if (token.startsWith("Bearer ")) {
            token = token.slice(7, token.length).trimLeft();
        }

        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        if (err.name === "JsonWebTokenError") {
            return res.status(401).json({error: "Invalid token"});
        } else if (err.name === "TokenExpiredError") {
            return res.status(401).json({error: "Token has expired"});
        } else {
            return res.status(500).json({error: "Internal Server Error"});
        }
    }
};