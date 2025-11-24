// src/components/MainHeroSlider.jsx
import React from 'react';
import Slider from 'react-slick';

const MainHeroSlider = ({ data = [] }) => {
  const settings = {
    dots: true,
    arrows: false,
    autoplay: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    infinite: true,
    pauseOnHover: true,
  };

  if (!Array.isArray(data)) data = [];

  return (
    <div className="slider-bottom">
      <div id="top" className="callbacks_container">
        <Slider {...settings}>
          {data.map((slide, idx) => (
            <div key={slide.id || idx}>
              <div className="slider-grids">
                <div className="slider-left">
                  <h3>{slide.title}</h3>
                  <p>{slide.description}</p>
                  <h4>
                    <span>{slide.originalPrice}</span>
                    {slide.salePrice}
                  </h4>
                  <a href={slide.link}>BUY NOW</a>
                </div>
                <div className="slider-right text-center">
                  <img src={slide.imageSrc} alt={slide.title} style={{ maxWidth: '100%', height: 'auto' }} />
                </div>
                <div className="clearfix"></div>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default MainHeroSlider;
