import React from 'react'
import styles from '@/styles/whyus.module.css'
import Image from 'next/image'
import { Whyus } from '@/interfaces'

interface Props {
    dataWhyus: Whyus[],
}

export const Steps = ({ dataWhyus }: Props ) => {
  return (
    <div className="flex flex-col gap-6">
        {
            dataWhyus.map((step, index) => (
                <React.Fragment key={step.id}> {/* 🔥 React.Fragment con key */}
                    <div className={styles.line} />
                    <div
                        className={`grid grid-cols-1 md:grid-cols-2 items-center gap-4 ${
                            index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                        }`}
                    >
                        {/* Columna izquierda: Texto */}
                        <div className="text-left">
                            <h3 className={`ml-3 ${styles.textStepTitle}`}>{step.step} </h3>
                            <h4 className={`text-lg font-semibold ml-3 ${styles.texTitle}`}>{step.title}</h4>
                            <p className="text-gray-600 ml-3">{step.description}</p>
                        </div>

                        {/* Columna derecha: Imagen */}
                        <div className="flex justify-center">
                            <Image
                                src={`/whyus/${step.image}`}
                                width={400}
                                height={400}
                                className={`rounded-lg ${styles.imageStep3}`}
                                alt={`step-${step.id}-picture`} 
                            />
                        </div>
                    </div>
                </React.Fragment>
            ))
        }
    </div>
  )
}
