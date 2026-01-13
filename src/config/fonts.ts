import { Lato, Montserrat, Staatliches, Inter, Roboto } from "next/font/google";

export const lato = Lato({ 
    subsets: ["latin"],
    weight: ['400', '700']
});

export const mainFont = Staatliches({ 
    subsets: ["latin"],
    weight: ['400'],
});

export const montserrat = Montserrat({ 
    subsets: ["latin"],
    weight: ['400'],
});

export const inter = Inter({ 
    subsets: ["latin"],
    weight: ['200'],
});

export const roboto = Roboto({ 
    subsets: ["latin"],
    weight: ['300'],
});