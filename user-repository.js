import crypto from "crypto";
import DBLocal from "db-local";
import bcrypt from "bcrypt";

import { SALT_ROUNDS } from "./config.js";

const { Schema } = new DBLocal({ path: "./db" });

const User = Schema("User", {
  _id: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
});

export class UserRepository {
  static create({ username, password }) {
    //validations
    validations.username(username)
    validations.password(password)

    //username not exits
    const user = User.findOne({ username });
    if (user) throw new Error(" Username already exists");

    const id = crypto.randomUUID();
    const hashedPassword = bcrypt.hashSync(password, SALT_ROUNDS);

    User.create({
      _id: id,
      username,
      password: hashedPassword,
    }).save();

    return id;
  }

  static async login ({ username, password }) {
    validations.username(username)
    validations.password(password)

    //search user
    const user = User.findOne({username})
    if(!user) throw new Error('user does not exists')

    const isValid = await bcrypt.compare(password, user.password)
    if(!isValid) throw new Error('Password is invalid')

    const { password :_, ...publicUser} = user
    return publicUser
  }
}

class validations {
  static username(username) {
    if (typeof username !== "string")
      throw new Error("username must be a string");
    if (username.length < 3)
      throw new Error("username must be at last 3 characters long");
  }

  static password(password) {
    if (typeof password !== "string")
      throw new Error("password must be a string");
    if (password.length < 6)
      throw new Error("password must be at last 6 characters long");
  }
}
