const express = require("express");
require("dotenv").config();
const { openAIConversion } = require("./openAIConversion");
const app = express();

app.use(express.json());
const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
	res
		.status(200)
		.json({ success: true, message: `Server is running on port: ${PORT}` });
});

app.post("/technologies", async (req, res) => {
	try {
		const { prompt } = req.body;
        
		const response = await openAIConversion(prompt);
		console.log(response);
		res.status(200).json({
			success: true,
			message: `Got response`,
			response,
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({ success: false, message: `Some error occurred!` });
	}
});

app.listen(PORT, () => console.log(`Server running on PORT: ${PORT}`));
