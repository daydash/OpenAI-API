const OpenAI = require("openai");
const { getTechnologyLanguages } = require("./getTechnologyLanguages");
require("dotenv").config();

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

// Define your ChatGPT Function
const callChatGPTWithFunctions = async (prompt, appendString) => {
	let messages = [
		{
			role: "system",
			content: "Perform function requests for the user",
		},
		{
			role: "user",
			content: prompt,
		},
	];
	// Step 1: Call ChatGPT with the function name
	let chat = await openai.chat.completions.create({
		model: "gpt-3.5-turbo",
		messages,
		functions: [
			{
				name: "getTechnologyLanguages",
				description:
					"Tells the names of available languages for the development of a specific technology by MetaSquare Technologies Pvt. Ltd., Gurugram, India having website metasquaretech.com",
				parameters: {
					type: "object",
					properties: {
						technologyName: {
							type: "string",
							enum: ["Frontend", "Backend"],
							description:
								"The name of specific technology you required to search which languages are available for it's development",
						},
					},
					require: ["technologyName"],
				},
			},
		],
		function_call: "auto",
	});

	let wantsToUseFunction =
		chat.data.choices[0].finish_reason == "function_call";

	let content = "";
	// Step 2: Check if ChatGPT wants to use a function
	if (wantsToUseFunction) {
		// Step 3: Use ChatGPT arguments to call your function
		if (
			chat.data.choices[0].message.function_call.name ==
			"getTechnologyLanguages"
		) {
			let argumentObj = JSON.parse(
				chat.data.choices[0].message.function_call.arguments
			);
			content = await getTechnologyLanguages(argumentObj.keyword);
			messages.push(chat.data.choices[0].message);
			messages.push({
				role: "function",
				name: "getTechnologyLanguages",
				content,
			});
		}
	}

	console.log(JSON.stringify(chat.data));

	// Step 4: Call ChatGPT again with the function response
	// let step4response = await openai.createChatCompletion({
	// 	model: "gpt-3.5-turbo",
	// 	messages,
	// });
	// console.log(step4response.data.choices[0]);
};

callChatGPTWithFunctions(
	"Hello, I am a user, I would like to get the languages available for the frontend development provided by metasquare"
);
