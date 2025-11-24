// src/components/header/index.js
import Button from '@mui/material/Button';
import { IoIosMenu } from "react-icons/io";
import { FaAngleDown } from "react-icons/fa6";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { IoHomeSharp } from "react-icons/io5";
import { BiSolidContact } from "react-icons/bi";
import { FaBlog } from "react-icons/fa6";
import { FaShoppingBag } from "react-icons/fa";
import { FaShippingFast } from "react-icons/fa";
import { FaGift } from "react-icons/fa6";
import { useState, useEffect, useRef } from 'react';

const CATEGORIES = [
  "Accessories",
  "Art & Collectibles",
  "Bags & Purses",
  "Baby",
  "Bath & Beauty",
  "Books, Films & Music",
  "Clothing",
  "Supplies & Tools",
  "Electronics",
  "Gifts",
  "Home & Living"
];

const Navigation = () => {
  const [isOpenSidebarVal, setIsOpenSidebarVal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const sidebarRef = useRef(null);

  // parse active category from query param (if any)
  const urlParams = new URLSearchParams(location.search);
  const activeCategoryParam = urlParams.get('category') ? decodeURIComponent(urlParams.get('category')) : null;

  // navigate to products with category query param
  const goCategory = (cat) => {
    const q = encodeURIComponent(cat);
    // push new route without reloading the page
    navigate(`/products?category=${q}`);
    setIsOpenSidebarVal(false);
  };

  // close sidebar on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (isOpenSidebarVal && sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setIsOpenSidebarVal(false);
      }
    };
    const handleEsc = (e) => {
      if (e.key === 'Escape') setIsOpenSidebarVal(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpenSidebarVal]);

  return (
    <nav>
      <div className='container'>
        <div className='row'>
          <div className='col-sm-3 navpart1'>
            <div className='catwrapper'>
              <Button
                className='allCatTab align-items-center'
                onClick={() => setIsOpenSidebarVal(!isOpenSidebarVal)}
                aria-expanded={isOpenSidebarVal}
                aria-controls="category-sidebar"
              >
                <span className=' icon1 mr-2'><IoIosMenu /></span>
                <span className="text"> ALL CATEGORIES</span>
                <span className='icon2 mr-2'><FaAngleDown /></span>
              </Button>

              <div
                id="category-sidebar"
                ref={sidebarRef}
                className={`sidebarNav ${isOpenSidebarVal ? 'open' : ''}`}
                role="menu"
                aria-hidden={!isOpenSidebarVal}
              >
                <ul>
                  {CATEGORIES.map((cat) => {
                    const isActive = activeCategoryParam && activeCategoryParam.toLowerCase() === cat.toLowerCase();
                    return (
                      <li key={cat}>
                        <Button
                          onClick={() => goCategory(cat)}
                          aria-pressed={isActive}
                          className={isActive ? 'category-active' : ''}
                        >
                          {cat}
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>

          <div className='col-sm-9 navpart2 d-flex align-item-center'>
            <ul className='list list-inline ml-auto'>
              <li className='list-inline-item'><Link to="/"><IoHomeSharp />Home</Link></li>
              <li className='list-inline-item'><Link to="/products"><FaShoppingBag /> Product</Link></li>
              <li className='list-inline-item'><Link to="/gifts"><FaGift />Gift</Link></li>
              <li className='list-inline-item'><Link to="/order-track"><FaShippingFast />Order Track</Link></li>
              <li className='list-inline-item'><Link to="/blog"><FaBlog />Blog</Link></li>
              <li className='list-inline-item'><Link to="/contact"><BiSolidContact />Contact us</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
