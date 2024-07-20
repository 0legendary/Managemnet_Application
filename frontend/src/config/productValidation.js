
  const addProductformValidation = (product) => {
    let newErrors = {};
  
    // Name validation
    if (!product.name) {
      newErrors.name = 'Name is required.';
    } else if (product.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters long.';
    }
  
    // Description validation
    if (!product.description) {
      newErrors.description = 'Description is required.';
    } else if (product.description.length < 10) {
      newErrors.description = 'Description must be at least 40 characters long.';
    }
  
    // Category validation
    console.log(product.catergory);
    if (!product.category) {
      newErrors.category = 'Category is required.';
    }
  
    // Brand validation
    if (!product.brand) {
      newErrors.brand = 'Brand is required.';
    }
    // Price validation
    if (!product.price) {
      newErrors.price = 'Price is required.';
    } else if (isNaN(product.price) || product.price <= 0) {
      newErrors.price = 'Price must be a valid number and greater than 0.';
    }
  
    // Discount Price validation (optional, adjust based on your logic)
    if (product.discountPrice) {
      if (isNaN(product.discountPrice) || product.discountPrice <= 0) {
        newErrors.discountPrice = 'Discount Price must be a valid number and greater than 0.';
      } else if (product.discountPrice >= product.price) {
        newErrors.discountPrice = 'Discount Price cannot be greater than or equal to Price.';
      }
    }
  
    // Stock validation
    if (!product.stock) {
      newErrors.stock = 'Stock quantity is required.';
    } else if (isNaN(product.stock) || product.stock <= 0) {
      newErrors.stock = 'Stock quantity must be a valid number and greater than 0.';
    }

    // Size Options validation (assuming comma separated values)
    if (product.sizeOptions.length <= 0) {
      newErrors.sizeOptions = 'Size options are required.';
    } else {
    
      if (product.sizeOptions.length < 1) {
        newErrors.sizeOptions = 'Please provide at least one size option.';
      }
    }
  
    // Color Options validation (assuming comma separated values)
    if (product.colorOptions.length <= 0) {
      newErrors.colorOptions = 'Color options are required.';
    } else {
      if (product.colorOptions.length < 1) {
        newErrors.colorOptions = 'Please provide at least one color option.';
      }
    }
  
    // Material validation
    if (!product.material) {
      newErrors.material = 'Material is required.';
    }
  
    // Weight validation
    if (!product.weight) {
      newErrors.weight = 'Weight is required.';
    } else if (isNaN(product.weight) || product.weight <= 0) {
      newErrors.weight = 'Weight must be a valid number and greater than 0.';
    }
  
    // Gender validation
    if (!product.gender) {
      newErrors.gender = 'Gender is required.';
    }
  
    if (!product.season) {
      newErrors.season = 'Season is required.';
    }

    if(!product.mainImage) newErrors.mainImage = 'Image is required.'

    if(product.additionalImages.length === 0){
      newErrors.additionalImages = 'Additional image is needed'
    }else if(product.additionalImages.length < 3){
      newErrors.additionalImages = 'Minimum 3 images is needed'
    }
    return newErrors;
  };
  

  export {addProductformValidation}