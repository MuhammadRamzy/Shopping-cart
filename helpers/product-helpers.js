const { resolve, reject } = require('promise');
var db = require('../config/connection')
var collection = require('../config/collections')
var objectId = require("mongodb").ObjectID

module.exports = {
    
    addProduct: (product,callback) => {
        console.log(product);
        product.Price=parseInt(product.Price)
        db.get().collection('product').insertOne(product).then((data) => {
            callback(data.ops[0]._id)
        })
    },
    getAllProducts: () => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })
    },
    deleteProduct: (prodId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).removeOne({ _id:objectId(prodId) }).then((response) => {
                resolve(response)
            })
        })
    },
    getProductDetails: (prodId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(prodId) }).then((product) => {
                resolve(product)
            })
        })
    },
    updateProduct: (proId, productDetails) => {
        productDetails.Price=parseInt(productDetails.Price)
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION)
                .updateOne({ _id: objectId(proId) }, {
                    $set: {
                        Name: productDetails.Name,
                        Category: productDetails.Category,
                        Description: productDetails.Description,
                        Price: productDetails.Price
                    }
                })
                .then((response) => {
                resolve()
            })
        })
    }
}