export interface MusicCredit {
    title: { Tr: string, En?: string, Zz?: string, Kr?: string };
    composer: string;
    performer: string;
    source: string;
    license: string;
    licenseLink: string;
    changes: { Tr: string, En?: string, Zz?: string, Kr?: string };
}

export interface Dedication {
    from: string;
    to: { Tr: string, En?: string, Zz?: string, Kr?: string };
}

export interface ZazaLingoInfoData {
    mainTitle: { Tr: string, En?: string, Zz?: string, Kr?: string };
    teamTitle: { Tr: string, En?: string, Zz?: string, Kr?: string };
    dedicationTitle: { Tr: string, En?: string, Zz?: string, Kr?: string };
    musicTitle: { Tr: string, En?: string, Zz?: string, Kr?: string };
    missionTitle: { Tr: string, En?: string, Zz?: string, Kr?: string };
    mission: { Tr: string, En?: string, Zz?: string, Kr?: string };
    team: string[];
    dedications: Dedication[];
    music: MusicCredit[];
}

export const zazaLingoInfo: ZazaLingoInfoData = {
    "mainTitle": { "Tr": "ZazaLingo Ayarları" },
    "teamTitle": { "Tr": "ZazaLingo Ekibi" },
    "dedicationTitle": { "Tr": "İthaflar" },
    "missionTitle": { "Tr": "Misyonumuz" },
    "mission": { "Tr": "Bu uygulamadaki amaçlarımız;\n-Kürtçe'nin Zazakî Lehçesini dijital ortama taşımak\n-Standart Zazakî'nin bilinmesini arttırmak\n-Çocuklar ve gençlerimize eğlenceli bir şekilde                Zazakî'yi öğretmek" },
    "musicTitle": { "Tr": "Müzik Bilgileri" },
    "team": [
        "Onur Şenoğlu"
    ],
    "dedications": [
        {
            "from": "Onur Şenoğlu",
            "to": { "Tr": "Bu uygulamadaki çalışmalarımı başta Dedem İsa Yıldız olmak üzere Bekan ve Saroyan ailelerine ve Değerli arkadaşım Şevîn Roşna Hocaoğlu'na ithaf ediyorum." }
        }
    ],
    "music": [
        {
            "title": { "Tr": "Piano Sonata No. 10 in C Major, K.330" },
            "composer": "Wolfgang Amadeus Mozart",
            "performer": "Alessio Averone",
            "source": "Musopen",
            "license": "CC BY 3.0",
            "licenseLink": "https://creativecommons.org/licenses/by/3.0/",
            "changes": { "Tr": "looped" }
        }
    ]
};
