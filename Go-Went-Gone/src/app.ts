import * as express from 'express';
import * as dotenv from "dotenv";
import initializeModules from './modules/initializeModules';
import { connectDB } from './cofig/mongoConfig';
import { autoSeed } from './seed';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if (req.method === "OPTIONS") {
        res.sendStatus(200);
        return;
    }
    next();
});

app.use(express.json());
initializeModules(app);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

connectDB().then(() => {
    autoSeed();
}).catch((err) => {
    console.error("DB connection error:", err);
});