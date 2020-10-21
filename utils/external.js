const errorMsg = require('../utils/errorMsg');
const fs = require('fs');
const external = {
    checkNextEmptySlot(lenOfActualParkingLot, booleanToCheckWhichNextEmpty) {
        let idx = -1;
        for (let i = 0; i < lenOfActualParkingLot; i++) {
            if (booleanToCheckWhichNextEmpty[i] == 0) {
                booleanToCheckWhichNextEmpty[i] = 1;
                idx = i;
                break;
            }
        }
        return idx;
    },
    checkDriverAge(age) {
        return isNaN(age) ? 0 : (age);
    },
    addToFileIfDriverSyntax() {
        const dataToAppendToFile = errorMsg.DRIVER_AGE_SYNTAX;
        this.appendToFileOutput(dataToAppendToFile);
    },
    checkDriverVerification(driverAge) {
        if (driverAge <= 0 || driverAge > 150) return true;
        return false;
    },
    regexCheckForVehicleNumberPlate(vehicleNumber) {
        const regexForVehicleNum = RegExp("(([A-Za-z]){2}(|-)(?:[0-9]){1,2}(|-)(?:[A-Za-z]){2}(|-)([0-9]){1,4})|(([A-Za-z]){2,3}(|-)([0-9]){1,4})");
        return regexForVehicleNum.test(vehicleNumber);
    },
    regexCheckIfSyntaxIsWrong() {
        const dataToAppendInFile = errorMsg.REGEX_SYNTAX;
        this.appendToFileOutput(dataToAppendInFile);
    },
    appendToFileOutput(dataToAppendInFile) {
        fs.appendFileSync('output.txt', dataToAppendInFile + " \n");
    }
}
module.exports = external;