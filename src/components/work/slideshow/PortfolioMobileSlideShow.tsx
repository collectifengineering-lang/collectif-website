'use client'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, FreeMode, Pagination } from 'swiper/modules';
import Image from "next/image";
import styles from '@/styles/work.module.css';

import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import 'swiper/css/pagination';


interface Props {
  images: string[];
  title: string;
  className?: string;
}

export const PortfolioMobileSlideShow = ({images, title, className} : Props) => {
  const hasMultiple = images.length > 1;

  return (
    <div className={className}>
        <Swiper
        style={{
          width: '100vw',
          height: '500px'
        }}
        spaceBetween={8}
        slidesPerView={hasMultiple ? 1.08 : 1}
        centeredSlides={hasMultiple}
        // Swiper 12's loop mode stalls with only 3 slides here; rewind keeps them cycling
        loop={images.length >= 4}
        rewind={images.length === 3}
        pagination
        autoplay={{
                delay: 3000
        }}
        modules={[FreeMode, Pagination, Autoplay]}
        className={styles.slideshow}
      >
          {
            images.map(image => (
                <SwiperSlide key={image}>
                    <Image 
                        width={600}
                        height={500}
                        src={`/portfolio/${image}`}
                        alt={title}
                        className="w-full h-full object-cover"
                    />
                </SwiperSlide>
            ))
          }
      </Swiper>
    </div>
  )
}
