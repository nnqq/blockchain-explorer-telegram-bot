const EventEmitter = require('events');
const { xs } = require('./template');

class MyEmitter extends EventEmitter {}
const event = new MyEmitter();

let users = {};

const metrics = {
  dau: 0,
  receivedMsg: 0,
};

event.once('log started', (bot) => {
  setInterval(async () => {
    const msg = xs`
      📊 Bot daily stats:
      DAU: ${metrics.dau}
      Received msg: ${metrics.receivedMsg}
    `;

    await bot.telegram.sendMessage(process.env.ADMIN_CHATID, msg);

    users = {};
    Object.keys(metrics).forEach((key) => {
      metrics[key] = 0;
    });
  }, 864e5);
});

class stats {
  static counter(ctx, bot) {
    event.emit('log started', bot);
    metrics.receivedMsg += 1;
    if (!users[`${ctx.chat.id}`]) {
      users[`${ctx.chat.id}`] = true;
      metrics.dau += 1;
    }
  }
}

module.exports = { stats, metrics };
