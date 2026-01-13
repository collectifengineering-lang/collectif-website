'use client'
import { Swiper, SwiperSlide } from 'swiper/react'
import styles from '@/styles/work.module.css';
import Image from 'next/image'
import { Navigation, Pagination } from 'swiper/modules'

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';


interface Props {
    images: string[];
    title: string;
    className?: string;
}

const PortfolioSlideshow = ({images, title, className} : Props) => {
  return (
    <div  className={className}>
      <div className={`${styles.containerCarrouselSwiper}`}>
          <Swiper
              autoHeight={true}
              spaceBetween={20}
              navigation={true}
              pagination={{
                clickable: true,
              }}
              modules={[Navigation, Pagination]}
              className="mySwiper"
          >
              {
                images.map( (image, index) => (
                  <SwiperSlide key={ index }>
                      <Image 
                        width={1024}
                        height={800}
                        src={`/portfolio/${ image }`}
                        alt={ title }
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