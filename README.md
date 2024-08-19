# Bitcoin and Ethereum blockchain explorer Telegram bot (Node.js, PostgreSQL)

Live demo: [@coin_view_bot](https://t.me/coin_view_bot)

Features:
* Blockchain explorer search by BTC/ETH address, BTC/ETH transaction hash, BTC block hash or ETH block height.
* Address Watch List to get notification for every new transaction of entered addresses.
* Price Watch List to get notification when price leaves entered range.
* Shows actual BTC/ETH price and option to subscribe and get it every 1, 8 or 24 hours.

## Deployment

### Enviroment variables

```
BOT_TOKEN
```

You can create it with [Bot Father](https://core.telegram.org/bots#6-botfather)

```
BOT_WEBHOOK_URL
```

Url of your server (https only). e.g. ```https://mydomain.com```

```
DB_URL
```

PostgreSQL DB url: ```postgres://[user[:password]@][netloc][:port][/dbname]```

```
ETHERSCAN_TOKEN
```

Register on [etherscan.io](https://etherscan.io) and [create Api key](https://etherscan.io/myapikey)

```
INFURA_TOKEN
```

Register on [infura.io](https://infura.io), create project, and enter here PROJECT ID

```
ADMIN_CHATID
```

Administrator chat id to get a message every 24h with simple stats of Bot (daily active users and recieved messages). You will see it in the first column in your database, if you set any Watch List item or subcribe to price

```
PORT
```

**Optional** (3000 by default). You shouldn't set PORT, if you want to deploy it to Heroku

### Run

```
npm install
```

```
npm run build
```

```
npm start
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

## Contact author

[Telegram](https://t.me/aveDenis)
