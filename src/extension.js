const init = require('./init')

function activate(context) {
    init(context)
}
exports.activate = activate;

function deactivate() {
}
exports.deactivate = deactivate;