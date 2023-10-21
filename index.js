const express = require("express");
const app = express();

require("dotenv").config();
const OpenAIApi = require("openai");
const openai = new OpenAIApi({ apiKey: process.env.OPENAI_API_KEY });
//In bot.js
const { Client, GatewayIntentBits, REST, Routes } = require("discord.js");
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	],
});

const commands = [
	{
		name: "insult",
		description: "Insult someone's Jiu Jitsu",
	},
];

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);
rest
	.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands })
	.then((res) => console.log(res))
	.catch(console.error);

client.on("ready", () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

client.on("messageCreate", async (message) => {
	if (message.author.bot || !message.content.startsWith("!ses")) return;

	try {
		const gptResponse = await openai.chat.completions.create({
			messages: [
				{
					role: "user",
					content: message.content,
				},
			],
			temperature: 0.9,
			max_tokens: 100,
			model: "gpt-3.5-turbo",
		});
		message.reply(gptResponse.choices[0].message.content);
	} catch (err) {
		message.reply("Let Joey know that something went wrong.");
	}
});

client.on("interactionCreate", async (interaction) => {
	if (!interaction.isChatInputCommand()) return;

	try {
		if (interaction.commandName === "insult") {
			const chatCompletion = await openai.chat.completions.create({
				messages: [
					{
						role: "user",
						content:
							"In 20 words max, write an insult about someones Jiu Jitsu and why they lack everything that makes a good Jiu Jitsu player.",
					},
				],
				model: "gpt-3.5-turbo",
				temperature: 0.9,
			});
			await interaction.reply(chatCompletion.choices[0].message.content);
		}
	} catch (err) {
		console.log(err);
	}

	interaction.reply("Let Joey know that something went wrong.");
});

client.login(process.env.DISCORD_TOKEN);

app.get("/", (req, res) => {
	const name = process.env.NAME || "World";
	res.send(`Hello ${name}!`);
});

const port = parseInt(process.env.PORT) || 8080;

app.listen(port, () => {
	console.log(`helloworld: listening on port ${port}`);
});
