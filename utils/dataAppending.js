const dataAppend = {
    parking(vehicleNumber,slotNum){
        return `Car with vehicle registration number "${vehicleNumber}" has been parked at slot number ${slotNum}`;
    },
    leave(vehicleNum,driverAge,slotNum){
        return `Slot number ${slotNum} vacated, the car with vehicle registration number "${vehicleNum}" left the space, the driver of the car was of age ${driverAge}`;
    },
    allVehicleForAge(age){
        return `All Vehicle Registration Number for the age ${age} are `;
    }
}
module.exports = dataAppend;