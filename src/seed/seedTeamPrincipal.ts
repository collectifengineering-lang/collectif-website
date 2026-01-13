interface SeedPrincipalTeam {
    id: number;
    name: string;
    surname: string;
    profession: string;
    linkedin: string;
    email: string;
    description: string;
    images: string[];
}

interface SeedPrincipalTeamData {
    team: SeedPrincipalTeam[],
}

export const teamPrincipalData: SeedPrincipalTeamData = {
    team: [
        {
            id: 1,
            name: "Rafael",
            surname: "Figueroa",
            profession: "Partner",
            linkedin: "https://www.linkedin.com/in/rafael-figueroa-pe-pmp-hbdp-45001614/",
            email: 'rafael@collectif.nyc',
            description: "One of the driving forces behind our firm. With over 20 years of extensive experience in project engineering and management, he has contributed to all phases of engineering services, demonstrating his versatility and expertise.",
            images: [
                'Rafael-1.png'
            ]
        },
        {
            id: 2,
            name: "Christopher",
            surname: "Ocampo",
            profession: "Partner",
            linkedin: "https://www.linkedin.com/in/christopher-ocampo-p-e-749b2888/",
            email: 'christopher@collectif.nyc',
            description: "With over a decade of experience, Christopher, a Partner and Senior Electrical Engineer at the firm is an analytical powerhouse who ensures every detail is flawless. Known for his mentoring skills, he's always ready to share his knowledge and guide the team to success.",
            images: [
                'Christopher-3.png'

            ]
        },
        {
            id: 3,
            name: "Jonathan",
            surname: "Sharp",
            profession: "Partner",
            linkedin: "https://www.linkedin.com/in/jonathan-sharp-pe/",
            email: 'jonathan@collectif.nyc',
            description: "Brings over a decade of experience, a sharp eye (pun intended) for detail, and a passion for innovation. He leads with expertise and creativity. As a true problem-solver, he's always ready to tackle the toughest challenges.",
            images: [
                'Jonathan-2.png'
            ]
        },
        // {
        //     id: 4,
        //     name: "Michael",
        //     surname: "Geary",
        //     profession: "Principal",
        //     linkedin: "https://www.linkedin.com/in/michael-g-1112813/",
        //     email: 'michael@collectif.nyc',
        //     description: "With over 25 years in MEP design and 5 years as an MEP Director, he excels in mechanical design, project management, and quality control. He is known for delivering cost-efficient, aesthetic, and serviceable solutions.",
        //     images: [
        //         'Michael-4.png'
        //     ]
        // }
    ]
}
