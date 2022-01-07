import Order from '../../models/Order';
import User from '../../models/User';


import pushNotification from '../../middlewares/pushNotification';

const stripe = require('stripe')(process.env.STRIPE_SECRET_TOKEN);

import { transporter, sendUserOrderTemplate } from '../../middlewares/email'
import { MQTT_DecreaseStocksByProductID } from '../product';
import { StripeService } from '../../services/stripe.service';
import { OrderBuilder } from '../core/Builder/OrderBuilder';
import { EmailService } from '../../services/email.service';
import { PaymentFacade } from '../core/Facade/PaymentFacade';

const GetOrders = async (req, res) => {
  try {
    // Nested population :))))
    // Because DB was designed by SQL-Mindset
    // Wrong architecture of No-SQL Database
    const orders = await
      Order.find()
        .populate([
          {
            path: 'items.item',
            populate: [{
              path: 'author',
              model: 'author'
            }]
          },
          {
            path: 'items.item',
            populate: [{
              path: 'category',
              model: 'category'
            }]
          },
          {
            path: 'items.item',
            populate: [{
              path: 'provider',
              model: 'provider'
            }]
          },
          {
            path: 'items.item',
            populate: [{
              path: 'publisher',
              model: 'publisher'
            }]
          },
        ])
        .populate('userId')
    return res.status(200).send({
      status: "OK",
      message: "Get Orders Successfully",
      data: orders,
    });
  } catch (err) {
    return res.status(400).send({
      status: "ERR_SERVER",
      message: err.message,
      data: null,
    });
  }
}

/**
|--------------------------------------------------
| CREATE NEW ORDER METHOD
|--------------------------------------------------
*/

const CreateNewOrder = async (req, res) => {
  const { items, totalAmount } = req.body.orderInfo;
  const _o = req.body.orderInfo;
  const token = req.body.token;
  console.log(token)
  const stripeDescription = items.map((item) => {
    return `itemID: ${item.item}, quantity:${item.quantity}`;
  });
  // Facade Singleton -> Payment Facade -> Order Builder
  // -> Call paymentByStripe (in case of we already have stripe token)
  // -> Call payByCash (in case of we haven't got stripe token)
  try {
    const flag = Object.keys(token).length !== 0 ? true : false
    let result;
    const paymentFacade = PaymentFacade.getInstance();
    if (flag) {

      result = paymentFacade.paymentByStripe(
        token,
        stripeDescription,
        _o.userId,
        _o.items,
        _o.name,
        _o.totalAmount,
        _o.address,
        _o.phone,
        _o.paymentMethod);
    } else {
      result = paymentFacade.paymentByCash(
        _o.userId,
        _o.items,
        _o.name,
        _o.totalAmount,
        _o.address,
        _o.phone,
        _o.paymentMethod);
    }
    return res.status(200).send({
      status: "OK",
      message: "Create Order Successfully",
      data: result,
    });
  } catch(e){
    console.log(e)
  }
  


}



/**
|--------------------------------------------------
| UPDATE ORDER METHOD
|--------------------------------------------------
*/

const UpdateOrder = async (req, res) => {
  const { id } = req.params;
  const updateStatus = req.body.status;
  if (!req.params.id) {
    return res.status(400).send({
      status: "ERR_REQUEST",
      message: "Please check your ID request",
      data: null,
    });
  }
  let data = {
    title: "Cập nhật đơn hàng",
    body: `Đơn hàng ${id.substr(id.length - 10)} đã được ${updateStatus}.`,
  };
  try {
    const resOrder = await Order.findByIdAndUpdate(id, {
      status: updateStatus,
    });
    const user: any = User.findById(resOrder.userId);
    pushNotification(user.pushTokens, data, "");
    return res.status(200).send({
      status: "OK",
      message: "Updated Order Successfully",
      data: resOrder,
    });
  } catch (err) {
    return res.status(400).send({
      status: "ERR_SERVER",
      message: err.message,
      data: null,
    });
  }
};

/**
|--------------------------------------------------
| DELETE ALL ORDER METHOD
|--------------------------------------------------
*/

const DeleteAllOrders = async (req, res) => {
  await Order.deleteMany({})
  return res.status(200).send({
    status: "OK",
    message: "Delete All Order Successfully",
  });
}

const DeleteOrder = async (req, res) => {
  const { orderId } = req.params;

  await Order.findOneAndRemove({ _id: orderId })
  return res.status(200).send({
    status: "OK",
    message: "Delete Order Successfully",
  });
}



export {
  GetOrders as GET_ORDERS,
  CreateNewOrder as CREATE_ORDER,
  UpdateOrder as UPDATE_ORDER,
  DeleteAllOrders as DELETE_ALL_ORDERS,
  DeleteOrder as DELETE_ORDER
}