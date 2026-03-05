import express from 'express'
import swaggerJSDoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import session from 'express-session'
import cors from 'cors'
import path from "path";
//import expressLayouts from 'express-ejs-layouts'

import { router as ItemRouter } from './routes/item_routes.js'
import { router as UserRouter } from './routes/user_routes.js'
import { router as SearchRouter } from './routes/search_routes.js'

import { checkExpiredAuctions } from './utils/item_utils.js'



const app = express()

const corsOptions = {
    origin: ["http://localhost:5173", "http://172.0.0.1:5173"],
    credentials: true
}

app.use(cors(corsOptions))

//--------------------------------------------------------------------------------------------
//Per il front end
/*const __dirname = import.meta.dirname
app.use(express.static(path.join(__dirname, 'src/public')))

app.set("view", path.join(path.join(__dirname, "src"), "view"))
app.set("view engine", "ejs")
app.use(expressLayouts)*/
//--------------------------------------------------------------------------------------------

//ENDPOINT - localhost:3000/ -GET
app.get("/", function (request, response) {
    response.send("Risposta da endpoint")
})

app.listen("3000", /*function () {} oppure */() => {
    console.log("App avviata sulla porta 3000")
})

// app.use((req, res) => {
//     res.status(404).send("La pagina inserita non esiste");
// });




const option = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Prova di API doc",
            version: "0.1"
        },
        servers: [
            {
                url: "http://localhost:3000/",
            },
        ],
    },
    apis: ["./routes/*.js"]
}

setInterval(async () => {
    try {
        await checkExpiredAuctions();
    } catch (error) {
        console.error("Error checking expired auctions:", error);
    }
}, 2 * 60 * 1000);

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 3//tre ore
    }
}))

app.use((req, res, next) => {
    res.locals.isLoggedIn = !!req.session.user;
    res.locals.username = req.session.user ? req.session.user.username : null;
    next();
});

//Form submission inserite in req.body
app.use(express.urlencoded({ extended: true }))
//Trasforma il req.body in formato JSON
app.use(express.json())

const spaces = swaggerJSDoc(option)
const __dirname = import.meta.dirname;
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use("/Items", ItemRouter)
app.use("/user", UserRouter)
app.use("/search", SearchRouter)
app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(spaces))

