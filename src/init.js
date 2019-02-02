const vscode = require('vscode')
const open = require('open')
const util = require('util')
const exec = util.promisify(require('child_process').exec)

const checkIsCommandInstalled = require('./utils/checkIsCommandInstalled')
const strings = require('./strings')
const { isEmptyString } = require('./utils/isEmptyString')

let outputChannel
let statusBarItem

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
                    showInformationMessage(strings.gitFlowRepoCreated)
                }
            })
        }
    });

    let gfFeatureStart = vscode.commands.registerCommand('baba-flow.gfFeatureStart', () => {
        handleBranchCreation(strings.feature)
    })

    let gfFeaturePublish = vscode.commands.registerCommand('baba-flow.gfFeaturePublish', () => {
        handleBranchPublishing(strings.feature)
    })

    let gfFeatureFinish = vscode.commands.registerCommand('baba-flow.gfFeatureFinish', () => {
        handleBranchFinishing(strings.feature)
    })

    let gfFeatureRename = vscode.commands.registerCommand('baba-flow.gfFeatureRename', () => {
        handleBranchRenaming(strings.feature)
    })

    let gfFeatureDelete = vscode.commands.registerCommand('baba-flow.gfFeatureDelete', () => {
        handleBranchDeletion(strings.feature)
    })

    let gfBugFixStart = vscode.commands.registerCommand('baba-flow.gfBugFixStart', () => {
        handleBranchCreation(strings.bugfix)
    })

    let gfBugFixPublish = vscode.commands.registerCommand('baba-flow.gfBugFixPublish', () => {
        handleBranchPublishing(strings.bugfix)
    })

    let gfBugFixFinish = vscode.commands.registerCommand('baba-flow.gfBugFixFinish', () => {
        handleBranchFinishing(strings.bugfix)
    })

    let gfBugFixRename = vscode.commands.registerCommand('baba-flow.gfBugFixRename', () => {
        handleBranchRenaming(strings.bugfix)
    })

    let gfBugFixDelete = vscode.commands.registerCommand('baba-flow.gfBugFixDelete', () => {
        handleBranchDeletion(strings.bugfix)
    })

    let gfReleaseStart = vscode.commands.registerCommand('baba-flow.gfReleaseStart', async () => {
        const releaseBranches = await listBranches(strings.release)
        if (releaseBranches && releaseBranches.length > 0) {
            const branchName = releaseBranches[0]
            return showInformationMessage(strings.existingBranchError.format(strings.release, branchName))
        }
        handleBranchCreation(strings.release)
    })

    let gfReleasePublish = vscode.commands.registerCommand('baba-flow.gfReleasePublish', () => {
        handleBranchPublishing(strings.release)
    })

    let gfReleaseFinish = vscode.commands.registerCommand('baba-flow.gfReleaseFinish', () => {
        handleBranchFinishing(strings.release)
    })

    let gfReleaseDelete = vscode.commands.registerCommand('baba-flow.gfReleaseDelete', () => {
        handleBranchDeletion(strings.release)
    })

    let gfHotFixStart = vscode.commands.registerCommand('baba-flow.gfHotFixStart', async () => {
        const hotFixBranches = await listBranches(strings.hotfix)
        if (hotFixBranches && hotFixBranches.length > 0) {
            const branchName = hotFixBranches[0]
            return showInformationMessage(strings.existingBranchError.format(strings.hotfix, branchName))
        }
        handleBranchCreation(strings.hotfix)
    })

    let gfHotFixPublish = vscode.commands.registerCommand('baba-flow.gfHotFixPublish', () => {
        handleBranchPublishing(strings.hotfix)
    })

    let gfHotFixFinish = vscode.commands.registerCommand('baba-flow.gfHotFixFinish', () => {
        handleBranchFinishing(strings.hotfix)
    })

    let gfHotFixRename = vscode.commands.registerCommand('baba-flow.gfHotFixRename', () => {
        handleBranchRenaming(strings.hotfix)
    })

    let gfHotFixDelete = vscode.commands.registerCommand('baba-flow.gfHotFixDelete', () => {
        handleBranchDeletion(strings.hotfix)
    })

    let gfSupportStart = vscode.commands.registerCommand('baba-flow.gfSupportStart', async () => {
        handleBranchCreation(strings.support)
    })

    context.subscriptions.push(gfInit)
    context.subscriptions.push(gfFeatureStart)
    context.subscriptions.push(gfFeatureFinish)
    context.subscriptions.push(gfBugFixStart)
    context.subscriptions.push(gfBugFixFinish)
    context.subscriptions.push(gfReleaseStart)
    context.subscriptions.push(gfReleaseFinish)
    context.subscriptions.push(gfHotFixStart)
    context.subscriptions.push(gfHotFixFinish)
    context.subscriptions.push(gfSupportStart)
    context.subscriptions.push(gfFeaturePublish)
    context.subscriptions.push(gfBugFixPublish)
    context.subscriptions.push(gfReleasePublish)
    context.subscriptions.push(gfHotFixPublish)
    context.subscriptions.push(gfFeatureRename)
    context.subscriptions.push(gfBugFixRename)
    context.subscriptions.push(gfHotFixRename)
    context.subscriptions.push(gfFeatureDelete)
    context.subscriptions.push(gfBugFixDelete)
    context.subscriptions.push(gfReleaseDelete)
    context.subscriptions.push(gfHotFixDelete)
}

const checkGF = async () => {
    let isLibraryInstalled = await checkIsCommandInstalled('git-flow')
    if (!isLibraryInstalled) {
        showLibraryNotInstalledMessage()
    }
    return isLibraryInstalled
}

const showLibraryNotInstalledMessage = () => {
    vscode.window.showErrorMessage(strings.libraryNotInstalled, strings.goToInstall)
        .then(res => {
            if (res) {
                open(strings.libraryInstallUrl)
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

const checkHasBranch = async (branchTag, branchName) => {
    const branches = await getGitFlowBranches(branchTag)
    return branches.includes(branchName)
}

const getGitFlowBranches = async (branchTag) => {
    const { error, stdout, stderr } = await exec(`git flow ${branchTag} list`, { cwd: vscode.workspace.rootPath })
    if (error || stderr) {
        return []
    }
    return stdout
}

const getUserBranches = async () => {
    const { error, stdout, stderr } = await exec('git branch -a', { cwd: vscode.workspace.rootPath })
    if (stdout) {
        let branches = stdout.split('\n')
        branches = branches.filter(branch => {
            return branch !== ''
        })
        branches = branches.map(branch => {
            return branch.trim().replace('*', '')
        })
        return branches
    }

    showErrorMessage(error || stderr)
}

const listBranches = async (branchTag) => {
    let branches = await getGitFlowBranches(branchTag)
    if (branches && branches.length > 0) {
        let branchNames = branches.split('\n').filter(name => {
            return name.trim() !== ""
        })
        branchNames = branchNames.map(name => {
            return name.replace('*', '').trim()
        })
        return branchNames
    }
    return []
}

const getTerminal = () => {
    return vscode.window.createTerminal('BABA-Flow')
}

const handleBranchCreation = async (branchTag) => {
    const isGitFlowInstalled = await checkGF()
    if (isGitFlowInstalled) {
        let branchName = await showInputBox(strings.branchStart.format(branchTag))
        if (!branchName) return
        if (isEmptyString(branchName)) {
            return showWarningMessage(strings.branchNameEmptyWarning)
        } else if (await checkHasBranch(branchTag, branchName)) {
            return showErrorMessage(strings.branchNameExist.format(`${branchTag}/${branchName}`))
        }

        const branches = await getUserBranches()
        const developBranch = await getDevelopBranch()
        branches.sort(a => {
            if (a === developBranch) {
                return -1
            }
        })

        let { label, quickPick } = await showQuickPickWithOptions(strings.optionalSelectedBaseBranch.format(developBranch), branches)
        const basingBranch = label === '' ? developBranch : label.toString()
        quickPick.hide()

        try {
            const { error, stdout, stderr } = await exec(`git flow ${branchTag} start ${branchName} ${basingBranch}`, {
                cwd: vscode.workspace.rootPath
            })
            if (stdout) {
                writeToOutput(stdout)
                return showInformationMessage(strings.branchCreated.format(`${branchTag}/${branchName}`))
            }
            showErrorMessage(error || stderr)
        } catch (error) {
            writeToOutput(error, true)
        }
    }
}

const handleBranchFinishing = async (branchTag) => {
    const isGitFlowInstalled = await checkGF()
    if (isGitFlowInstalled) {
        const branches = await listBranches(branchTag)
        if (Array.isArray(branches)) {
            if (branches.length === 0) {
                return showInformationMessage(strings.dontHaveBranch.format(branchTag))
            }

            let { label, quickPick } = await showQuickPickWithOptions(strings.selectBranchFinish.format(branchTag), branches)
            label = label.replace(`${branchTag}/`, '')
            quickPick.hide()

            if (label) {
                const isTagMessageRequired = branchTag === strings.hotfix || branchTag === strings.release

                let tagMessage
                if (isTagMessageRequired) {
                    tagMessage = await vscode.window.showInputBox({
                        placeHolder: strings.finishTagMessage,
                        validateInput: (value) => {
                            if (value === '') {
                                return strings.aTagMessageIsMandatory
                            }
                        }
                    })
                }

                const extraCommands = isTagMessageRequired ? `-m ${tagMessage}` : ''

                try {
                    const { error, stdout, stderr } = await exec(`git flow ${branchTag} finish ${label} ${extraCommands}`, {
                        cwd: vscode.workspace.rootPath
                    })
                    if (stdout) {
                        writeToOutput(stdout)
                        return showInformationMessage(strings.branchFinished.format(`${branchTag}/${label}`))
                    } else if (error) {
                        return writeToOutput(error, true)
                    }
                    showErrorMessage(stderr)
                } catch (error) {
                    writeToOutput(error, true)
                }
            }
        }
    }
}

const handleBranchPublishing = async (branchTag) => {
    const isGitFlowInstalled = await checkGF()
    if (isGitFlowInstalled) {
        const branches = await listBranches(branchTag)
        if (Array.isArray(branches)) {
            if (branches.length === 0) {
                return showInformationMessage(strings.dontHaveBranch.format(branchTag))
            }

            let { label, quickPick } = await showQuickPickWithOptions(strings.selectBranchPublish.format(branchTag), branches)
            label = label.replace(`${branchTag}/`, '')
            quickPick.hide()

            if (label) {
                try {
                    let statusBarItem = showStatusBarItem(strings.publishing.format('$(cloud-upload)'), strings.branchPublishStatusBarText)
                    const { error, stdout, stderr } = await exec(`git flow ${branchTag} publish ${label}`, {
                        cwd: vscode.workspace.rootPath
                    })

                    if (stdout) {
                        statusBarItem.dispose()
                        statusBarItem = undefined
                        writeToOutput(stdout)
                        showInformationMessage(strings.branchPublished.format(`${branchTag}/${label}`))
                    }
                    writeToOutput(error || stderr)
                } catch (error) {
                    writeToOutput(error, true)
                }
            }
        }
    }
}

const handleBranchRenaming = async (branchTag) => {
    const isGitFlowInstalled = await await checkGF()
    if (isGitFlowInstalled) {
        const branches = await listBranches(branchTag)
        if (Array.isArray(branches)) {
            if (branches.length === 0) {
                return showInformationMessage(strings.dontHaveBranch.format(branchTag))
            }

            let { label, quickPick } = await showQuickPickWithOptions(strings.selectBranchToRename.format(branchTag), branches)
            label = label.replace(`${branchTag}/`, '')
            quickPick.hide()

            let branchName = await showInputBox(strings.newNameForBranch.format(branchTag))
            if (!branchName) return
            if (isEmptyString(branchName)) {
                return showWarningMessage(strings.branchNameEmptyWarning)
            } else if (await checkHasBranch(branchTag, branchName)) {
                return showErrorMessage(strings.branchNameExist.format(`${branchTag}/${branchName}`))
            }

            try {
                const { error, stdout, stderr } = await exec(`git flow ${branchTag} rename ${branchName} ${label}`, {
                    cwd: vscode.workspace.rootPath
                })

                if (stdout) {
                    writeToOutput(stdout)
                    showInformationMessage(strings.branchRenamed.format(label, branchName))
                }

                writeToOutput(error || stderr)
            } catch (error) {
                writeToOutput(error)
            }
        }
    }
}

const handleBranchDeletion = async (branchTag) => {
    const isGitFlowInstalled = await await checkGF()
    if (isGitFlowInstalled) {
        const branches = await listBranches(branchTag)
        if (Array.isArray(branches)) {
            if (branches.length === 0) {
                return showInformationMessage(strings.dontHaveBranch.format(branchTag))
            }

            let { label, quickPick } = await showQuickPickWithOptions(strings.selectBranchToRename.format(branchTag), branches)
            label = label.replace(`${branchTag}/`, '')
            quickPick.hide()

            if (label) {
                try {
                    const { error, stdout, stderr } = await exec(`git flow ${branchTag} delete ${label}`, {
                        cwd: vscode.workspace.rootPath
                    })

                    if (stdout) {
                        writeToOutput(stdout)
                        showInformationMessage(strings.branchDeleted.format(`${branchTag}/${label}`, label))
                    }

                    writeToOutput(error || stderr)
                } catch (error) {
                    writeToOutput(error)
                }
            }
        }
    }
}

const showQuickPickWithOptions = (placeholder, options) => {
    let quickPick = vscode.window.createQuickPick()
    quickPick.placeholder = placeholder
    quickPick.items = getQuickPickOptionsFromList(options)
    quickPick.show()
    return new Promise((resolve) => {
        quickPick.onDidChangeSelection(selection => {
            resolve({ label: selection[0].label, quickPick })
        })
    })
}

const getQuickPickOptionsFromList = (quickPickItems) => {
    return quickPickItems.map(label => {
        return {
            label: label.trim(),
        }
    })
}

const getDevelopBranch = async () => {
    const { stdout } = await exec('git config --get gitflow.branch.develop', { cwd: vscode.workspace.rootPath })
    if (stdout) {
        return stdout
    }
}

const writeToOutput = (message, showOutputChannel) => {
    if (!outputChannel) {
        outputChannel = vscode.window.createOutputChannel('BABA-Flow')
    }
    outputChannel.appendLine(message)
    if (showOutputChannel) {
        outputChannel.show()
    }
}

const showStatusBarItem = (statusBarText, statusBarTooltip) => {
    if (!statusBarItem) {
        statusBarItem = vscode.window.createStatusBarItem(1, 10)
    }
    statusBarItem.text = statusBarText
    statusBarItem.tooltip = statusBarTooltip
    statusBarItem.show()
    return statusBarItem
}

module.exports = init