const personDAO = require("../dao/user");
const { hashPassword } = require("./bcryptService");

const zxcvbn = require("zxcvbn");

class UserService {
  async createUser(
    firstName,
    lastName,
    dob,
    gender,
    email,
    department,
    manager,
    address,
    password,
    role,
    phone
  ) {
    if (/\d/.test(firstName)) {
      throw new Error("First name cannot contain numbers.");
    }
    if (/\d/.test(lastName)) {
      throw new Error("Last name cannot contain numbers.");
    }
    const isEmailUnique = await this.isEmailUnique(email);
    if (!isEmailUnique) {
      throw new Error("Email already exists. Please use a different email.");
    }

    const passwordStrength = zxcvbn(password);
    if (passwordStrength.score < 2) {
      throw new Error(
        "Password must be stronger . include uppercase, special characters, and numbers."
      );
    }

    // hashing the password
    const hashedpass = await hashPassword(password);

    return personDAO.createUser(
      firstName,
      lastName,
      dob,
      gender,
      email,
      department,
      manager,
      address,
      hashedpass,
      role,
      phone
    );
  }

  async createManager(managerDetails) {
    const { email, department } = managerDetails;
    return personDAO.createManager(email, department);
  }
  async getUserByEmail(email) {
    try {
      const user = await personDAO.getUserByEmail(email);
      return user;
    } catch (err) {
      throw new Error(`Error fetching user by email : ${error.message}`);
    }
  }

  async isEmailUnique(email) {
    const isUnique = await personDAO.isEmailUnique(email);
    return isUnique;
  }
  async isManagerUnique(email) {
    const isUnique = await personDAO.checkForManager(email);
    if (!isUnique) {
      throw new Error("cannot be a manager");
    }
    return isUnique;
  }

  async isDeptUnique(department) {
    const doesExist = await personDAO.checkForDepartment(department);

    if (!doesExist) {
      throw new Error("Department has alerady been assigned");
    }
    return doesExist;
  }
  async isAdminUnique(adminDepartment) {
    const doesExist = await personDAO.checkForAdmin(adminDepartment);
    if (doesExist) {
      throw new Error("Administrator has alerady been assigned");
    }
    return !doesExist;
  }
  async getDeptCorrespondingManager(manager) {
    const deptName = await personDAO.getDeptName(manager);
    if (deptName) {
      return deptName;
    } else throw new Error("invalid manager request");
  }
  async getAllUsers() {
    const users = await personDAO.getAllUsers();
    return users;
  }
  async getManagerName(managerId){
    const name = await personDAO.getManagerName(managerId);
    if(name){
      return name;
    }
    
  }
  async updateFirstName(newFirstName,email){
    const fname = await personDAO.updateFirstName(newFirstName,email);
    //yaha par error handle ho sakta hai if newFname=Fname
    return fname;
  }
  async updateLastName(newLastName,email){
   const lname= await personDAO.updateLastName(newLastName,email);
   return lname;
  }
  async updatePhone(newPhone,email){
   const phone = await personDAO.updatePhone(newPhone,email);
   return phone;
  }
  async updateAddress(newAddress,email){
   const address =  await personDAO.updateAddress(newAddress,email);
   return address;
  }
}

module.exports = new UserService();
