const OpenAI = require("openai");
const { getTechnologyLanguages } = require("./getTechnologyLanguages");
require("dotenv").config();

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

const openAIConversion = async (prompt) => {
	try {
		// Step 1: send the conversation and available functions to the model
		const messages = [
			{
				role: "user",
				content: prompt,
			},
		];
		const tools = [
			{
				type: "function",
				function: {
					name: "get_technology_languages",
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
						required: ["technologyName"],
					},
				},
			},
		];

		const response = await openai.chat.completions.create({
			model: "gpt-3.5-turbo",
			messages: messages,
			tools: tools,
			tool_choice: "auto", // auto is default, but we'll be explicit
		});

		// console.log("response", response);
		const responseMessage = response.choices[0].message;

		let functionResponse = [];

		// Step 2: check if the model wanted to call a function
		const toolCalls = responseMessage.tool_calls;
		if (responseMessage.tool_calls) {
			// Step 3: call the function
			// Note: the JSON response may not always be valid; be sure to handle errors
			const availableFunctions = {
				get_technology_languages: getTechnologyLanguages,
			}; // only one function in this example, but you can have multiple
			messages?.push(responseMessage); // extend conversation with assistant's reply
			for (const toolCall of toolCalls) {
				const functionName = await toolCall.function.name;
				const functionToCall = await availableFunctions[functionName];
				const functionArgs = await JSON.parse(toolCall.function.arguments);
				functionResponse = await functionToCall(functionArgs.technologyName);

				// console.log("functionResponse", functionResponse);

				// messages.push({
				// 	tool_call_id: toolCall.id,
				// 	role: "tool",
				// 	name: functionName,
				// 	content: functionResponse,
				// }); // extend conversation with function response

				// console.log(JSON.stringify(messages?.content));
			}
			// const secondResponse = await openai.chat.completions.create({
			// 	model: "gpt-3.5-turbo",
			// 	messages: messages,
			// }); // get a new response from the model where it can see the function response
			// console.log(secondResponse.choices);'
			return functionResponse;
		}
		return functionResponse;
	} catch (error) {
		console.log(error, "error");
		return [];
	}
};

module.exports = { openAIConversion };
