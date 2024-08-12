import React, { useEffect, useState } from 'react';
import './SingleProduct.css';
import axiosInstance from '../../../config/axiosConfig';
import { Link, useParams } from 'react-router-dom';
import ReactImageMagnify from 'react-image-magnify';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function SingleProduct() {
  const { id } = useParams();
  const [product, setProduct] = useState({});
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [selectedColor, setSelectedColor] = useState(null);
  const [cartProducts, setCartProducts] = useState([])
  const [offers, setOffers] = useState([])
  useEffect(() => {
    axiosInstance.get(`/user/shop-product/${id}`)
      .then(response => {
        if (response.data.status) {
          console.log(response.data.offers);
          setOffers(response.data.offers ? response.data.offers : []);
          setProduct(response.data.product);
          setSelectedVariation(response.data.product.variations[0]);
          setMainImage(response.data.product.mainImage);
          setAdditionalImages(response.data.product.additionalImages);
          setSelectedColor(response.data.product.variations[0].color[0]);
          setCartProducts(response.data.cartProducts ? response.data.cartProducts : [])
        }
      })
      .catch(error => {
        console.error('Error getting data:', error);
      });
  }, [id]);

  const handleSizeClick = (variation) => {
    setSelectedVariation(variation);
    setSelectedColor(variation.color[0]);
  };
  const handleColorClick = (color) => {
    setSelectedColor(color);
  };

  const handleImageClick = (clickedImage) => {
    setMainImage(clickedImage);
    const index = additionalImages.findIndex(img => img._id === clickedImage._id);
    const updatedImages = [...additionalImages];
    updatedImages[index] = mainImage;
    setAdditionalImages(updatedImages);
  };




  const handleAddToCart = () => {
    console.log(selectedVariation);
    axiosInstance.post('/user/shop/add-to-cart', {
      productId: product._id,
      price: selectedVariation.price,
      discountedPrice: selectedVariation.discountPrice,
      selectedStock: selectedVariation.stock,
      selectedColor,
      selectedSize: selectedVariation.size,
      categoryId: product.categoryId._id
    })
      .then(response => {
        if (response.data.status) {
          response.data.product && setCartProducts([...cartProducts, response.data.product])
        }
      })
      .catch(error => {
        console.error('Error adding product to cart:', error);
      });
  };


  const isProductInCart = cartProducts.some(cartProduct =>
    cartProduct.selectedColor === selectedColor &&
    cartProduct.selectedSize == selectedVariation?.size
  );


  const addToWishlist = async (productId) => {
    console.log(productId);
    axiosInstance.post('/user/add-to-wishlist', { productId })
        .then(response => {
            if (response.data.status) {
                toast.success("Added to Wishlist", {
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: false,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                });
            }
        })
        .catch(error => {
            console.error('Error sending data:', error);
        });
};


  return (
    <div className="container" style={{ marginTop: '15rem', color: 'white' }}>
      <ToastContainer />
      <div className="container">
        {product.name ? (
          <div className="product-details">
            <div className="product-image">
              <div className='main-image'>
                {mainImage && (
                  <ReactImageMagnify
                    {...{
                      smallImage: {
                        alt: product.name,
                        isFluidWidth: true,
                        src: mainImage.image
                      },
                      largeImage: {
                        src: mainImage.image,
                        width: 1200,
                        height: 1800
                      },
                      shouldHideHintAfterFirstActivation: false
                    }}
                  />
                )}
              </div>
              <div className="additional-images">
                {additionalImages.map((image, index) => (
                  <img
                    key={index}
                    src={image.image}
                    alt={`Additional ${index + 1}`}
                    onClick={() => handleImageClick(image)}
                    className="thumbnail"
                  />
                ))}
              </div>
            </div>
            <div className="product-info">
              <h1>{product.name}</h1>
              <p>{product.description}</p>
              <div className="category">Category: {product.categoryId.name}</div>
              <div className="brand">Brand: {product.brand}</div>
              {product.gender && <div className="gender">Gender: {product.gender}</div>}
              {product.season && <div className="season">Season: {product.season}</div>}

              {selectedVariation && (
                <>
                  <div className="price">Price: ₹{selectedVariation.discountPrice}</div>
                  {selectedVariation.price !== selectedVariation.discountPrice && (
                    <div className="discount-price">Original Price: ₹{selectedVariation.price}</div>
                  )}
                  <div className='d-flex justify-content-center'>
                    {offers.map((offer) => (
                      <div key={offer._id} className="offer-badge">
                        {offer.discountPercentage
                          ? `|| ${offer.discountPercentage}% OFF ||`
                          : `|| Discount: ${offer.discountAmount} ||`
                        }
                        <p>{offer.description}</p>
                      </div>
                    ))}
                  </div>
                  <div className="variation-details">
                    <div className="color-options border m-3 rounded">
                      {selectedVariation.color.map((color, index) => (
                        <button
                          key={index}
                          type="button"
                          className={`btn color-btn m-3 ${selectedColor === color ? 'active' : ''}`}
                          style={{ border: `1px ${color} solid` }}
                          onClick={() => handleColorClick(color)}
                        >
                          {color}
                          {selectedColor === color && <i className="bi bi-check"></i>}
                        </button>
                      ))}
                    </div>
                    <div>Weight: {selectedVariation.weight}g</div>
                    <div>Stock: {selectedVariation.stock}</div>
                  </div>
                </>
              )}

              <div className="sizes mt-3">
                <h3>Available Sizes</h3>
                <div className="btn-group" role="group" aria-label="Sizes">
                  {product.variations.map((variation, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`btn btn-outline-primary ${selectedVariation === variation ? 'active' : ''}`}
                      onClick={() => handleSizeClick(variation)}
                    >
                      Size {variation.size}
                    </button>
                  ))}
                </div>
              </div>
              <div className="add-to-cart-btn mt-3">
                {selectedColor && selectedVariation ? (
                  isProductInCart ? (
                    <Link to='/cart'>
                      <button className="btn btn-secondary me-2">Go to Cart</button>
                    </Link>
                  ) : (
                    <button className="btn border border-success text-white me-2" onClick={handleAddToCart}>Add to Cart</button>
                  )
                ) : (
                  <button className="btn btn-primary" disabled>Add to Cart</button>
                )}
                {/* <button className='btn btn-success me-2'>Buy now</button> */}
                <Link to={`/checkout/${product._id}`}>
                  <button className='btn border border-success text-white me-2'>Buy now</button>
                </Link>
                <button className='btn border border-success text-white' onClick={() => addToWishlist(product._id)}>Add to wishlist</button>
              </div>
            </div>
          </div>
        ) : (
          <div>Loading...</div>
        )}
      </div>
    </div>
  );
}

export default SingleProduct;
