import readline from 'node:readline';
import chalk from 'chalk';
import { createLogUpdate } from 'log-update';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const random = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

export const say = async (msg = [], { clear = false, stdin = process.stdin, stdout = process.stdout } = {}) => {
    const messages = Array.isArray(msg) ? msg : [msg];
    const rl = readline.createInterface({ input: stdin, escapeCodeTimeout: 50 });
    const logUpdate = createLogUpdate(stdout, { showCursor: false });
    readline.emitKeypressEvents(stdin, rl);
    let i = 0;
    let cancelled = false;

    const done = async () => {
        stdin.off('keypress', done);
        if (stdin.isTTY) stdin.setRawMode(false);
        rl.close();
        cancelled = true;
        if (i < messages.length - 1) {
            logUpdate.clear();
        } else if (clear) {
            logUpdate.clear();
        } else {
            logUpdate.done();
        }
    };

    if (stdin.isTTY) stdin.setRawMode(true);
    stdin.on('keypress', (str, key) => {
        if (stdin.isTTY) stdin.setRawMode(true);
        if (key.ctrl && key.name === 'c') {
            done();
            return process.exit(0);
        }
        if (['up', 'down', 'left', 'right'].includes(key.name)) return;
        done();
    });

    // Centro face elements with more expressive options
    const eyes = ['•', '•', 'o', 'o', '•', 'O', '^', '•'];
    const mouths = ['•', 'O', '*', 'o', 'o', '•', '-'];

    const face = (msg, { mouth = mouths[0], eye = eyes[0] } = {}) => {
        return [
            `      ${chalk.cyan('_____')}`,
            `     ${chalk.cyan('/')}     ${chalk.cyan('\\')}`,
            `    ${chalk.cyan('/')}  ${chalk.white(eye + ' ' + eye)}  ${chalk.cyan('\\')}    ${chalk.cyan('Centro Bot:')}`,
            `    ${chalk.cyan('\\')}   ${chalk.white(mouth)}   ${chalk.cyan('/')}    ${msg}`,
            `     ${chalk.cyan('\\_____/')}`,
        ].join('\n');
    };

    for (let message of messages) {
        message = await message;
        const _message = Array.isArray(message) ? message : message.split(' ');
        let msg = [];
        let eye = random(eyes);
        let j = 0;

        for (let word of [''].concat(_message)) {
            word = await word;
            if (word) msg.push(word);
            const mouth = random(mouths);
            if (j % 7 === 0) eye = random(eyes);
            logUpdate('\n' + face(msg.join(' '), { mouth, eye }));
            if (!cancelled) await sleep(randomBetween(75, 200));
            j++;
        }

        if (!cancelled) await sleep(100);
        const tmp = await Promise.all(_message).then(res => res.join(' '));
        // Use a happy face at the end
        const text = '\n' + face(tmp, { mouth: '◡', eye: '^' });
        logUpdate(text);
        if (!cancelled) await sleep(randomBetween(1200, 1400));
        i++;
    }

    stdin.off('keypress', done);
    await sleep(100);
    done();
    if (stdin.isTTY) stdin.setRawMode(false);
    stdin.removeAllListeners('keypress');
};
