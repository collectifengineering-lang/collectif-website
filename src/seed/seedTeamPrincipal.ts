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
            profession: "PE PMP HBDP",
            linkedin: "https://www.linkedin.com/in/rafael-figueroa-pe-pmp-hbdp-45001614/",
            email: 'rafael@collectif.nyc',
            description: "Partner and Lead Mechanical Engineer at COLLECTIF, with over 20 years of experience in project engineering and management. Since 2016, he has been leading COLLECTIF as a Minority Business Enterprise, partnering with companies and organizations promoting diversity and inclusion.",
            images: [
                'Rafael-1.png'
            ]
        },
        {
            id: 2,
            name: "Christopher",
            surname: "Ocampo",
            profession: "PE WEDG",
            linkedin: "https://www.linkedin.com/in/christopher-ocampo-p-e-749b2888/",
            email: 'christopher@collectif.nyc',
            description: "Partner and Lead Electrical Engineer at COLLECTIF, with over 10 years of design engineering and project management experience. Our firm analytical powerhouse who ensures every detail is flawless. Known for his mentoring skills, he's always ready to share his knowledge and guide the team to success.",
            images: [
                'Christopher-3.png'
            ]
        },
        {
            id: 3,
            name: "Jonathan",
            surname: "Sharp",
            profession: "PE CPHC",
            linkedin: "https://www.linkedin.com/in/jonathan-sharp-pe/",
            email: 'jonathan@collectif.nyc',
            description: "Partner and Lead Mechanical Engineer at COLLECTIF, bringing over 11 years of expertise in engineering design and management. A sharp eye (pun intended) for detail, and a passion for innovation. He leads with expertise and creativity. As a true problem-solver, he's always ready to tackle the toughest challenges.",
            images: [
                'Jonathan-2.png'
            ]
        },
    ]
}
