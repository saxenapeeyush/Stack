const fs = require('fs'); // for working with file system
const parkingMapping = require('./utils/parkingMap'); // syntax checking parking
const errorMsg = require('./utils/errorMsg');
const external = require('./utils/external'); // all external functions
const dataAppend = require('./utils/dataAppending'); // all other data to append
const dataFromInput = fs.readFileSync('input.txt').toString(); // read the file in sync manner from input.txt
const createArrayFromData = dataFromInput.split("\n");
const Driverslot = require('./models/driverSlotModel');
if (createArrayFromData.length <= 0) return;
const vehicleObjMapping = new Map(); // mapping of vehicle and the vehicle object
const slotNumberAndVehicleMapping = new Map(); // mapping of slot number and vehicle alloted to that slot.
const ageOfDriver = [];
for (let i = 0; i < 150; i++) ageOfDriver.push([]); // assuming the age of the driver would be maximum of 150
const lenOfParkingLotInStr = createArrayFromData[0].split(" ")[1];
const lenOfActualParkingLot = parseInt(lenOfParkingLotInStr); // len of the parking lot
if (lenOfActualParkingLot <= 0) return;
const booleanToCheckWhichNextEmpty = []; // boolean array to check the next empty slot
for (let i = 0; i < lenOfActualParkingLot; i++) booleanToCheckWhichNextEmpty.push(0);
for (let i = 1; i < createArrayFromData.length; i++) {
    let str = createArrayFromData[i].split(" ");
    let cursorValueToPlot = str[0].trim(); // if the user entered some extra spaces so trim those spaces
    if (cursorValueToPlot.length <= 0) {
        continue;
    }
    checkAndDoTheRestParkingOrLeaving(cursorValueToPlot, str); // call this function to do the rest work
}
function checkAndDoParking(str) {
    if (str.length <= 3) { // if the syntax is wrong return from here and append into the file.
        const dataToAppendInFile = errorMsg.PARKING_SYNTAX;
        external.appendToFileOutput(dataToAppendInFile);
        return;
    } else if (str[2].localeCompare(parkingMapping.DRIVER_AGE, "en", {
            ignorePunctuation: true
        }) != 0) { // if the syntax of driver age is wrong return and append to file
        const dataToAppendInFile = errorMsg.DRIVER_AGE_SYNTAX;
        external.appendToFileOutput(dataToAppendInFile);
        return;
    }
    const vehicleNumber = str[1];
    const checkForRegex = external.regexCheckForVehicleNumberPlate(vehicleNumber); // check for vehicle registration number using regex which is mentioned in external.js
    if (checkForRegex == false) {
        regexCheckIfSyntaxIsWrong(); // append if regex is wrong as car number is invalid
        return;
    }
    const age = parseInt(str[3]); // as age is in string parsing it into integer
    const driverAge = external.checkDriverAge(age);
    if (external.checkDriverVerification(driverAge)) {
        external.addToFileIfDriverSyntax();
        return;
    }
    const idx = external.checkNextEmptySlot(lenOfActualParkingLot,booleanToCheckWhichNextEmpty); // checking the next empty slot for a vehicle
    const slotNum = idx + 1;
    if (idx != -1) {
        const obj = new Driverslot(driverAge,slotNum); // making the object which is there in models.
        vehicleObjMapping.set(vehicleNumber + "", obj); // mapping
        slotNumberAndVehicleMapping.set(slotNum, vehicleNumber); // mapping
        ageOfDriver[driverAge].push(slotNum); // made an array which will check the age corresponding to the slots allocated to that age.
        const dataToAppendInFile = dataAppend.parking(vehicleNumber, slotNum);
        external.appendToFileOutput(dataToAppendInFile);
    } else {
        const dataToAppendToFile = errorMsg.FULL_SLOTS; // if slots are full display message as slots are full
        external.appendToFileOutput(dataToAppendToFile);
    }
}
function checkAndAppendSlotNumberForDriverAge(str) {
    if (str.length < 2 || str.length > 2) {
        const dataToAppendInFile = errorMsg.SLOT_FOR_DRIVER_AGE; //syntax for driver age
        external.appendToFileOutput(dataToAppendInFile);
        return;
    }
    const age = parseInt(str[1]);
    const driverAge = external.checkDriverAge(age);
    if (external.checkDriverVerification(driverAge)) { // verify the driver age 
        external.addToFileIfDriverSyntax();
        return;
    }
    const allSlots = ageOfDriver[driverAge]; // take all slots from the driver age and append them to file
    let dataToAppendInFile = "";
    for (let curSlot = 0; curSlot < allSlots.length; curSlot++) {
        if (curSlot < allSlots.length - 1) dataToAppendInFile += allSlots[curSlot] + ",";
        else dataToAppendInFile += allSlots[curSlot];
    }
    external.appendToFileOutput(dataToAppendInFile);
}
function checkAndUpdateSlotNumberForParticularCar(str) {
    if(str.length < 2 || str.length > 2){
        const dataToAppendInFile = errorMsg.SLOT_FOR_PARTICULAR_CAR_SYNTAX; // slot car syntax error.
        external.appendToFileOutput(dataToAppendInFile);
        return;
    }
    str[1] = str[1].substr(0, str[1].length - 1); // as the input file converted to an array it contains "\r" so to remove this and then comparing with the vehicle number
    const vehicleNumber = str[1];
    const regexCheck = external.regexCheckForVehicleNumberPlate(vehicleNumber); // checking vehicle number validity
    if (regexCheck == false) {
        regexCheckIfSyntaxIsWrong();
        return;
    }
    const slot = vehicleObjMapping.get(vehicleNumber);
    if (slot) external.appendToFileOutput(slot.slotNum);
    else external.appendToFileOutput("");
}

function leaveSlot(str) {
    const slotNum = isNaN(parseInt(str[1]))?0:parseInt(str[1]); // if slow num is valid or not, isNaN is for if the user entered a name such as "peeyush"
    if(slotNum == 0 || slotNum <= 0 || slotNum > lenOfActualParkingLot){ // covered edge cases
        const dataToAppendInFile = errorMsg.LEAVE_SLOT_NUMBER_SYNTAX;
        external.appendToFileOutput(dataToAppendInFile);
        return;
    }
    const vehicleNum = slotNumberAndVehicleMapping.get(slotNum);
    if(!vehicleNum) {
        const dataToAppendInFile = errorMsg.VEHICLE_NOT_AT_LEAVE;
        external.appendToFileOutput(dataToAppendInFile);
        return;
    }
    const vehicleObj = vehicleObjMapping.get(vehicleNum);
    const driverAge = vehicleObj.driverAge;
    const dataToAppendInFile = dataAppend.leave(vehicleNum,driverAge,slotNum);
    external.appendToFileOutput(dataToAppendInFile);
    slotNumberAndVehicleMapping.delete(slotNum);
    vehicleObjMapping.delete(vehicleNum);
    const slots = ageOfDriver[driverAge];
    const idx = slots.indexOf(slotNum);
    booleanToCheckWhichNextEmpty[slotNum - 1] = 0; // removing the slot from particular age number as we have maintained an array of it.
    if (idx > -1) slots.splice(idx, 1);
}

function checkAndAppendVehicleRegistrationForParticularAge(str) {
    const age = parseInt(str[1]);
    const driverAge = external.checkDriverAge(age);
    if(external.checkDriverVerification(driverAge)){
        external.addToFileIfDriverSyntax();
        return;
    }
    const allSlots = ageOfDriver[age];
    let dataToAppend = "";
    if (allSlots.length <= 0) {
        external.appendToFileOutput(dataToAppend);
        return;
    }
    dataToAppend = dataAppend.allVehicleForAge(age);
    for (let i = 0; i < allSlots.length; i++) {
        const curSlot = allSlots[i];
        const vehicleNumber = slotNumberAndVehicleMapping.get(curSlot);
        if (i < allSlots.length - 1) dataToAppend += vehicleNumber + ",";
        else dataToAppend += vehicleNumber;
    }
    external.appendToFileOutput(dataToAppend);
}

function checkAndDoTheRestParkingOrLeaving(cursorValueToPlot, str) {
    if (cursorValueToPlot.localeCompare(parkingMapping.PARK, "en", {
            ignorePunctuation: true
        }) == 0) {
        checkAndDoParking(str);
    } else if (cursorValueToPlot.localeCompare(parkingMapping.SLOT_NUMBER_FOR_DRIVER_OF_AGE, "en", {
            ignorePunctuation: true
        }) == 0) {
        checkAndAppendSlotNumberForDriverAge(str);
    } else if (cursorValueToPlot.localeCompare(parkingMapping.SLOT_NUMBER_FOR_CAR_WITH_NUMBER, "en", {
            ignorePunctuation: true
        }) == 0) {
        checkAndUpdateSlotNumberForParticularCar(str);
    } else if (cursorValueToPlot.localeCompare(parkingMapping.LEAVE, "en", {
            ignorePunctuation: true
        }) == 0) {
        leaveSlot(str);
    } else if (cursorValueToPlot.localeCompare(parkingMapping.VEHICLE_REGISTRATION_NUMBER, "en", {
            ignorePunctuation: true
        }) == 0) {
        checkAndAppendVehicleRegistrationForParticularAge(str);
    } else {
        console.log("Not Applicable ! Please check the syntax");
        return;
    }
}