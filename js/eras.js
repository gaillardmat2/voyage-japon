// Contenu historique du jeu « Michi — le voyage du pèlerin du temps »
// Coordonnées locales : x de -46 à 46 (0 = chemin), z de 0 à 140 (sens de la marche).

export const ZONE_LENGTH = 140;

export const KIKO_TUTORIAL = [
  "Bienvenue, {name} ! Je suis Kiko, renard messager du sanctuaire d'Inari.",
  "Je vais te guider sur le « michi », le chemin qui traverse toute l'histoire du Japon : plus de 16 000 ans !",
  "Pour marcher : ZQSD (ou WASD) ou les flèches. Sur écran tactile, utilise le joystick en bas à gauche. Fais glisser l'écran pour tourner la caméra.",
  "Les losanges dorés signalent des lieux à découvrir, les bulles « ! » des habitants à qui parler. Approche-toi puis appuie sur E ou sur le gros bouton.",
  "Quand tu as tout découvert dans une époque, le gardien du torii te pose une question. Bonne réponse : le passage vers l'époque suivante s'ouvre !",
  "Si tu es perdu, appuie sur mon bouton 🦊 : je te dirai ce qu'il reste à voir. Nous commençons à l'époque Jōmon. En route !"
];

export const ERAS = [
  // ───────────────────────────── 0. JŌMON
  {
    name: "Jōmon",
    dates: "vers 14 000 – 300 av. J.-C.",
    sun: [40, 200], fog: 0xcfe0e6, turbidity: 4,
    sky: 0xa8dcf0, ground: 0x7cc46a, path: 0xd8b27a, particles: "leaves",
    intro: [
      "Il y a plus de 16 000 ans, les îles du Japon sont habitées par des chasseurs, des pêcheurs et des cueilleurs.",
      "On appelle cette très longue période « Jōmon ». Explore le village et découvre comment vivaient ses habitants."
    ],
    pois: [
      { type: "pitHouse", x: -20, z: 30, title: "Maison-fosse (tateana)", text: [
        "Les gens de l'époque Jōmon vivent dans des maisons-fosses : on creuse le sol, on plante des poteaux et on couvre le tout d'un grand toit de chaume.",
        "Au centre, un foyer réchauffe la famille. Certains villages sont immenses, comme Sannai-Maruyama, au nord du pays, habité pendant plus de 1 500 ans."
      ]},
      { type: "pottery", x: 18, z: 50, title: "Poteries Jōmon", text: [
        "« Jōmon » veut dire « marque de corde » : les potiers décorent l'argile en y roulant des cordelettes.",
        "Ce sont parmi les plus anciennes poteries du monde : certains fragments ont environ 16 000 ans ! Les vases « en flammes », plus tardifs, portent de grandes crêtes décoratives."
      ]},
      { type: "dogu", x: -18, z: 78, title: "Les dogū", text: [
        "Les dogū sont des figurines d'argile aux formes étonnantes. Les plus célèbres ont de grands yeux qui ressemblent à des lunettes de neige.",
        "Personne ne sait exactement à quoi elles servaient : peut-être à des rites pour la santé, la naissance ou les récoltes."
      ]},
      { type: "shellMound", x: 20, z: 100, title: "Amas de coquillages (kaizuka)", text: [
        "Près des côtes, les habitants jettent leurs coquillages au même endroit pendant des siècles. Ces tas, les kaizuka, sont de vrais trésors pour les archéologues.",
        "En 1877, l'Américain Edward Morse fouille l'amas d'Ōmori, près de Tokyo : c'est le début de l'archéologie moderne au Japon."
      ]}
    ],
    npcs: [
      { name: "Ama, la potière", x: 6, z: 44, look: { robe: 0xc1440e, accent: 0xf4a261, hat: "band" }, lines: [
        "Regarde mes mains pleines d'argile ! Je roule une cordelette tressée sur le pot encore mou : ça dessine de jolis motifs.",
        "Ensuite, on cuit les pots dans un feu de bois, en plein air. Ils servent à cuire les glands, les châtaignes et les coquillages."
      ]},
      { name: "Taku, le pêcheur", x: -6, z: 90, look: { robe: 0x6d8b74, accent: 0x264653, hat: "band" }, lines: [
        "La mer et les rivières nous donnent tout : poissons, coquillages, algues… En forêt, on chasse le cerf et le sanglier avec des arcs.",
        "Nous ne cultivons presque rien : la nature est généreuse, alors nous restons au même endroit très longtemps."
      ]}
    ],
    decor: { pine: 40, maple: 14, rock: 14, flower: 20 },
    quiz: { q: "Que signifie le mot « Jōmon » ?", options: ["Marque de corde", "Pays du soleil levant", "Grande forêt"], answer: 0,
      explain: "Exact ! Les potiers décoraient l'argile en y imprimant des cordelettes." }
  },

  // ───────────────────────────── 1. YAYOI & KOFUN
  {
    name: "Yayoi et Kofun",
    dates: "vers 300 av. J.-C. – 538 apr. J.-C.",
    sun: [14, 115], fog: 0xf3d9b8, turbidity: 8,
    sky: 0xffd6a5, ground: 0x9ccc65, path: 0xe0bf8e, particles: "pollen",
    intro: [
      "Vers 300 av. J.-C., des gens venus du continent apportent la culture du riz dans des champs inondés, et le travail du bronze et du fer.",
      "Des villages s'agrandissent, des chefs deviennent puissants… et se font enterrer dans d'immenses tombeaux : les kofun."
    ],
    pois: [
      { type: "riceField", x: 18, z: 28, title: "Rizières inondées", text: [
        "À l'époque Yayoi, on cultive le riz dans des champs remplis d'eau, une technique venue de Corée et de Chine.",
        "Le riz se conserve longtemps : on peut en faire des réserves. Mais il faut aussi les défendre, et des villages se protègent avec des fossés et des palissades."
      ]},
      { type: "granary", x: -16, z: 40, title: "Grenier sur pilotis", text: [
        "Le riz est stocké dans des greniers posés sur de hauts pilotis, pour le protéger de l'humidité et des souris.",
        "Des disques de bois sur les poteaux empêchent les rongeurs de grimper. On en voit des reconstitutions au grand site de Yoshinogari, sur l'île de Kyūshū."
      ]},
      { type: "kofun", x: 28, z: 80, title: "Kofun en trou de serrure", text: [
        "À partir du IIIe siècle, les puissants sont enterrés dans des tertres géants, les kofun. Les plus grands ont la forme d'un trou de serrure, entouré de douves.",
        "Le plus grand, le kofun de Daisen à Sakai, près d'Osaka, mesure environ 486 mètres de long ! Il est inscrit au patrimoine mondial de l'UNESCO depuis 2019."
      ]},
      { type: "haniwa", x: -18, z: 96, title: "Les haniwa", text: [
        "Autour des kofun, on place des centaines de haniwa : des figurines d'argile cuite en forme de guerriers, de chevaux, de maisons ou de danseurs.",
        "Elles gardent symboliquement le tombeau et nous montrent comment s'habillaient et vivaient les gens de cette époque."
      ]}
    ],
    npcs: [
      { name: "Kenji, le riziculteur", x: 6, z: 30, look: { robe: 0xe9c46a, accent: 0x6a4c2a, hat: "straw" }, lines: [
        "Repiquer le riz, c'est un travail d'équipe ! Tout le village plante les jeunes pousses une à une dans l'eau.",
        "Avec nos nouveaux outils en fer, on défriche plus vite. Le riz deviendra si important qu'on paiera même les impôts en riz pendant des siècles."
      ]},
      { name: "Himiko, reine du Yamatai", x: -6, z: 66, look: { robe: 0xf8f9fa, accent: 0xd62828, hat: "crown" }, lines: [
        "Je suis Himiko, reine-prêtresse du pays de Yamatai. Je communique avec les esprits pour guider mon peuple.",
        "Les chroniques chinoises parlent de moi : en 239, j'ai envoyé une ambassade à la cour chinoise des Wei, qui m'a offert des miroirs de bronze."
      ]}
    ],
    decor: { pine: 24, bamboo: 14, rock: 8, flower: 30 },
    quiz: { q: "Quelle forme ont les plus grands kofun ?", options: ["Une pyramide à degrés", "Un trou de serrure", "Une étoile"], answer: 1,
      explain: "Bravo ! Une partie ronde et une partie carrée : vu du ciel, un trou de serrure." }
  },

  // ───────────────────────────── 2. ASUKA & NARA
  {
    name: "Asuka et Nara",
    dates: "538 – 794",
    sun: [48, 210], fog: 0xd6e6f2, turbidity: 4,
    sky: 0xbde0fe, ground: 0x86cf8a, path: 0xe8d2ae, particles: "sakura",
    intro: [
      "Au VIe siècle, le bouddhisme arrive du royaume coréen de Baekje. Le Japon s'inspire de la Chine : écriture, lois, administration.",
      "En 710, la cour s'installe à Nara, une capitale dessinée en damier comme Chang'an, la capitale chinoise des Tang."
    ],
    pois: [
      { type: "pagoda", x: -18, z: 26, title: "Pagode du Hōryū-ji", text: [
        "Le temple Hōryū-ji a été fondé vers 607 par le prince Shōtoku. Sa pagode à cinq étages abrite des reliques du Bouddha.",
        "Ses bâtiments comptent parmi les plus anciennes constructions en bois du monde : plus de 1 300 ans !"
      ]},
      { type: "suzakumon", x: 18, z: 50, title: "Porte Suzaku de Heijō-kyō", text: [
        "Nara s'appelait alors Heijō-kyō. Sa grande porte rouge, la Suzaku-mon, ouvrait sur l'avenue principale qui menait au palais impérial.",
        "La porte a été reconstruite en 1998 à l'emplacement d'origine, d'après les fouilles archéologiques."
      ]},
      { type: "deer", x: -16, z: 80, title: "Les cerfs de Nara", text: [
        "Selon la légende, un dieu est arrivé à Nara sur un cerf blanc. Depuis, les cerfs sont considérés comme les messagers des dieux du sanctuaire Kasuga.",
        "Aujourd'hui encore, plus d'un millier de cerfs se promènent librement dans le parc de Nara… et saluent parfois les visiteurs !"
      ]},
      { type: "todaiji", x: 30, z: 94, title: "Le Tōdai-ji et son Grand Bouddha", text: [
        "L'empereur Shōmu fait construire le Tōdai-ji. Son Grand Bouddha de bronze, haut d'environ 15 mètres, est inauguré en 752.",
        "Le bâtiment actuel date de 1709 : c'est l'un des plus grands édifices en bois du monde, et pourtant il est plus petit que l'original !"
      ]}
    ],
    npcs: [
      { name: "Prince Shōtoku", x: -6, z: 40, look: { robe: 0x6a4c93, accent: 0xffd166, hat: "eboshi" }, lines: [
        "Je suis Shōtoku, régent du pays. J'ai protégé le bouddhisme et fait construire de nombreux temples.",
        "En 604, j'ai écrit une « Constitution en 17 articles ». Le premier dit que l'harmonie, le « wa », est la chose la plus précieuse."
      ]},
      { name: "Ō no Yasumaro, le scribe", x: 6, z: 66, look: { robe: 0x2a9d8f, accent: 0xe9f5db, hat: "eboshi" }, lines: [
        "Nous écrivons avec les caractères chinois, les kanji, même si notre langue est très différente du chinois.",
        "En 712, j'ai achevé le Kojiki, la plus ancienne chronique du Japon : elle raconte les mythes des dieux et l'histoire des premiers empereurs."
      ]}
    ],
    decor: { sakura: 22, pine: 14, lantern: 8, flower: 16 },
    quiz: { q: "Quelle religion arrive au Japon depuis le continent au VIe siècle ?", options: ["Le shintoïsme", "Le christianisme", "Le bouddhisme"], answer: 2,
      explain: "Oui ! Le shintoïsme, lui, est la religion propre au Japon, déjà là avant." }
  },

  // ───────────────────────────── 3. HEIAN
  {
    name: "Heian",
    dates: "794 – 1185",
    sun: [22, 250], fog: 0xf6dce4, turbidity: 7,
    sky: 0xffc8dd, ground: 0xa8dba8, path: 0xf4e4c6, particles: "sakura",
    intro: [
      "En 794, l'empereur Kanmu fonde une nouvelle capitale : Heian-kyō, l'actuelle Kyoto. Elle restera la capitale impériale pendant plus de mille ans.",
      "À la cour, on se passionne pour la poésie, la musique, la calligraphie et les beaux kimonos superposés."
    ],
    pois: [
      { type: "heianPalace", x: -22, z: 30, title: "Le palais de Heian-kyō", text: [
        "Le palais impérial se trouve au nord de la ville. Devant la grande salle des cérémonies poussent un cerisier et un mandarinier : on les y voit encore aujourd'hui.",
        "Le vrai pouvoir appartient souvent à la puissante famille Fujiwara, qui marie ses filles aux empereurs."
      ]},
      { type: "kanaDesk", x: 16, z: 46, title: "La naissance des kana", text: [
        "À l'époque Heian apparaissent les kana : les hiragana et les katakana. Ce sont des signes simplifiés à partir des kanji, qui notent des sons.",
        "Les hiragana sont très utilisés par les femmes de la cour, qui écrivent des journaux, des poèmes et des romans devenus célèbres."
      ]},
      { type: "byodoin", x: 24, z: 92, title: "Le pavillon du Phénix (Byōdō-in)", text: [
        "À Uji, près de Kyoto, le Byōdō-in est construit en 1053. Avec ses deux ailes au-dessus de l'étang, il ressemble à un oiseau qui se pose.",
        "Deux phénix dorés ornent son toit. Ce pavillon figure sur la pièce japonaise de 10 yens !"
      ]}
    ],
    npcs: [
      { name: "Murasaki Shikibu", x: -6, z: 56, look: { robe: 0x9d4edd, accent: 0xffafcc, hat: "longhair" }, lines: [
        "Je suis dame de compagnie de l'impératrice. J'ai écrit le Dit du Genji, l'histoire du prince Genji et de ses amours.",
        "Écrit au début du XIe siècle, il est souvent considéré comme l'un des premiers romans de l'histoire du monde."
      ]},
      { name: "Sei Shōnagon", x: 6, z: 74, look: { robe: 0xf77f00, accent: 0xfcbf49, hat: "longhair" }, lines: [
        "Moi, j'écris mes Notes de chevet : des listes de choses charmantes, agaçantes ou émouvantes de la vie à la cour.",
        "Par exemple, j'adore l'aube au printemps, quand le ciel blanchit doucement au-dessus des montagnes…"
      ]},
      { name: "Jeune guerrier Minamoto", x: -6, z: 112, look: { robe: 0x1d3557, accent: 0xe63946, hat: "kabuto" }, lines: [
        "Pendant que la cour écrit des poèmes, les familles de guerriers deviennent puissantes : les Taira et nous, les Minamoto.",
        "De 1180 à 1185, la guerre de Genpei nous oppose. Nous l'emportons à la bataille navale de Dan-no-ura. L'âge des samouraïs commence !"
      ]}
    ],
    decor: { sakura: 36, pine: 8, lantern: 8, flower: 24 },
    quiz: { q: "Qui a écrit le Dit du Genji ?", options: ["Himiko", "Murasaki Shikibu", "Hokusai"], answer: 1,
      explain: "Parfait ! Une dame de la cour de Heian, au début du XIe siècle." }
  },

  // ───────────────────────────── 4. KAMAKURA & MUROMACHI
  {
    name: "Kamakura et Muromachi",
    dates: "1185 – 1573",
    sun: [28, 160], fog: 0xdcd6e8, turbidity: 6,
    sky: 0xd5c3e8, ground: 0x8fc08f, path: 0xd8c8a0, particles: "momiji",
    intro: [
      "Les guerriers prennent le pouvoir. Le shogun, chef militaire, gouverne depuis Kamakura, tandis que l'empereur reste à Kyoto.",
      "Au XIVe siècle, les shoguns Ashikaga s'installent à Kyoto, dans le quartier de Muromachi. Le bouddhisme zen inspire jardins, thé et peinture."
    ],
    pois: [
      { type: "kamakuraBuddha", x: -20, z: 28, title: "Le Grand Bouddha de Kamakura", text: [
        "Cette statue de bronze d'environ 11 mètres représente le Bouddha Amida. Elle est terminée vers le milieu du XIIIe siècle.",
        "Elle était abritée dans un grand bâtiment, emporté à la fin du XVe siècle. Depuis, le Bouddha médite en plein air !"
      ]},
      { type: "mongolWreck", x: 20, z: 48, title: "Les invasions mongoles", text: [
        "En 1274 et 1281, l'empereur mongol Kubilaï Khan envoie d'énormes flottes contre le Japon. Les samouraïs bâtissent un mur de pierre le long de la baie de Hakata.",
        "Les deux fois, des tempêtes détruisent une grande partie des navires. Les Japonais les appellent « kamikaze », le vent divin."
      ]},
      { type: "kinkakuji", x: -24, z: 84, title: "Le Pavillon d'or (Kinkaku-ji)", text: [
        "Le shogun Ashikaga Yoshimitsu fait bâtir ce pavillon couvert de feuilles d'or à la fin du XIVe siècle, à Kyoto. Il devient ensuite un temple zen.",
        "Incendié en 1950, il a été reconstruit à l'identique en 1955. Il se reflète dans l'étang comme dans un miroir."
      ]},
      { type: "zenGarden", x: 20, z: 100, title: "Le jardin zen", text: [
        "Le bouddhisme zen, arrivé de Chine, enseigne la méditation. Ses moines créent des jardins secs : du gravier ratissé et quelques rochers.",
        "Au Ryōan-ji de Kyoto, le jardin compte 15 pierres… mais d'où que tu regardes, tu ne peux jamais les voir toutes en même temps !"
      ]}
    ],
    npcs: [
      { name: "Minamoto no Yoritomo", x: 6, z: 32, look: { robe: 0x3a5a40, accent: 0xdda15e, hat: "eboshi" }, lines: [
        "Après la victoire sur les Taira, j'ai installé mon gouvernement de guerriers, le bakufu, à Kamakura.",
        "En 1192, l'empereur m'a nommé shogun. Pendant près de 700 ans, des shoguns gouverneront le pays au nom de l'empereur."
      ]},
      { name: "Moine zen", x: -6, z: 104, look: { robe: 0x2b2d42, accent: 0xf2cc8f, hat: "bald" }, lines: [
        "Assieds-toi, respire et observe… Le zen cherche le calme de l'esprit dans les gestes simples.",
        "Même le thé devient un art : plus tard, le maître Sen no Rikyū perfectionnera la cérémonie du thé, faite de simplicité et de respect."
      ]}
    ],
    decor: { maple: 30, pine: 14, bamboo: 14, rock: 10 },
    quiz: { q: "Comment s'appelle le chef militaire qui gouverne au nom de l'empereur ?", options: ["Le shogun", "Le daimyō", "Le ninja"], answer: 0,
      explain: "Exactement ! Les daimyō, eux, sont les seigneurs des provinces." }
  },

  // ───────────────────────────── 5. SENGOKU & AZUCHI-MOMOYAMA
  {
    name: "Sengoku et Azuchi-Momoyama",
    dates: "1467 – 1603",
    sun: [6, 262], fog: 0xf4c3a0, turbidity: 10,
    sky: 0xffbfa3, ground: 0xb7c96f, path: 0xd0ae80, particles: "momiji",
    intro: [
      "Après la guerre d'Ōnin (1467–1477), le pouvoir du shogun s'effondre. Les seigneurs, les daimyō, se battent entre eux : c'est le Sengoku, l'époque des provinces en guerre.",
      "Trois grands chefs vont réunifier le pays, l'un après l'autre. Va à leur rencontre !"
    ],
    pois: [
      { type: "nanbanShip", x: 24, z: 28, title: "Les « barbares du Sud »", text: [
        "En 1543, des marchands portugais débarquent sur l'île de Tanegashima avec des arquebuses. Les forgerons japonais apprennent très vite à les copier.",
        "En 1549, le missionnaire François Xavier arrive à son tour. Les Japonais appellent ces Européens les « Nanban », les barbares du Sud."
      ]},
      { type: "castleHimeji", x: -26, z: 70, title: "Le château de Himeji", text: [
        "Les seigneurs construisent des châteaux impressionnants sur de hauts murs de pierre. Le plus beau qui reste est celui de Himeji.",
        "On le surnomme le « Héron blanc » à cause de ses murs blancs. Sa forme actuelle date du début du XVIIe siècle, et il est inscrit à l'UNESCO depuis 1993."
      ]},
      { type: "sekigahara", x: 20, z: 100, title: "Le champ de Sekigahara", text: [
        "En octobre 1600, près de 160 000 guerriers s'affrontent à Sekigahara. Les bannières, les nobori, permettent de reconnaître chaque armée.",
        "Tokugawa Ieyasu remporte la bataille. Trois ans plus tard, il devient shogun."
      ]}
    ],
    npcs: [
      { name: "Oda Nobunaga", x: -6, z: 36, look: { robe: 0x212529, accent: 0xe63946, hat: "kabuto" }, lines: [
        "Je suis Oda Nobunaga. J'ai commencé à unifier le pays par la force, et j'ai su utiliser les arquebuses mieux que personne, comme à la bataille de Nagashino en 1575.",
        "Mais en 1582, trahi par l'un de mes généraux, je meurs au temple Honnō-ji, à Kyoto."
      ]},
      { name: "Toyotomi Hideyoshi", x: 6, z: 64, look: { robe: 0xffb703, accent: 0x8338ec, hat: "kabuto" }, lines: [
        "Moi, je suis né fils de paysan… et je suis devenu le maître du Japon ! J'ai achevé l'unification en 1590.",
        "J'ai fait construire le grand château d'Osaka et organisé de somptueuses cérémonies du thé."
      ]},
      { name: "Tokugawa Ieyasu", x: -6, z: 108, look: { robe: 0x023e8a, accent: 0xffd166, hat: "kabuto" }, lines: [
        "Je suis Tokugawa Ieyasu. J'ai été patient… très patient. Après ma victoire à Sekigahara, je suis nommé shogun en 1603.",
        "Ma famille gouvernera le Japon pendant plus de 250 ans depuis Edo, une petite ville qui deviendra Tokyo."
      ]}
    ],
    decor: { pine: 26, maple: 12, rock: 10, flower: 12 },
    quiz: { q: "Quelle bataille de 1600 ouvre la voie au pouvoir des Tokugawa ?", options: ["Dan-no-ura", "Nagashino", "Sekigahara"], answer: 2,
      explain: "Bien joué ! Ieyasu devient shogun trois ans plus tard, en 1603." }
  },

  // ───────────────────────────── 6. EDO
  {
    name: "Edo",
    dates: "1603 – 1868",
    sun: [30, 190], fog: 0xe6eef2, turbidity: 3,
    sky: 0xa0e7f5, ground: 0x9ed8b4, path: 0xefdcae, particles: "snow",
    intro: [
      "Le shogun Tokugawa gouverne depuis Edo. Le pays connaît plus de 250 ans de paix.",
      "Le Japon se ferme presque totalement aux étrangers : c'est le « sakoku ». Pendant ce temps, les villes, le commerce et les arts populaires s'épanouissent."
    ],
    pois: [
      { type: "nihonbashi", x: 20, z: 26, title: "Le pont Nihonbashi", text: [
        "Le pont Nihonbashi, construit en 1603, est le point de départ des cinq grandes routes du pays, comme le Tōkaidō qui relie Edo à Kyoto.",
        "Aujourd'hui encore, les distances routières du Japon se mesurent à partir de ce pont !"
      ]},
      { type: "ukiyoeStall", x: -16, z: 46, title: "Les estampes ukiyo-e", text: [
        "Les ukiyo-e sont des estampes gravées sur bois et imprimées en couleurs : acteurs, paysages, belles dames…",
        "Vers 1830, Hokusai publie ses « Trente-six vues du mont Fuji ». Regarde au loin : le mont Fuji, le plus haut sommet du Japon (3 776 m), domine le paysage."
      ]},
      { type: "kabuki", x: 22, z: 72, title: "Le théâtre kabuki", text: [
        "Le kabuki naît au début du XVIIe siècle. Les acteurs portent des maquillages spectaculaires et des costumes magnifiques.",
        "Le rideau à rayures noires, kaki et vertes annonce le spectacle. Le kabuki est inscrit au patrimoine immatériel de l'UNESCO."
      ]},
      { type: "blackShip", x: -24, z: 104, title: "Les « navires noirs »", text: [
        "En 1853, le commodore américain Matthew Perry arrive près d'Edo avec des navires à vapeur noirs, armés de canons. Il exige que le Japon s'ouvre au commerce.",
        "En 1854, le traité de Kanagawa met fin à plus de deux siècles d'isolement. Le pouvoir des shoguns commence à vaciller."
      ]}
    ],
    npcs: [
      { name: "Ochiyo, marchande d'Edo", x: -6, z: 30, look: { robe: 0xe76f51, accent: 0x2a9d8f, hat: "bun" }, lines: [
        "Bienvenue à Edo ! Au XVIIIe siècle, notre ville compte environ un million d'habitants : l'une des plus grandes du monde !",
        "On y mange des sushis et du soba vendus dans des échoppes de rue. C'est le fast-food de l'époque !"
      ]},
      { name: "Matsuo Bashō", x: 6, z: 56, look: { robe: 0x8d99ae, accent: 0x2b2d42, hat: "straw" }, lines: [
        "Je suis Bashō, poète voyageur. Je marche sur les routes du pays et j'écris des haïkus, de très courts poèmes de 5, 7 et 5 syllabes.",
        "Mon plus célèbre parle d'une grenouille qui saute dans un vieil étang… et du petit bruit de l'eau. Un instant, et tout est dit !"
      ]},
      { name: "Interprète de Nagasaki", x: 6, z: 100, look: { robe: 0x264653, accent: 0xe9c46a, hat: "topknot" }, lines: [
        "Pendant le sakoku, seuls les Hollandais et les Chinois peuvent commercer, à Nagasaki. Les Hollandais vivent sur une petite île artificielle : Dejima.",
        "Grâce à eux, des savants japonais étudient la médecine et les sciences occidentales : on appelle ça le « rangaku », les études hollandaises."
      ]}
    ],
    decor: { pine: 20, machiya: 14, lantern: 10, fuji: 1 },
    quiz: { q: "Qui arrive avec les « navires noirs » en 1853 ?", options: ["Marco Polo", "Le commodore Perry", "François Xavier"], answer: 1,
      explain: "Exact ! L'Américain Matthew Perry oblige le Japon à s'ouvrir." }
  },

  // ───────────────────────────── 7. MEIJI → SHŌWA
  {
    name: "Meiji, Taishō et Shōwa",
    dates: "1868 – 1989",
    sun: [38, 220], fog: 0xe8e4e0, turbidity: 5,
    sky: 0xffe5ec, ground: 0xa3c48a, path: 0x9aa5b8, particles: "sakura",
    intro: [
      "En 1868, le dernier shogun rend le pouvoir : c'est la restauration de Meiji. Edo est rebaptisée Tokyo, la « capitale de l'Est ».",
      "Le Japon se modernise à toute vitesse. Dans les années 1930, le Japon militariste envahit une partie de l'Asie ; la guerre se termine en 1945, dans les ruines. Puis vient une reconstruction spectaculaire."
    ],
    pois: [
      { type: "train", x: 20, z: 24, title: "Le premier train", text: [
        "En 1872, la première ligne de chemin de fer du Japon relie Shimbashi, à Tokyo, au port de Yokohama, avec l'aide d'ingénieurs britanniques.",
        "Le pays construit en quelques décennies usines, écoles, armée moderne et réseau ferré. Le Japon veut rattraper l'Occident."
      ]},
      { type: "brick", x: -22, z: 44, title: "La gare de Tokyo", text: [
        "Les bâtiments de brique à l'occidentale se multiplient. La gare de Tokyo, inaugurée en 1914, en est un célèbre exemple.",
        "En 1889, le Japon adopte sa première Constitution, inspirée de celle de la Prusse. En 1923, le grand séisme du Kantō détruit une grande partie de Tokyo et de Yokohama."
      ]},
      { type: "genbaku", x: 22, z: 72, title: "Le Dôme de Genbaku (Hiroshima)", text: [
        "Le 6 août 1945, une bombe atomique détruit Hiroshima ; le 9 août, une autre frappe Nagasaki. Des dizaines de milliers de personnes meurent sur le coup, et bien plus dans les mois qui suivent.",
        "Ce bâtiment en ruine a été conservé tel quel. Inscrit à l'UNESCO en 1996, il rappelle au monde entier l'importance de la paix."
      ]},
      { type: "tokyoTower", x: -22, z: 92, title: "La tour de Tokyo", text: [
        "Après la guerre, le Japon se reconstruit très vite. En 1958, la tour de Tokyo, haute de 333 mètres, devient le symbole de ce renouveau.",
        "Sa couleur orange et blanche respecte les règles de sécurité aérienne. Elle sert d'antenne pour la télévision."
      ]},
      { type: "shinkansen", x: 22, z: 116, title: "Le Shinkansen", text: [
        "En 1964, juste avant les Jeux olympiques de Tokyo, le premier Shinkansen relie Tokyo à Osaka à plus de 200 km/h. C'est le premier train à grande vitesse du monde !",
        "On le surnomme le « train-obus » à cause de son nez arrondi."
      ]}
    ],
    npcs: [
      { name: "Tomoe, étudiante de Meiji", x: -6, z: 30, look: { robe: 0x7b2cbf, accent: 0xc77dff, hat: "ribbon" }, lines: [
        "Depuis 1872, l'école est obligatoire pour tous les enfants, garçons et filles ! On y apprend même l'anglais.",
        "Les samouraïs ont perdu leurs privilèges : depuis 1876, ils n'ont plus le droit de porter le sabre en public."
      ]},
      { name: "Guide du Mémorial", x: 6, z: 76, look: { robe: 0x457b9d, accent: 0xf1faee, hat: "hair" }, lines: [
        "Les survivants de la bombe, les hibakusha, ont témoigné toute leur vie pour qu'une telle catastrophe ne se reproduise jamais.",
        "Chaque année, des enfants du monde entier envoient des guirlandes de grues en papier, symbole de paix, au parc du Mémorial."
      ]},
      { name: "Hiroshi, ouvrier", x: -6, z: 106, look: { robe: 0x3a86ff, accent: 0xffbe0b, hat: "cap" }, lines: [
        "Dans les années 1950 à 1980, on parle du « miracle économique » japonais : voitures, télévisions, appareils photo… le monde entier les achète !",
        "En 1968, le Japon devient la deuxième économie du monde. On travaille dur, mais la vie change vite."
      ]}
    ],
    decor: { sakura: 16, lamp: 12, house: 10 },
    quiz: { q: "En quelle année le premier Shinkansen a-t-il été inauguré ?", options: ["1872", "1964", "2012"], answer: 1,
      explain: "Oui ! Juste avant les Jeux olympiques de Tokyo de 1964." }
  },

  // ───────────────────────────── 8. HEISEI & REIWA
  {
    name: "Heisei et Reiwa",
    dates: "1989 – aujourd'hui",
    sun: [-6, 200], fog: 0x1b1640, turbidity: 2,
    sky: 0x2b1660, ground: 0x4b4f6e, path: 0x2a2a40, particles: "neon", night: true,
    intro: [
      "En 1989 commence l'ère Heisei, « l'accomplissement de la paix ». Le 1er mai 2019, l'empereur Naruhito monte sur le trône : c'est l'ère Reiwa.",
      "Bienvenue dans le Japon d'aujourd'hui, entre gratte-ciel lumineux, technologie, traditions et culture pop !"
    ],
    pois: [
      { type: "skytree", x: -24, z: 30, title: "Tokyo Skytree", text: [
        "Inaugurée en 2012, la Tokyo Skytree mesure 634 mètres : c'est la plus haute tour du monde.",
        "634 se lit « mu-sa-shi » en japonais, comme Musashi, l'ancien nom de la région de Tokyo. Un joli jeu de mots !"
      ]},
      { type: "shibuya", x: 22, z: 54, title: "Le carrefour de Shibuya", text: [
        "À Shibuya, à Tokyo, des milliers de piétons traversent en même temps dans toutes les directions quand les feux passent au vert.",
        "La région de Tokyo est la plus grande agglomération du monde, avec environ 37 millions d'habitants. Tu peux marcher sur le passage piéton !"
      ]},
      { type: "gameCenter", x: -20, z: 82, title: "Manga, anime et jeux vidéo", text: [
        "Les mangas, les dessins animés (anime) et les jeux vidéo japonais sont connus dans le monde entier depuis les années 1980 et 1990.",
        "Dans les « game centers », on joue aux machines d'arcade et aux attrape-peluches. La culture pop est devenue un trésor national !"
      ]},
      { type: "memorial2011", x: 20, z: 102, title: "Le 11 mars 2011", text: [
        "Le 11 mars 2011, un séisme de magnitude 9 frappe le nord-est du Japon, suivi d'un immense tsunami. Il provoque aussi l'accident de la centrale nucléaire de Fukushima.",
        "À Rikuzentakata, un seul pin a résisté au tsunami parmi des dizaines de milliers d'arbres. On l'appelle le « pin miraculeux », symbole d'espoir et de reconstruction."
      ]}
    ],
    npcs: [
      { name: "Yui, lycéenne de Tokyo", x: 6, z: 34, look: { robe: 0x1d3557, accent: 0xff4d6d, hat: "ponytail" }, lines: [
        "Salut ! Au lycée, on porte l'uniforme et après les cours, on participe aux clubs : musique, kendo, manga…",
        "Les Jeux olympiques de Tokyo 2020 ont eu lieu en 2021 à cause de la pandémie de Covid-19, et l'Expo universelle s'est tenue à Osaka en 2025."
      ]},
      { name: "Pepo, robot d'accueil", x: -6, z: 66, look: { robe: 0xe0e1dd, accent: 0x00b4d8, hat: "robot" }, lines: [
        "BIP BOUP. Bonjour, voyageur ! Le Japon est célèbre pour ses robots, ses trains ponctuels à la seconde près et ses toilettes très perfectionnées.",
        "Mais le pays vieillit : près d'un Japonais sur trois a plus de 65 ans. Les robots aident parfois dans les maisons de retraite. BIP !"
      ]},
      { name: "Grand-mère Hana", x: 6, z: 106, look: { robe: 0xb5838d, accent: 0xffcdb2, hat: "bun" }, lines: [
        "Même au milieu des gratte-ciel, nous gardons nos traditions : on visite les sanctuaires au Nouvel An et on admire les cerisiers en fleurs au printemps, le hanami.",
        "Tu as traversé toute notre histoire, petit pèlerin. N'oublie pas : le chemin compte autant que la destination."
      ]}
    ],
    decor: { skyscraper: 18, lamp: 14, sakura: 6 },
    quiz: { q: "Quel nom porte l'ère actuelle, commencée en 2019 ?", options: ["Heisei", "Meiji", "Reiwa"], answer: 2,
      explain: "Bravo ! Reiwa, « belle harmonie ». Tu as terminé le voyage !" }
  }
];
