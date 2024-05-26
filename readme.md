# CSBot

CSBot is a Discord bot designed to integrate with your Discord server, providing various functionalities such as updating the bot, restarting, checking uptime, and more.

## Features

- **IP Check**: Fetches and displays server information based on a provided server code.
- **Players**: Produces a list all of the players online on the configured FiveM server.
- **ServerIP**: Fetches the IP of the specified FiveM server.
- **Staff**: Displays all configured staff online from the specified FiveM server.
- **Gang**: Displays all configured members of the provided gang online from the specified FiveM server.
- **Update**: Pulls the latest changes from GitHub and restarts the bot.
- **Restart**: Restarts the bot using PM2.
- **Uptime**: Displays how long the bot has been running.
- **Ping**: Checks the bot's ping to the Discord server.
- **Echo**: Echoes a message provided by a moderator.

## Installation

To install and run CSBot, you'll need to have Node.js and Docker installed on your system.

1. Clone the repository:
   ```bash
   git clone git@github.com:your-username/csbot.git
   ```
2. Navigate to the cloned directory:
   ```bash
   cd csbot
   ```
3. Build the Docker image:
   ```bash
   docker build -t csbot .
   ```
4. Run the Docker container:
   ```bash
   docker run -d --name csbot-container --network mysql csbot
   ```

## Configuration

Before running CSBot, you need to configure it by creating a `config.json` file based on the provided `config-example.json`. Make sure to set the appropriate values for your Discord bot token, client ID, guild ID, and other settings.

## Usage

Once CSBot is running, you can interact with it using the commands displayed in Discord.

## Contributing

Contributions to CSBot are welcome. Please ensure that you test your changes locally before creating a pull request.

## Support

If you need help with CSBot, please open an issue on the GitHub repository.
