'use client'

import Image from 'next/image';
import styles from '@/styles/infinityPartnerScroll.module.css';
import useMobile from '@/hooks/mobile/useMobile';

const InfinitScrollCulture = () => {
  const isMobile = useMobile(768);
  const partners = ['Baskervill.jpg', 'bathhouse.jpg', 'BuroHappold.png', 'citizenm.jpg', 'Colberg.png', 'Grimshaw.jpg'];
  const seconPartners = ['LoniceraPartners.webp', 'PopupBagels.png', 'Related.jpg', 'shoparc_logo.jpg', 'Upstudio.jpg']
  const imageSize = isMobile ? '100px' : '200px';

  return (
    <>
    {/* first slider */}
    <div 
        className={styles.slider}
        style={{
            '--infinit-width': imageSize,
            '--infinit-height': imageSize,
            '--quantity': partners.length,
          } as React.CSSProperties}
        >
        <div className={styles.list}>
            {partners.map((partner, index) => (
                <div
                    key={index}
                    className={styles.item}
                    style={{ '--position': index } as React.CSSProperties}
                >
                    <Image
                        src={`/partners/${partner}`}
                        alt={partner.replace(/\.[^/.]+$/, '')}
                        className={styles.ImageScroll}
                        width={100}
                        height={100} />
                </div>
            ))}
        </div>
    </div>
    {/* second slider */}
    <div 
    className={styles.slider2}
    data-reverse="true" // Usa data-reverse en vez de reverse
    style={{
      '--infinit-width': imageSize,
      '--infinit-height': imageSize,
      '--quantity2': seconPartners.length * 2,
      '--spacing-quantity': seconPartners.length + 1,
    } as React.CSSProperties}
    >
    <div className={styles.list2}>
        {seconPartners.map((partner, index) => (
            <div
                key={index}
                className={styles.item2}
                style={{ 
                    '--position': index,
                    '--spacing-pos': index
                } as React.CSSProperties}
            >
                <Image
                    src={`/partners/${partner}`}
                    alt={partner.replace(/\.[^/.]+$/, '')}
                    className={styles.ImageScroll}
                    width={100}
                    height={100} 
                />
            </div>
        ))}
        {seconPartners.map((partner, index) => (
            <div
                key={`dup-${index}`}
                className={styles.item2}
                style={{ 
                    '--position': seconPartners.length + index,
                    '--spacing-pos': index
                } as React.CSSProperties}
            >
                <Image
                    src={`/partners/${partner}`}
                    alt={partner.replace(/\.[^/.]+$/, '')}
                    className={styles.ImageScroll}
                    width={100}
                    height={100} 
                />
            </div>
        ))}
    </div>
</div>

    </>
  );
};

export default InfinitScrollCulture;
