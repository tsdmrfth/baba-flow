const vscode = require('vscode')
const open = require('open')
const util = require('util')
const exec = util.promisify(require('child_process').exec)

const checkIsCommandInstalled = require('./utils/checkIsCommandInstalled')
const strings = require('./strings')
const { isEmptyString } = require('./utils/isEmptyString')

const init = (context) => {
    let gfInit = vscode.commands.registerCommand('baba-flow.gfInit', async () => {
        let master, develop, feature, bugfix, release, hotfix, support, tagPrefix, hookDir = ''
        if (await checkGF()) {
            let result = await showInputBox(strings.firstGFInitQuestion)
            master = returnValue(result, 'master')
            result = await showInputBox(strings.secondGFInitQuestion)
            develop = returnValue(result, 'develop')
            result = await showInputBox(strings.thirdGFInitQuestion)
            feature = returnValue(result, 'feature/')
            result = await showInputBox(strings.fourthGFInitQuestion)
            bugfix = returnValue(result, 'bugfix/')
            result = await showInputBox(strings.fifthGFInitQuestion)
            release = returnValue(result, 'release/')
            result = await showInputBox(strings.sixthGFInitQuestion)
            hotfix = returnValue(result, 'hotfix/')
            result = await showInputBox(strings.seventhGFInitQuestion)
            support = returnValue(result, 'support/')
            result = await showInputBox(strings.eighthGFInitQuestion)
            tagPrefix = returnValue(result, '')
            result = await showInputBox(`${strings.ninthGFInitQuestion} ${vscode.workspace.rootPath}/.git/hooks`)
            hookDir = await returnValue(result, '')

            let terminal = getTerminal()
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
                    terminal.dispose()
                }
            })
        }
    });

    let gfFeatureStart = vscode.commands.registerCommand('baba-flow.gfFeatureStart', () => {
        handleBranchCreation(strings.feature)
    })

    let gfFeatureFinish = vscode.commands.registerCommand('baba-flow.gfFeatureFinish', () => {
        handleBranchDeletion(strings.feature)
    })

    let gfBugFixStart = vscode.commands.registerCommand('baba-flow.gfBugFixStart', () => {
        handleBranchCreation(strings.bugfix)
    })

    let gfBugFixFinish = vscode.commands.registerCommand('baba-flow.gfBugFixFinish', () => {
        handleBranchDeletion(strings.bugfix)
    })

    context.subscriptions.push(gfInit)
    context.subscriptions.push(gfFeatureStart)
    context.subscriptions.push(gfFeatureFinish)
    context.subscriptions.push(gfBugFixStart)
    context.subscriptions.push(gfBugFixFinish)
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

const showWarningMessage = (message) => {
    vscode.window.showWarningMessage(message)
}

const showErrorMessage = (error) => {
    vscode.window.showErrorMessage(error)
}

const showInformationMessage = (message) => {
    vscode.window.showInformationMessage(message)
}

const checkHasBranch = async (branchName) => {
    const branches = await getBranches()
    return branches.includes(branchName)
}

const getBranches = async () => {
    const { error, stdout, stderr } = await exec('git branch -a', { cwd: vscode.workspace.rootPath })
    if (error) {
        showErrorMessage(error)
        return undefined
    } else if (stderr) {
        showErrorMessage(stderr)
        return undefined
    }

    return stdout
}

const listBranches = async (searchKey) => {
    let branches = await getBranches()
    let branchNames = branches.split('\n').filter(name => {
        return name.trim() !== "" && name.includes(searchKey || '')
    })
    branchNames = branchNames.map(name => {
        return name.replace('*', '').trim()
    })
    return branchNames
}

const getTerminal = () => {
    return vscode.window.createTerminal('BABA-Flow')
}

const handleBranchCreation = async (branchTag) => {
    if (await checkGF()) {
        let featureName = await showInputBox(strings.branchStart.format(branchTag))
        if (!featureName) return
        if (isEmptyString(featureName)) {
            return showWarningMessage(strings.featureStartEmptyStringWarning)
        } else if (await checkHasBranch(`${branchTag}/${featureName}`)) {
            return showErrorMessage(strings.featureStartNameExistsError)
        }

        let terminal = getTerminal()
        terminal.sendText(`git flow ${branchTag} start ${featureName}`)
        terminal.dispose()
        showInformationMessage(strings.branchCreated.format(`${branchTag}/${featureName}`))
    }
}

const handleBranchDeletion = async (branchTag) => {
    if (await checkGF()) {
        const branches = await listBranches(branchTag)
        if (Array.isArray(branches)) {
            if (branches.length === 0) {
                return showInformationMessage(strings.dontHaveBranch.format(branchTag))
            }

            let quickPick = vscode.window.createQuickPick()
            quickPick.placeholder = strings.selectBranch.format(branchTag)
            quickPick.items = branches.map(branch => {
                return {
                    label: branch
                }
            })
            quickPick.onDidChangeSelection(selection => {
                const selected = selection[0]
                let { label } = selected
                label = label.replace(`${branchTag}/`, '')
                if (label) {
                    let terminal = getTerminal()
                    terminal.sendText(`git flow ${branchTag} finish ${label}`)
                    showInformationMessage(strings.branchDeleted.format(`${branchTag}/${label}`))
                    quickPick.dispose()
                    terminal.dispose()
                }
            })
            quickPick.show()
        }
    }
}

module.exports = init