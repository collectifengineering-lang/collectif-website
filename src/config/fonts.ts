import { Jost } from "next/font/google";

const jost = Jost({
    subsets: ["latin"],
    weight: ['300', '400', '500', '700'],
    variable: '--font-jost',
});

export const lato = jost;
export const mainFont = jost;
export const montserrat = jost;
export const inter = jost;
export const roboto = jost;
