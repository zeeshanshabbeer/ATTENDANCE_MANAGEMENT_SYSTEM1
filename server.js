const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const app = require('./app');
const connectDb = require("./connect/database");
connectDb();

//localhost port
const port = process.env.PORT;
app.listen(port, () => {
    console.log(`App running in ${process.env.NODE_ENV}  mode on port ${port}...`);
})