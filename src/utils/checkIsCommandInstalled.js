const exec = require('child_process').exec

const checkIsCommandInstalled = (command) => {
    return new Promise((resolve) => {
        exec(`command -v ${command}`, (error, stdout, stderr) => {
            console.log({
                error,
                stdout,
                stderr
            })
            if (error && error.code === 1) {
                resolve(false)
            }
            resolve(true)
        })
    })
}

module.exports = checkIsCommandInstalled