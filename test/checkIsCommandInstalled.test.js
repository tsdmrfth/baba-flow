const checkIsLibraryInstalled = require('./../src/utils/checkIsCommandInstalled')
const assert = require('assert');

suite('checkIsLibraryInstalled', () => {

    test('should return false if library is not installed', async () => {
        let result = await checkIsLibraryInstalled('hello')
        // expect(result).toBeFalsy()
    })

})