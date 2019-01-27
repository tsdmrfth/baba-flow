const vscode = require('vscode');
const checkIsCommandInstalled = require('./utils/checkIsCommandInstalled')
const strings = require('./strings')
const open = require('open')
const { isEmptyString } = require('./utils/isEmptyString')

const init = (context) => {
    let gfInit = vscode.commands.registerCommand('extension.gfInit', async () => {
        let master, develop, feature, bugfix, release, hotfix, support, tagPrefix, hookDir = ''
        if (await checkGF()) {
            let result = await showInputBox(strings.firstGFInitQuestion)
            master = returnValue(result, 'master')
            result = await showInputBox(strings.secondGFInitQuestion)
            develop = returnValue(result, 'develop')
            result = await showInputBox(strings.thirdGFInitQuestion)
            feature = returnValue(result, 'feature')
            result = await showInputBox(strings.fourthGFInitQuestion)
            bugfix = returnValue(result, 'bugfix')
            result = await showInputBox(strings.fifthGFInitQuestion)
            release = returnValue(result, 'release')
            result = await showInputBox(strings.sixthGFInitQuestion)
            hotfix = returnValue(result, 'hotfix')
            result = await showInputBox(strings.seventhGFInitQuestion)
            support = returnValue(result, 'support')
            result = await showInputBox(strings.eighthGFInitQuestion)
            tagPrefix = returnValue(result, '')
            result = await showInputBox(`${strings.ninthGFInitQuestion} ${vscode.workspace.rootPath}/.git/hooks`)
            hookDir = await returnValue(result, '')

            let terminal = vscode.window.createTerminal('BABA-Flow')
            terminal.show()
            terminal.sendText('git flow init')
            terminal.onDidWriteData(data => {
                if (data.includes('[master]') && !this.isMasterSent) {
                    terminal.sendText(master)
                    this.isMasterSent = true
                } else if (data.includes('[develop]') && !this.isDevelopSent) {
                    terminal.sendText(develop)
                    this.isDevelopSent = true
                } else if (data.includes('[feature/]') && !this.isFeatureSent) {
                    terminal.sendText(feature)
                    this.isFeatureSent = true
                } else if (data.includes('[bugfix/]') && !this.isBugFixSent) {
                    terminal.sendText(bugfix)
                    this.isBugFixSent = true
                } else if (data.includes('[release/]') && !this.isReleaseSent) {
                    terminal.sendText(release)
                    this.isReleaseSent = true
                } else if (data.includes('[hotfix/]') && !this.isHotFixSent) {
                    terminal.sendText(hotfix)
                    this.isHotFixSent = true
                } else if (data.includes('[support/]') && !this.isSupportSent) {
                    terminal.sendText(support)
                    this.isHotFixSent = true
                } else if (data.includes('tag prefix') && !this.isTagPrefixSent) {
                    terminal.sendText(tagPrefix)
                    this.isTagPrefixSent = true
                } else if (data.includes('/.git/hooks') && !this.isHookDirSent) {
                    terminal.sendText(hookDir)
                    this.isHookDirSent = true
                }
            })
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

const showInputBox = async (message) => {
    let result = await vscode.window.showInputBox({
        placeHolder: message,
    })
    return result
}

const returnValue = (value, defaultValue) => {
    return isEmptyString(value) ? defaultValue : value
}

module.exports = init