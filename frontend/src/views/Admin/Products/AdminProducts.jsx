import React, { useEffect, useState } from 'react';
import './adminProduct.css';
import { Link } from 'react-router-dom';
import axiosInstance from '../../../config/axiosConfig';

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [deleteProduct, setDeleteProduct] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    axiosInstance.get('/admin/getProducts')
      .then(response => {
        if (response.data.status) {
          setProducts(response.data.products);
          setFilteredProducts(response.data.products);
        }
      })
      .catch(error => {
        // Handle error
        console.error('Error fetching data:', error);
      });
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
      setCurrentPage(1); // Reset to the first page when searching
    } else {
      setFilteredProducts(products);
    }
  }, [searchTerm, products]);

  const handleDelete = (_id, index) => {
    console.log(_id);
    setConfirmDelete(products[index]);
    setDeleteProduct(true);
  };

  const handleMoveToTrash = (_id) => {
    axiosInstance.post('/admin/moveToTrash', { product_id: _id })
      .then((response) => {
        if (response.data.status) {
          setProducts(prevProducts => prevProducts.filter(product => product._id !== _id));
          setDeleteProduct(false);
        } else {
          console.log('Failed to move to trash');
        }
      })
      .catch(() => {
        console.log('Error moving to trash');
      });
  };

  const handleDeletePermanently = (_id) => {
    axiosInstance.post('/admin/deletePermanently', { product_id: _id })
      .then((response) => {
        if (response.data.status) {
          setProducts(prevProducts => prevProducts.filter(product => product._id !== _id));
          setDeleteProduct(false);
        } else {
          console.log('Failed to delete permanently');
          setDeleteProduct(false);
        }
      })
      .catch(() => {
        console.log('Error deleting permanently');
        setDeleteProduct(false);
      });
  };

  // Pagination logic
  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <>
      <div className="admin-products">
        <div className="header">
          <h1>Products</h1>
          <Link to='/admin/addProduct'>
            <button className="btn btn-primary">
              Add New Product
            </button>
          </Link>
        </div>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by product name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-control"
          />
        </div>
        {deleteProduct && (
          <div className="update-form bg-dark">
            <h5 className='text-danger d-flex justify-content-center pt-3 pb-3 txt-heading'>
              Are you sure you want to delete the product named '{confirmDelete.name}' permanently?
            </h5>
            <div className='d-flex gap-2 justify-content-center pb-3'>
              <button className='btn btn-danger w-50' onClick={() => handleDeletePermanently(confirmDelete._id)}>Delete Permanently</button>
              <button className='btn btn-warning w-50' onClick={() => handleMoveToTrash(confirmDelete._id)}>Move to Trash</button>
            </div>
            <button className='btn btn-primary w-100' onClick={() => setDeleteProduct(false)}>Cancel Deletion</button>
          </div>
        )}
        <table className="table table-striped">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Image</th>
              <th scope="col">Name</th>
              <th scope="col">Brand</th>
              <th scope="col">Price</th>
              <th scope="col">Stock</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentProducts.map((product, index) => {
              const mainImage = product?.images?.images?.find(image => image.mainImage);
              const displayImage = mainImage || product.images[0];
              return (
                <tr key={product._id}>
                  <th scope="row">{indexOfFirstProduct + index + 1}</th>
                  <td>
                    <div className="product-image-wrapper">
                      <img src={displayImage.cdnUrl} alt={product.name} className="product-image" style={{ width: '100px', height: '100px' }} />
                      <img src={displayImage.cdnUrl} alt={product.name} className="product-image-hover" />
                    </div>
                  </td>
                  <td>{product.name}</td>
                  <td>{product.brand}</td>
                  <td>{product.variations[0].price}</td>
                  <td>{product.variations[0].stock}</td>
                  <td>
                    <Link to={`/admin/editProduct/${product._id}`}>
                      <button className="btn btn-warning btn-sm">
                        Edit
                      </button>
                    </Link>
                    <button onClick={() => handleDelete(product._id, index)} className="btn btn-danger btn-sm">
                      Delete
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <nav aria-label="Page navigation">
          <ul className="pagination justify-content-end">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>&laquo; Previous</button>
            </li>
            {Array.from({ length: totalPages }, (_, index) => (
              <li key={index + 1} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                <button className="page-link" onClick={() => handlePageChange(index + 1)}>{index + 1}</button>
              </li>
            ))}
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>Next &raquo;</button>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
}

export default AdminProducts;
