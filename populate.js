require("dotenv").config();

const connectDB = require("./db/connect");

const Item = require("./models/Item");
const jsonItems = require("./items.json");

const start = async () => {
	try {
		await connectDB(process.env.MONGO_URI);

		await Item.create(jsonItems);

		console.log("Success!!!!");
		process.exit(0);
	} catch (error) {
		console.log(error);
		process.exit(1);
	}
};

start();
