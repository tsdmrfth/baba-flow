const vscode = require('vscode');
const checkIsCommandInstalled = require('./utils/checkIsCommandInstalled')
const strings = require('./strings')
const open = require('open')

const init = (context) => {
    let gfInit = vscode.commands.registerCommand('extension.gfInit', async () => {
        let isLibraryInstalled = await checkIsCommandInstalled('mamam')
        if (!isLibraryInstalled) {
            showLibraryNotInstalledMessage()
        }
    });

    context.subscriptions.push(gfInit);
}

const showLibraryNotInstalledMessage = () => {
    vscode.window.showErrorMessage(strings.libraryNotInstalled, strings.libraryInstallUrl)
        .then(res => {
            if (res) {
                open(res)
            }
        })
}

module.exports = init