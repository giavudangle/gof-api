import User from '../../models/User';
import * as fs from 'fs'

import { registerValidation, loginValidation } from '../../middlewares/validation'

import bcrypt, { compareSync } from 'bcryptjs'

import jwt from 'jsonwebtoken'

import { transporter, getPasswordResetURL, resetPasswordTemplate, registerUserTemplate }
  from '../../middlewares/email'

import usePasswordHashToMakeToken from '../../middlewares/createUserToken'

import pushNotification from '../../middlewares/pushNotification';


import cloudinary from '../../middlewares/cloudinary'
import { AccountService } from '../../services/auth.service';
import { EmailService } from '../../services/email.service';
import { AUTHENTICATION_RESPONSE_CONSTANTS, CLIENT_RESPONSE_CONSTANTS, SERVER_RESPONSE_CONSTANTS } from '../../const/http.const';
import { EmailObserver } from '../../core/Observer/EmailObserver';


const UserRegister = async (req, res) => {
  const accountService = new AccountService();
  const emailService = new EmailService();

  try {
    const {name,email,password} = req.body;
    const user = await accountService.registerAccount(name,email,password)
    const {from,to,subject,html} = emailService.getRegisterUserTemplate(user);
    const emailObserver = new EmailObserver(from,to,subject,html);
    emailObserver.subjectEvent.on('success',(infor) => {
      console.log(infor)
    })
    emailObserver.subjectEvent.on('error',(e) =>{
      console.log(e)
    })

    emailObserver.send();

    return res.status(SERVER_RESPONSE_CONSTANTS.SERVER_SUCCESS_CODE).send({
      status: "Success",
      message: "Register account successfully",
      data: user
    })
  }catch(e) {
    console.log(e)
    return res.status(SERVER_RESPONSE_CONSTANTS.SERVER_ERROR_CODE)
    .send({
      error: SERVER_RESPONSE_CONSTANTS.SERVER_ERROR_CONTENT,
      message: 'Your email are already exists'
    })
  }
}


const UserLogin = async (req, res) => {
  const { error } = loginValidation(req.body);
  if (error) {
    return res.status(SERVER_RESPONSE_CONSTANTS.SERVER_ERROR_CODE).send(error.details[0].message);
  }
  const email = req.body.email.toLowerCase();
  const password = req.body.password;
  const accountService = new AccountService();
  try {
    const user = await accountService.loginToAccount(email,password);
    return res.status(SERVER_RESPONSE_CONSTANTS.SERVER_SUCCESS_CODE).json(user)
  }catch(e) {
    return res.status(AUTHENTICATION_RESPONSE_CONSTANTS.AUTHENTICATION_FAILED_CODE)
      .send({
        status: CLIENT_RESPONSE_CONSTANTS.CLIENT_ERROR_STATUS,
        message: e
      })
  }
}

  


// Low security
const UpdatePassword = async (req,res) => {
  const {id} = req.params;
  const {newPassword} = req.body;
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(newPassword, salt);
  User.findOneAndUpdate({_id:id},{
    password: hashedPassword,
    rawPassword: newPassword
  })
  .then((result) => {
    return res.status(SERVER_RESPONSE_CONSTANTS.SERVER_SUCCESS_CODE).send(result);
  })
  .catch((err) => {
    res.status(SERVER_RESPONSE_CONSTANTS.SERVER_ERROR_CODE).send(err);
  });
}


const UserEdit = async (req, res) => {
  const { id } = req.params;
  User.findOneAndUpdate({ _id: id }, req.body)
    .then((result) => {
      return res.status(SERVER_RESPONSE_CONSTANTS.SERVER_SUCCESS_CODE).send(result);
    })
    .catch((err) => {
      res.status(SERVER_RESPONSE_CONSTANTS.SERVER_ERROR_CODE).send(err);
    });
};

const UserUploadProfilePhoto = async (req, res) => {
  const { id } = req.params;


  if (!req.body || !req.file) {
    return res.status(CLIENT_RESPONSE_CONSTANTS.CLIENT_ERROR_CODE).send({
      status: CLIENT_RESPONSE_CONSTANTS.CLIENT_ERROR_STATUS,
      message: CLIENT_RESPONSE_CONSTANTS.CLIENT_ERROR_CONTENT,
      data: 'PLEASE GIVE ME AN IMAGE',
    });
  } else {
    const { secure_url } = await cloudinary.uploader.upload(req.file.path);
    fs.unlinkSync(req.file.path)


    User.findOneAndUpdate({ _id: id }, { profilePicture: secure_url })
      .then((result) => {
        return res.status(SERVER_RESPONSE_CONSTANTS.SERVER_SUCCESS_CODE)
          .send('Upload profile picture successfully');
      })
      .catch((err) => {
        res.status(SERVER_RESPONSE_CONSTANTS.SERVER_ERROR_CODE).send(err);
      });
  }
}

const UserResetPassword = async (req, res) => {
  const clientIp = req.body.client_ip
  const email = req.body.email.toLowerCase();
  if (!email) {
    return res.status(400).send({ err: 'Email is wrong' });
  }
  let user;
  try {
    user = await User.findOne({ email });
    if(!user){
      return res.status(404).send({ err: 'Email is not exist' });
    }
  } catch (err) {
    res.status(404).send({ err: 'Email is not exist' });
  }
 
  const token = usePasswordHashToMakeToken(user);
  const url = getPasswordResetURL(user, token,clientIp);
  const emailTemplate = resetPasswordTemplate(user, url);
  
  const sendEmail = () => {
    transporter.sendMail(emailTemplate, (err, info) => {
      if (err) {
        res.status(500).send({ err: 'Error sending email' });
      } else {
        console.log(`** Email sent **`, info);
        res.send({ res: 'Sent reset Email' });
      }
    });
  };

  sendEmail();
}


const UserReceiveNewPassword = async (req, res) => {
  const { userId, token } = req.params;
  const { password } = req.body;
  let data = {
    title: 'Security',
    body: `Reset Password Successfully.`,
  };

  // highlight-start
  const id = userId;
  const user = await User.findById(id).exec()
  if (!user) {
    res.status(SERVER_RESPONSE_CONSTANTS.SERVER_ERROR_CODE)
      .send(AUTHENTICATION_RESPONSE_CONSTANTS.USER_INVALID);
  }
  const secret = user.password + '-' + user.createdAt;


  const payload = jwt.decode(token, secret);
  if (payload._id === userId) {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    try {
      const updateUser = await User.findOneAndUpdate(
        { _id: userId },
        { password: hashedPassword },
        { $set: { "pushTokens": token } }
      );
      pushNotification(updateUser.pushTokens, data, ''),
        res.status(202).send('Password is changed');
    } catch (err) {
      res.status(500).send({ err });
    }
  } else {
    res.status(500).send({ err: 'Token is invalid' });
  }
}


export {
  UserRegister as USER_REGISTER,
  UserLogin as USER_LOGIN,
  UserEdit as USER_EDIT,
  UserUploadProfilePhoto as USER_UPLOAD_PHOTO,
  UserResetPassword as USER_RESET_PASSWORD,
  UserReceiveNewPassword as USER_RECEIVE_NEW_PASSWORD,
  UpdatePassword as USER_UPDATE_PASSWORD
}