const express = require("express");
const app = express();

require("dotenv").config();
const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
//In bot.js
const { Client, GatewayIntentBits, REST, Routes } = require("discord.js");
const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
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
console.log("Successfully reloaded application (/) commands.");

client.on("ready", () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", async (message) => {
	if (message.content.substring(0, 1) === "!") {
		const prompt = message.content.substring(1); //remove the exclamation mark from the message
		const answer = await ask(prompt); //prompt GPT-3
		message.channel.send(answer); //reply to Discord with answer from GPT-3
	}
});

client.on("interactionCreate", async (interaction) => {
	if (!interaction.isChatInputCommand()) return;

	if (interaction.commandName === "insult") {
		const chatCompletion = await openai.chat.completions.create({
			messages: [
				{
					role: "user",
					content: "In 20 words max, write an insult about someones Jiu Jitsu and why they lack everything that makes a good Jiu Jitsu player.",
				},
			],
			model: "gpt-3.5-turbo",
		});
		await interaction.reply(chatCompletion.choices[0].message.content);
	}
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
