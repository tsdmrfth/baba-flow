const vscode = require('vscode');
const checkIsCommandInstalled = require('./utils/checkIsCommandInstalled')
const strings = require('./strings')
const open = require('open')

const init = (context) => {
    let gfInit = vscode.commands.registerCommand('extension.gfInit', async () => {
        if (await checkGF()) {

        }
    });

    context.subscriptions.push(gfInit);
}

const checkGF = async () => {
    let isLibraryInstalled = await checkIsCommandInstalled('git flow')
    if (!isLibraryInstalled) {
        showLibraryNotInstalledMessage()
    }
    return isLibraryInstalled
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