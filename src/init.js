const vscode = require('vscode');
const checkIsCommandInstalled = require('./utils/checkIsCommandInstalled')

const init = (context) => {
    let disposable = vscode.commands.registerCommand('extension.sayHello', async () => {
        vscode.window.showInformationMessage('Hello World!');
    });

    context.subscriptions.push(disposable);
}

module.exports = init