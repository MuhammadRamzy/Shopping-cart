var express = require("express");
const { response } = require("../app");
var router = express.Router();
const produtHelpers = require("../helpers/product-helpers");
const userHelpers = require("../helpers/user-helpers");
const { route } = require("./admin");

const verifyLogin = (req, res, next) => {
  if (req.session.userloggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
};

/* GET home page. */
router.get("/", async function (req, res, next) {
  let user = req.session.user;
  let cartCount = null;
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id);
  }
  produtHelpers.getAllProducts().then((products) => {
    res.render("user/view-products", { products, user, cartCount });
  });
});

router.get("/login", (req, res) => {
  if (req.session.user) {
    res.redirect("/");
  } else {
    res.render("user/login", { loginErr: req.session.userloginErr });
    req.session.userloginErr = false;
  }
});
router.get("/signup", (req, res) => {
  res.render("user/signup");
});

router.post("/signup", (req, res) => {
  userHelpers.doSignup(req.body).then((response) => {
    req.session.user = response;
    req.session.user.loggedIn = true;
    res.redirect("/");
  });
  res.redirect("/login");
});

router.post("/login", (req, res) => {
  userHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.user = response.user;
      req.session.user.loggedIn = true;
      res.redirect("/");
    } else {
      req.session.userloginErr = "Invalid Username or Password";
      res.redirect("/login");
    }
  });
});

router.get("/logout", (req, res) => {
  req.session.user = null;
  req.session.userloggedIn=false
  res.redirect("/");
});

router.get("/cart", verifyLogin, async (req, res) => {
  let products = await userHelpers.getCartProducts(req.session.user._id);
  let user = req.session.user._id;
  let total = 0;
  if (products.lenght < 0) {
    total = await userHelpers.getTotalAmount(req.session.user._id);
  }
  res.render("user/cart", { products, user, total });
});

router.get("/add-to-cart/:id", verifyLogin, (req, res) => {
  userHelpers.addToCart(req.params.id, req.session.user._id).then(() => {
    res.json({ status: true });
  });
});

router.post("/change-product-quantity", (req, res, next) => {
  userHelpers.changeProductQuantity(req.body).then(async (response) => {
    response.total = await userHelpers.getTotalAmount(req.body.user);
    res.json(response);
  });
});

router.get("/place-order", verifyLogin, async (req, res) => {
  let user = req.session.user;
  let total = await userHelpers.getTotalAmount(req.session.user._id);
  res.render("user/place-order", { user, total });
});

router.post("/place-order", async (req, res) => {
  let products = await userHelpers.getCartProductList(req.body.userId);
  let totalPrice = await userHelpers.getTotalAmount(req.session.user._id);
  userHelpers.placeOrder(req.body, products, totalPrice).then((orderId) => {
    if (req.body["payment-method"] === "COD") {
      res.json({ codSuccess: true });
    } else {
      userHelpers.generateRazorPay(orderId, totalPrice).then((response) => {
        res.json(response);
      });
    }
  });
  console.log(req.body);
});

router.get("/order-success", (req, res) => {
  res.render("user/order-success", { user: req.session.user });
});

router.get("/orders", async (req, res) => {
  let orders = await userHelpers.getUserOrders(req.session.user._id);
  let cartCount = await userHelpers.getCartCount(req.session.user._id);
  res.render("user/orders", { user: req.session.user, orders, cartCount });
});
router.get("/view-order-products/:id", async (req, res) => {
  let products = await userHelpers.getOrderProducts(req.params.id);
  let cartCount = await userHelpers.getCartCount(req.session.user._id);
  res.render("user/view-order-products", {
    user: req.session.user,
    products,
    cartCount,
  });
});
router.post("/verify-payment", (req, res) => {
  console.log(req.body);
  userHelpers
    .verifypayment(req.body)
    .then(() => {
      userHelpers.changePaymentStatus(req.body["order[receipt]"]).then(() => {
        console.log("Payment Success");
        res.json({ status: true });
      });
    })
    .catch((err) => {
      console.log(err);
      res.json({ status: false, errMsg: "" });
    });
});

module.exports = router;
