'use client'
import { Swiper, SwiperSlide } from 'swiper/react'
import styles from '@/styles/work.module.css';
import Image from 'next/image'
import { Navigation, Pagination } from 'swiper/modules'

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';


interface Props {
    images: string[];
    title: string;
    className?: string;
}

const PortfolioSlideshow = ({images, title, className} : Props) => {
  const hasMultiple = images.length > 1;

  return (
    <div className={className}>
      <div className={styles.containerCarrouselSwiper}>
          <Swiper
              spaceBetween={16}
              slidesPerView={hasMultiple ? 1.35 : 1}
              centeredSlides={hasMultiple}
              loop={images.length >= 3}
              navigation={true}
              pagination={{
                clickable: true,
              }}
              modules={[Navigation, Pagination]}
              className={styles.slideshow}
          >
              {
                images.map((image, index) => (
                  <SwiperSlide key={index}>
                      <Image 
                        width={1024}
                        height={800}
                        src={`/portfolio/${image}`}
                        alt={title}
                        className="object-fill"
                      />
                  </SwiperSlide>
                ))
              }
          </Swiper>
      </div>
    </div>
  )
}

export default PortfolioSlideshow