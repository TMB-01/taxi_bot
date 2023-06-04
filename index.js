const {launchBot} = require("./tg/bot");
const {startDB} = require("./db/db");


launchBot();

startDB();