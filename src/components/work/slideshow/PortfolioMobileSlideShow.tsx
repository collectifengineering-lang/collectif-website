'use client'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, FreeMode, Pagination } from 'swiper/modules';
import Image from "next/image";

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
  return (
    <div className={ className }>
        <Swiper
        style={{
          width: '100vw',
          height: '500px'
        }}
        pagination
        navigation={true}
        autoplay={{
                delay: 3000
        }}
        modules={[FreeMode, Pagination, Autoplay ]}
        className="mySwiper2"
      >
          {
            images.map( image => (
                <SwiperSlide key={ image }>
                    <Image 
                        width={ 600 }
                        height={ 500 }
                        src={`/portfolio/${ image }`}
                        alt={ title }
                        className="w-full h-full object-cover"
                    />
                </SwiperSlide>
            ))
          }
      </Swiper>
    </div>
  )
}
