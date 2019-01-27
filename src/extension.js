const init = require('./init')
require('./utils/prototypes')

function activate(context) {
    init(context)
}
exports.activate = activate;

function deactivate() {
}
exports.deactivate = deactivate;