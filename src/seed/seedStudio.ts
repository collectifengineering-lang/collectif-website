interface SeedSpecializedStudios {
    id: number;
    title: string;
    description: string;
    images: string[];
}

interface SeedStudiosData {
    studios: SeedSpecializedStudios[],
}

export const studiosData: SeedStudiosData = {
    studios: [
        {
            id: 1,
            title: 'Commercial Interiors Team',
            description: 'Focused on the design of office fit-outs, lobbies, and amenities, our Commercial Interiors team creates functional and aesthetically pleasing spaces that meet the needs of modern businesses.',
            images: [
                'specialized-studios-4.jpg'
            ]
        },
        {
            id: 2,
            title: 'Luxury MEP Team',
            description: 'Specializing in high-end residential, wellness, and retail projects of various scales, our Luxury MEP team delivers sophisticated and innovative solutions.',
            images: [
                'specialized-studios-1.jpg'
            ]
        },
        {
            id: 3,
            title: 'Public Projects Team',
            description: 'Design and design-build teams, our Public Projects team works on projects with DDC, EDC, PANYNJ, OGS, and other local agencies, ensuring compliance and excellence in public infrastructure.',
            images: [
                'specialized-studios-3.jpg'
            ]
        },
        {
            id: 4,
            title: 'High-Rise Residential Team',
            description: 'Managing larger infrastructure projects, including ground-up buildings and adaptive reuse, our High-Rise Residential and Hotel Team excels in delivering complex and large-scale developments.',
            images: [
                'specialized-studios-2.jpg'
            ]
        },
    ]
}
