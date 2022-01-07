import User from "../models/User";
import * as bcrypt from 'bcryptjs'
import * as jwt from 'jsonwebtoken'
require('dotenv').config()

export class AccountService {
    constructor() {

    }
    isEmailExist = async (email : string) => {
        const flag = await User.findOne({ email })
        return flag;
    }
    registerAccount = async (name: string, email: string, password: string) => {
        const isExist = await this.isEmailExist(email);
        if (isExist) {
            throw new Error('Duplicate email')
        }
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt)
        const user = new User({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            pushTokens: [],
            phone: '',
            address: '',
            profilePicture: '',
        })
        const savedUser = await user.save();
        return savedUser;
    }


    loginToAccount = async (email: string, password: string) => {
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error('Dont find this user');
        }
        const passwordMatching = await bcrypt.compare(password, user.password);
        if (!passwordMatching) {
            throw new Error('Wrong password');
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.SECRET_TOKEN,
            { expiresIn: '7d' }
        )

        const userResponse = {
            userid: user._id,
            name: user.name,
            password: user.password,
            rawPassword: password, // :))) low security
            email: user.email,
            phone: user.phone,
            address: user.address,
            profilePicture: user.profilePicture,
            token: token,
            loginAt: Date.now(),
            expireTime: Date.now() + 604800000 // 7 days - 1h = 60 * 60 * 24
        }
        return userResponse;


    }


}


