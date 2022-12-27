require("dotenv").config();
require("express-async-errors");

// extra security packages
const helmet = require("helmet");
const cors = require("cors");
const xss = require("xss-clean");
const useragent = require("express-useragent");
const cookieParser = require("cookie-parser");

const express = require("express");
const app = express();

// connect DB
const connectDB = require("./db/connect");

// routers
const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");
const imageRouter = require("./routes/imageRoutes");
const itemRouter = require("./routes/itemRoutes");
const orderRouter = require("./routes/orderRoutes");
const voucherRouter = require("./routes/voucherRoutes");
const locationRouter = require("./routes/locationRoutes");

// error handler
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

app.set("trust proxy", 1);
app.use(helmet());
app.use(
	cors({
		credentials: true,
		origin: [process.env.REACT_APP_LINK, "http://localhost:3000"], // only allow website in this domain too access the resource of this server
	})
);
app.use(xss());
app.use(useragent.express());

app.use(express.json());
app.use(cookieParser());

const fileUpload = require("express-fileupload");
app.use(fileUpload({ useTempFiles: true, tempFileDir: "/tmp/" }));

// config cloudinary V2
const cloudinary = require("cloudinary").v2;
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

// routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/image", imageRouter);
app.use("/api/item", itemRouter);
app.use("/api/order", orderRouter);
app.use("/api/voucher", voucherRouter);
app.use("/api/location", locationRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 8080;

const { connectedUsers } = require("./utils");

const start = async () => {
	try {
		await connectDB(process.env.MONGO_URI);
		const server = app.listen(port, () =>
			console.log(`Server is listening on port ${port}...`)
		);

		const io = require("socket.io")(server, {
			cors: {
				origin: [process.env.REACT_APP_LINK, "http://localhost:3000"],
			},
		});

		io.on("connection", (socket) => {
			socket.on("subscribe", async (userId) => {
				connectedUsers[userId] = socket;
			});
		});

		app.io = io;
	} catch (error) {
		console.log(error);
	}
};

start();

module.exports = app;
