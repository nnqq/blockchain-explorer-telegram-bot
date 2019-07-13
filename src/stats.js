// @flow
import type { typeMetrics } from '../flow-types/stats/metrics';
import type { typeUsers } from '../flow-types/stats/users';

const EventEmitter = require('events');
const { xs } = require('./template');
const v = require('./validate');

class MyEmitter extends EventEmitter {}
const event = new MyEmitter();

let users: typeUsers = {};

const metrics: typeMetrics = {
  dau: 0,
  receivedMsg: 0,
};

event.once('log started', (bot) => {
  setInterval(async () => {
    const msg: string = xs`
      📊 Bot daily stats:
      DAU: ${metrics.dau}
      Received msg: ${metrics.receivedMsg}
    `;

    await bot.telegram.sendMessage(process.env.ADMIN_CHATID, v.toTelegramSafeLength(msg));

    users = {};
    Object.keys(metrics).forEach((key) => {
      metrics[key] = 0;
    });
  }, 864e5);
});

class stats {
  static counter(ctx: Object, bot: Object) {
    event.emit('log started', bot);
    metrics.receivedMsg += 1;
    if (!users[`${ctx.chat.id}`]) {
      users[`${ctx.chat.id}`] = true;
      metrics.dau += 1;
    }
  }
}

module.exports = { stats, metrics };
