var express = require('express');
const { route, response } = require('../app');
var router = express.Router();
var produtHelpers=require('../helpers/product-helpers')

/* GET admin listing. */
router.get('/', function (req, res, next) {
  produtHelpers.getAllProducts().then((products) => {
    res.render('admin/view-products',{admin:true , products});
  })
  
});

router.get('/add-product',function (req, res) {
  res.render('admin/add-product',{admin:true})
})

router.post('/add-product', (req, res) => {
  console.log(req.body);
  console.log(req.files.image);
  produtHelpers.addProduct(req.body, (id) => {
    let image = req.files.Image
    image.mv('./public/product-images/' + id + '.jpg', (err, done) => {
      if (!err) {
        res.render("admin/add-product",{admin:true})
      } else {
        console.log(err)
      }
    })
    res.render("admin/add-product",{admin:true})
  })
})

router.get('/delete-product', (req, res) => {
  let proId = req.query.id
  console.log(proId);
  produtHelpers.deleteProduct(proId).then((response) => {
    res.redirect("/admin/")
  })
})

router.get('/edit-product/:id', async (req, res) => {
  let product = await produtHelpers.getProductDetails(req.params.id)
  res.render('admin/edit-product',{admin:true,product})
})

router.post('/edit-product/:id', (req, res) => {
  let id = req.params.id
  produtHelpers.updateProduct(req.params.id, req.body).then(() => {
    res.redirect('/admin')
    if (req.files.Image) {
      let image = req.files.Image
      image.mv('./public/product-images/' + id + '.jpg')
    }
  })
})


module.exports = router;
