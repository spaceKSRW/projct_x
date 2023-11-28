// module.exports = signup_get = (req, res) => {
//   res.render("signup");
// };
const bcrypt = require("bcrypt");
const UserService = require("../service/user");
const { createToken } = require("./jwtAuth");
const { getData } = require("../middleware/fetchDataFromJWT");

require("dotenv").config();
const maxAge = 3 * 24 * 60 * 60;
function login_get(req, res) {
  res.render("login", { error: null });
}

async function signup_post(req, res) {
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const dob = req.body.dob;
  const gender = req.body.gender;
  const email = req.body.email;
  var department = req.body.department;
  const manager = req.body.manager;
  const address = req.body.address;
  const password = req.body.password;
  const role = req.body.role;
  const phone = req.body.phone;

  console.log("Received form data:", {
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
    phone,
  });

  var errors = {};
  let managerId, adminId;
  try {
    if (role === "manager") {
      const managerUnique = await UserService.isManagerUnique(email);
      const departmentUnique = await UserService.isDeptUnique(department);

      if (managerUnique && departmentUnique) {
        const managerData = {
          email,
          department,
        };

        managerId = await UserService.createManager(managerData);
      }
    }
    if (role === "admin") {
      department = "Administrator";
      const adminData = {
        email,
        department,
      };
      const adminUnique = await UserService.isAdminUnique(department);
      if (adminUnique) {
        adminId = await UserService.createManager(adminData);
      }
    }
    if (role === "employee") {
      const deptCorrespondingManager =
        await UserService.getDeptCorrespondingManager(manager);
      const res = deptCorrespondingManager["department"];
      if (department !== deptCorrespondingManager.department) {
        throw new Error("manager ID is not matching");
      }
    }
    const id = await UserService.createUser(
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
    );

    // jwt signing

    const data = {
      department: department,
      email: email,
    };
    const token = createToken(data, maxAge);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.redirect(303, "/homepage");
    // res.send("data submitted!!");
  } catch (error) {
    console.log(error);

    // Check the type of error and set appropriate var

    if (error.message.includes("Email already exists")) {
      errors.emailError = "Email already exists. Please use a different email.";
    }
    if (error.message.includes("Password must be stronger")) {
      errors.passwordError =
        "Password must be stronger. Include uppercase, special characters, and numbers.";
    }
    if (error.message.includes("First name cannot contain numbers.")) {
      errors.firstNameError = "First name cannot contain numbers.";
    }
    if (error.message.includes("Last name cannot contain numbers.")) {
      errors.lastNameError = "Last name cannot contain numbers.";
    }
    if (error.message.includes("cannot be a manager")) {
      errors.cbm = "cannot be a manager";
    }

    if (error.message.includes("Department has alerady been assigned")) {
      errors.daa = "Department has alerady been assigned";
    }
    if (error.message.includes("fatal error encountered")) {
      errors.other = "fatal error encountered";
    }
    if (error.message.includes("Administrator has alerady been assigned")) {
      errors.adminError = "Administrator has alerady been assigned";
    }
    if (error.message.includes("invalid manager request")) {
      errors.imi = " invalid manager request ";
    }
    if (error.message.includes("manager ID is not matching")) {
      errors.mIdNotMatch = "manager ID is not matching";
    }
    return res.render("signup", { errors });
  }
}

async function login_post(req, res) {
  const { email, password } = req.body;
  try {
    const user = await UserService.getUserByEmail(email);
    //console.log(email, password);
    if (!user) {
      return res
        .status(401)
        .render("login", { error: "invalid email or password" });
    }
    const passwordMatching = await bcrypt.compare(password, user.password);

    if (!passwordMatching) {
      res.status(401).render("login", { error: "Invalid email or password" });
    } else {
      //session create yaha hoga
      const data = {
        department: user.department,
        email: user.email,
      };
      const token = createToken(data, maxAge);
      res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });

      return res.redirect(303, "/homepage");
      // return res.status(200).json({ user });
    }
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .render("login", { error: "An error occured while login !!" });
  }
}

function signup_get(req, res) {
  res.render("signup", { errors: {} });
}

async function employeeDetails(req, res) {
  const users = await UserService.getAllUsers();
  console.log(users);
  res.render("employees", { fetchAllData: users });
}

async function homepage(req, res) {
  const token = req.cookies.jwt;
  try {
    const userData = getData(token);
    const email = userData.email;
    const user = await UserService.getUserByEmail(email);
    console.log(user.manager_id);
    if (!user.manager_id) {
      user.manager_id = `you are the manager of ${user.department} department`;
    } else {
      const managerName = await UserService.getManagerName(user.manager_id);
      const name = managerName[0].first_name + " " + managerName[0].last_name;
      user.manager_id = name;
    }
    res.render("homepage", { user });
  } catch (err) {
    return res.status(404).json({
      error: err,
    });
  }
}

async function logout(req, res) {
  res.cookie("jwt", "", { maxAge: 1 });
  res.redirect("/portal ");
}

async function geteditInfo(req, res) {
  console.log(`entering the editinfo page`);

  res.render("editinfo");
}

async function posteditInfo(req, res) {}

async function editEmployeeUpdate(req, res) {
  const userData = getData(req.cookies.jwt);
  const email = userData.email;
  const user = await UserService.getUserByEmail(email);
  const updateVars = {
    f_name: user.first_name,
    l_name: user.last_name,
    phone: user.phone,
    role: user.role,
    mid: user.manager_id,
    address: user.address,
  };

  if (updateVars.role === "manager" || updateVars.role === "admin") {
    res
      .status(403)
      .render("editinfo", { error: "Please choose your correct role " });
  }

  console.log(updateVars);
  res.render("employeeUpdate");
}
async function putEditEmployeeUpdate(req, res) {
  const token = req.cookies.jwt;
  const userData = getData(token);
  const email = userData.email;
  let changes = [];

  const { newFirstName, newLastName, newAddress, newPhone } = req.body;
  if (newFirstName) {
    const nfname = await UserService.updateFirstName(newFirstName, email);
    changes.push(nfname);
  }
  if (newLastName) {
    const nlname = await UserService.updateLastName(newLastName, email);
    changes.push(nlname);
  }
  if (newAddress) {
    const naddress = await UserService.updateAddress(newAddress, email);
    changes.push(naddress);
  }
  if (newPhone) {
    const np = await UserService.updatePhone(newPhone, email);
    changes.push(np);
  }
  console.log("new changes ");
  console.log(changes);

  res.redirect("homepage");
}

async function editManagerUpdate(req, res) {
  const userData = getData(req.cookies.jwt);
  const email = userData.email;
  const user = await UserService.getUserByEmail(email);
  const updateVars = {
    f_name: user.first_name,
    l_name: user.last_name,
    phone: user.phone,
    role: user.role,
    mid: user.manager_id,
    address: user.address,
  };

  if (updateVars.role === "employee" || updateVars.role === "admin") {
    res
      .status(403)
      .render("editinfo", { error: "Please choose your correct role " });
  }
  res.render("managerUpdate");
}

async function editAdminUpdate(req, res) {
  const userData = getData(req.cookies.jwt);
  const email = userData.email;
  const user = await UserService.getUserByEmail(email);
  const updateVars = {
    f_name: user.first_name,
    l_name: user.last_name,
    phone: user.phone,
    role: user.role,
    mid: user.manager_id,
    address: user.address,
  };

  if (updateVars.role === "manager" || updateVars.role === "employee") {
    res
      .status(403)
      .render("editinfo", { error: "Please choose your correct role " });
  }

  console.log(updateVars);
  res.render("adminUpdate");
}
module.exports = {
  signup_get,
  login_post,
  login_get,
  signup_post,
  homepage,
  employeeDetails,
  editManagerUpdate,
  editAdminUpdate,
  logout,
  geteditInfo,
  posteditInfo,
  editEmployeeUpdate,
  putEditEmployeeUpdate,
};
