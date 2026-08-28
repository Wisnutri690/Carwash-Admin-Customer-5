import express from "express"
import indexRoutes from "./Routes/indexRoutes";
import cors from "cors"

const app = express ();

app.use(cors())

app.use(express.json());

app.use("/api", indexRoutes);


export default app;