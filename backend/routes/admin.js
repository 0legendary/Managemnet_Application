import { Router } from 'express';
import { authenticateTokenAdmin } from '../middleware/authMiddleware.js';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';
import Image from '../model/image.js';
import Product from '../model/product.js';

const router = Router();

router.get('/get-users', authenticateTokenAdmin, async (req, res) => {
    const db = getDB()
    try {
        const users = await db.collection(Collections.users).find({}, { projection: { password: 0 } }).toArray();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch users' });
    }
})

router.post('/uploadImage', authenticateTokenAdmin, async (req, res) => {
    const { base64 } = req.body;
    try {
        const newImage = new Image({ image: base64 });
        const savedImage = await newImage.save();
        res.status(201).json({ imageId: savedImage._id });
    } catch (error) {
        res.status(500).json({ error: 'Error uploading image' });
    }
});


router.post('/deleteImage', authenticateTokenAdmin, async (req, res) => {
    const { _id, product_id } = req.body;
    try {
        const deletedImage = await Image.findByIdAndDelete(_id);

        if (!deletedImage) {
            return res.status(404).json({ error: 'Image not found' });
        }
        const product = await Product.findById(product_id);
        const updatedAdditionalImages = product.additionalImages.filter(image => image !== _id);
        product.additionalImages = updatedAdditionalImages;

        await product.save();

        res.status(200).json({ status: true, message: 'Image deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting image', message: error.message });
    }
});

router.post('/addProduct', authenticateTokenAdmin, async (req, res) => {
    try {
        const newProduct = new Product({
            ...req.body,
        });

        await newProduct.save();
        res.status(201).json({ status:true, product: newProduct });
    } catch (error) {
        res.status(500).json({ error: 'Error uploading files' });
    }
})

const getBase64Image = async(products) => {
    return await Promise.all(products.map(async product => {
        const mainImage = await Image.findById(product.mainImage);
        const additionalImages = await Promise.all(
            product.additionalImages.map(async id => await Image.findById(id))
        );

        return {
            ...product,
            mainImage: mainImage.image,
            additionalImages: additionalImages.map(image => image.image)
        };
    }));
}

const getOneBase64Image = async (product) => {

    const mainImageDoc = await Image.findById(product.mainImage);
    const additionalImagesDocs = await Promise.all(
        product.additionalImages.map(async id => await Image.findById(id))
    );

    const productObj = product.toObject();

    return {
        ...productObj,
        mainImage: [{_id: product.mainImage, url:mainImageDoc.image}],
        additionalImages: additionalImagesDocs.map(imageDoc => ({
            _id: imageDoc._id,
            url: imageDoc.image
        }))
    };
}


router.get('/getProducts', authenticateTokenAdmin, async (req, res) => {
    try {
        const products = await Product.find({}).lean();
        const populatedProducts = await getBase64Image(products)
        res.status(201).json({ status: true, products: populatedProducts });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching products' });
    }
});


router.get('/edit/getProduct/:id', authenticateTokenAdmin, async (req, res) => {
    const productId = req.params.id;
    try {
        const product = await Product.findById(productId);
        const populatedProducts = await getOneBase64Image(product)
        if (populatedProducts) {
            res.status(200).json({ status: true, product: populatedProducts });
        } else {
            res.status(404).json({ status: false, message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ status: false, message: 'Error fetching product' });
    }
});
router.put('/updateProduct', authenticateTokenAdmin, async (req, res) => {
    const updatedProductData = req.body;

    try {
        // Fetch the product by its ID
        const product = await Product.findById(updatedProductData._id);

        if (product) {
            // Update the product fields with the new data
            for (const key in updatedProductData) {
                if (updatedProductData.hasOwnProperty(key) && key !== '_id') {
                    product[key] = updatedProductData[key];
                }
            }

            await product.save();

            res.status(200).json({ status: true });
        } else {
            res.status(404).json({ status: false, message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ status: false, message: 'Error updating product', error: error.message });
    }
});


router.post('/update-user', authenticateTokenAdmin, async (req, res) => {
    const { _id, username, email, newPassword } = req.body
    const db = getDB()
    const userId = ObjectId.createFromHexString(_id);
    const user = await db.collection(Collections.users).findOne({ _id: userId })
    if (user) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const updateUser = {
            username,
            email,
            ...(newPassword !== '' && { password: hashedPassword })
        }
        const update = await db.collection(Collections.users).updateOne(
            { _id: userId },
            { $set: updateUser }
        )
        if (update.modifiedCount > 0) {
            res.status(200).json({ status: true })
        } else {
            res.status(404).json({ status: false })
        }
    }
})

router.delete('/delete-user', authenticateTokenAdmin, async (req, res) => {
    const { status, _id } = req.body
    if (!_id) return res.status(404).json({ status: false })
    const db = getDB()
    const userId = ObjectId.createFromHexString(_id);
    if (status) {
        const deletion = await db.collection(Collections.users).deleteOne({ _id: userId })
        if (deletion.deletedCount > 0) {
            res.status(200).json({ status: true })
        } else {
            res.status(404).json({ status: false })
        }
    } else {
        const user = await db.collection(Collections.users).findOne({ _id: userId })
        if (user) {
            const deletion = await db.collection(Collections.users).deleteOne({ _id: userId })
            if (deletion.deletedCount > 0) {
                const insertion = await db.collection(Collections.trashUsers).insertOne({ username: user.username, email: user.email, password: user.password, createdAt: user.createdAt });
                if (insertion.insertedId) {
                    res.status(200).json({ status: true })
                }
            } else {
                res.status(404).json({ status: false })
            }
        }
    }
})

router.get('/trashed-users', authenticateTokenAdmin, async (req, res) => {
    const db = getDB()
    try {
        const users = await db.collection(Collections.trashUsers).find({}, { projection: { password: 0 } }).toArray();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch users' });
    }
})

router.post('/delete-users-trash', authenticateTokenAdmin, async (req, res) => {

    const _id = req.body.data

    if (!_id) return res.status(404).json({ status: false })
    const db = getDB()
    const userId = ObjectId.createFromHexString(_id);

    const user = await db.collection(Collections.trashUsers).findOne({ _id: userId })
    if (user) {
        const deletion = await db.collection(Collections.trashUsers).deleteOne({ _id: userId })
        if (deletion.deletedCount > 0) {
            const insertion = await db.collection(Collections.users).insertOne({ username: user.username, email: user.email, password: user.password, createdAt: user.createdAt });
            if (insertion.insertedId) {
                res.status(200).json({ status: true })
            }
        } else {
            res.status(404).json({ status: false })
        }
    }
})


router.post('/delete-trashed-user', authenticateTokenAdmin, async (req, res) => {
    const _id = req.body.data
    if (!_id) return res.status(404).json({ status: false })
    const db = getDB()
    const userId = ObjectId.createFromHexString(_id);
    const deletion = await db.collection(Collections.trashUsers).deleteOne({ _id: userId })
    if (deletion.deletedCount > 0) {
        res.status(200).json({ status: true })
    } else {
        res.status(404).json({ status: false })
    }
})

export default router;

