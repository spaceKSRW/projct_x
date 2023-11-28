const db = require("../db/db");
const user = require("../service/user");

class UserDAO {
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
    const [id] = await db("employee")
      .insert({
        first_name: firstName,
        email: email,
        last_name: lastName,
        gender: gender,
        manager_id: manager,
        address: address,
        password: password,
        department: department,
        dob: dob,
        role: role,
        phone: phone,
      })
      .returning("employee_id");

    return id;
  }
  async createManager(email, department) {
    const managerId = this.generateRandomFiveDigitNumber();
    const [mid] = await db("manager")
      .insert({
        manager_id:managerId,
        email: email,
        department: department,
      })
      .returning("manager_id");
    return mid;
  }

  async getUserByEmail(email) {
    try {
      const user = await db("employee").where({ email: email }).first();
      return user;
    } catch (err) {
      throw new Error(`Error fetching user by email: ${error.message}`);
    }
  }

  async isEmailUnique(email) {
    const existingUser = await db("employee").where("email", email).first();
    return !existingUser;
  }

  async checkForManager(email) {
    const existingManager = await db("manager").where("email", email).first();
    return !existingManager;
  }
  async checkForDepartment(department) {
    const existingDepartment = await db("manager")
      .where("department", department)
      .first();
    return !existingDepartment;
  }
  async checkForAdmin(adminDepartment) {
    const existingAdmin = await db("manager")
      .where("department", adminDepartment)
      .first();
    return existingAdmin;
  }
  async getDeptName(manager) {
    const managerDept = await db("manager")
      .select("department")
      .where("manager_id", manager)
      .first();
     
       return managerDept;
 
  }
  generateRandomFiveDigitNumber() {
    const min = 10000; // Smallest 5-digit number
    const max = 99999; // Largest 5-digit number
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  async getAllUsers() {
    try {
      const users = await db("employee").select("*");
      
      return users;;
    } catch (error) {
      throw new Error(`Error fetching all users: ${error.message}`);
    }
  }
  async getManagerName(managerId){
    try{
      const result = await db('employee').select('employee.first_name' , 'employee.last_name').join('manager' , 'employee.email','=','manager.email').where('manager.manager_id',managerId);
      return result;
    }catch(error){
      console.log(error);
      throw new Error(`Error fetching manager name: ${error.message}`);
    }
  }
  async updateFirstName(newFirstName,email){
   const result = await db('employee').where('email',email).update({first_name:newFirstName});
   return result ;
  }
  async updateLastName(newLastName,email){
    const result = await db('employee').where('email',email).update({last_name:newLastName});
    return result;
  }
  async updateAddress(newAddress,email){
    const result = await db('employee').where('email',email).update({address:newAddress});
    return result;
  }
  async updatePhone(newPhone,email){
    const result = await db('employee').where('email',email).update({phone:newPhone});
    return result;
  }
}


module.exports = new UserDAO();
