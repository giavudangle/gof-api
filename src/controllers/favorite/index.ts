/* eslint-disable consistent-return */
import Favorite from "../../models/Favorite";
import { FavoritePrototype } from "../../core/Prototype/FavoritePrototype";

const GetFavorites = (req, res) => {
  Favorite.find()
    .populate({
      path: 'items.item',
      populate: {
        path: 'author',
      }
    })
    .populate({
      path: 'items.item',
      populate: {
        path: 'category',
      }
    })
    .populate({
      path: 'items.item',
      populate: {
        path: 'provider',
      }
    })
    .populate({
      path: 'items.item',
      populate: {
        path: 'publisher',
      }
    })
    .then((data) => {
      return res.status(200).send({
        status: "OK",
        message: "Get Users Favorite List Successfully",
        data: data,
      });
    })
    .catch((err) => {
      return res.status(400).send({
        status: "ERR_SERVER",
        message: err.message,
        data: null,
      });
    });
};



const PostFavorite = (req, res) => {
  if (!req.body) {
    return res.status(200).send({
      status: "ERR_REQUEST",
      message: "Please check your request!",
      data: null,
    });
  }
  Favorite.findOne({ userId: req.body.userId }, (err, result) => {
    if (err) {
      return res.status(404).send({
        status: "ERR_SERVER",
        message: err.message,
        data: null,
      });
    }


    if (result) {
      result.items.push(req.body.items[0]);
      result
        .save()
        .then((data) => {
          return res.status(200).send({
            status: "OK",
            message: "Added Favorite Item Successfully",
            data: data,
          });
        })
        .catch((err) => {
          return res.status(400).send({
            status: "ERR_SERVER",
            message: err.message,
            data: null,
          });
        });
    } else {
      const { userId, items } = req.body;
      const prototype = new FavoritePrototype(userId, items)
      const cloned: any = prototype.shallowClone();
      cloned
        .save()
        .then((data) => {
          return res.status(200).send({
            status: "OK",
            message: "Added Favorite Item Successfully",
            data: data,
          });
        })
        .catch((err) => {
          return res.status(400).send({
            status: "ERR_SERVER",
            message: err.message,
            data: null,
          });
        });
    }
  });
};

const DeleteFavoriteItem = async (req, res) => {
  const { userId } = req.params;
  const { item } = req.body;
  try {
    const result = await Favorite.findOne({ userId: userId });
    const favoriteIndex = result.items.findIndex((product) => {
      return product.toString() === item;
    });
    result.items.splice(favoriteIndex, 1);
    await result.save();
    return res.status(200).send({
      status: "OK",
      message: "Remove Favorite Item Successfully",
      data: result,
    });
  } catch (e) {
    console.log(e)
    return res.status(400).send({
      status: "ERR_SERVER",
      message: e.message,
      data: null,
    });
  }
};




export {
  GetFavorites as GET_FAVORITES,
  PostFavorite as POST_FAVORITE,
  DeleteFavoriteItem as DELETE_FAVORITE_ITEM,
};

