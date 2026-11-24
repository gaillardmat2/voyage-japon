// Contenu du jeu : 9 époques, 24 lieux emblématiques.
// Carte d'un lieu : x et z de -78 à 78. Le joueur arrive en (0, 60) et regarde vers -z.
// Étapes de quête : talk (parler), visit (découvrir un lieu, index dans pois), collect (ramasser), game (mini-jeu avec un PNJ).

const L = (robe, accent, hat, skin) => ({ robe, accent, hat, skin });

export const KIKO_TUTORIAL = [
  "Bienvenue, {name} ! Je suis Kiko, renard messager du sanctuaire d'Inari.",
  "Ensemble, nous allons parcourir le « michi », le chemin de l'histoire du Japon : plus de 16 000 ans, de ville en ville.",
  "Pour marcher : ZQSD (ou WASD) ou les flèches, Maj pour courir. Sur écran tactile : le joystick en bas à gauche. Glisse sur l'écran pour tourner la caméra.",
  "Les personnages avec une bulle « ! » ont une quête pour toi. Le cadre en haut à droite te rappelle ton objectif, et une colonne de lumière dorée t'indique où aller.",
  "Chaque lieu cache aussi 5 objets anciens. Les losanges dorés signalent des monuments à découvrir. Appuie sur E (ou le gros bouton) pour interagir.",
  "Termine la quête principale d'un lieu pour ouvrir le suivant. Le panneau « Relais du voyageur » ouvre la carte du Japon pour voyager. Allons-y !"
];

export const ERAS = [
// ═══════════════════════════════════════════ 0. JŌMON
{
  name: "Jōmon", dates: "vers 14 000 – 300 av. J.-C.",
  quiz: { q: "Que signifie le mot « Jōmon » ?", options: ["Marque de corde", "Pays du soleil levant", "Grande forêt"], answer: 0, explain: "Exact ! Les potiers décoraient l'argile en y imprimant des cordelettes." },
  places: [
  {
    id: "sannai", name: "Sannai-Maruyama", region: "Aomori, nord de Honshū", lat: 40.81, lon: 140.70,
    terrain: "forest", ground: 0x6fae5a, sun: [38, 200], fog: 0xcfe0e6, particles: "leaves",
    intro: ["Nous voici à Sannai-Maruyama, l'un des plus grands villages Jōmon connus, habité pendant environ 1 500 ans, il y a 5 900 à 4 200 ans.", "Ici, on vit de chasse, de pêche et de cueillette. Le chef du village, l'ancien Oki, a sûrement besoin d'aide !"],
    pois: [
      { type: "jomonTower", x: -32, z: -18, title: "La tour aux six piliers", text: ["En 1994, les archéologues découvrent ici six énormes trous de poteaux, avec des restes de troncs de châtaignier d'environ un mètre de diamètre.", "On a reconstruit une grande structure de près de 15 mètres. Tour de guet, monument religieux ? Personne ne le sait vraiment !"] },
      { type: "pitHouse", x: 26, z: 14, title: "Les maisons-fosses", text: ["Les maisons-fosses sont creusées dans le sol et couvertes d'un toit de chaume ou d'écorce. Au centre, un foyer réchauffe la famille.", "Plus de 700 habitations ont été retrouvées à Sannai-Maruyama : le village a été occupé très longtemps."] },
      { type: "longHouse", x: 30, z: -42, title: "La grande maison longue", text: ["Certains bâtiments mesurent jusqu'à 32 mètres de long ! C'étaient peut-être des lieux de réunion, d'ateliers ou d'abri pour l'hiver.", "Les hivers sont rudes dans le nord : la neige recouvre la forêt pendant des mois."] },
      { type: "pottery", x: -26, z: 26, title: "Poteries cordées", text: ["« Jōmon » veut dire « marque de corde » : les potiers décorent l'argile en y roulant des cordelettes tressées.", "Ce sont parmi les plus anciennes poteries du monde : certains fragments trouvés au Japon ont environ 16 000 ans."] }
    ],
    npcs: [
      { id: "oki", name: "L'ancien Oki", x: -6, z: 40, look: L(0x8d6e63, 0xe9c46a, "band"), lines: ["Les châtaigniers autour du village nous nourrissent. Nos ancêtres ont appris à les entretenir, presque comme un verger.", "La forêt est généreuse, mais il faut la respecter."] },
      { id: "ama", name: "Ama, la potière", x: 14, z: 28, look: L(0xc1440e, 0xf4a261, "band"), lines: ["Nous n'avons pas de tour de potier : on monte les pots avec de longs boudins d'argile, les colombins, posés les uns sur les autres.", "Ensuite on les cuit dans un feu de bois, en plein air."] },
      { id: "yuna", name: "Petite Yuna", x: -14, z: 4, look: L(0xf4a261, 0x2a9d8f, "band"), lines: ["Tu as vu mon collier ? Les perles vertes viennent de très loin, d'une rivière au bord de la mer du Japon !", "Les marchands les échangent contre nos objets."] }
    ],
    items: { name: "Fragment de dogū", icon: "🏺" },
    game: { id: "coils", npc: "ama" },
    quests: [
      { id: "q-sannai", main: true, title: "La fête des châtaignes", giver: "oki",
        intro: ["Ah, un voyageur ! L'automne arrive et nous préparons la fête des châtaignes.", "Va ramasser 6 châtaignes sous les grands arbres, à l'ouest du village, puis apporte-les à Ama, la potière."],
        steps: [
          { t: "collect", what: "Châtaigne", icon: "🌰", n: 6, near: [-40, 0], r: 22 },
          { t: "game", npc: "ama", say: ["Magnifiques châtaignes ! Il nous faut un grand pot pour les cuire.", "Aide-moi à monter le pot : empile les colombins bien droits !"] },
          { t: "visit", poi: 0, say: ["Oki voulait que tu voies la tour aux six piliers : c'est d'en haut qu'on annonce la fête !"] },
          { t: "talk", npc: "oki", say: ["Le pot est prêt et la fête peut commencer. Merci, voyageur !", "Va maintenant vers la mer, à la baie d'Ōmori : les pêcheurs t'y attendent."] }
        ] },
      { id: "q-jade", title: "Les perles de jade", giver: "yuna",
        intro: ["Oh non ! Le fil de mon collier s'est cassé dans les hautes herbes, au sud-est.", "Tu peux retrouver mes 3 perles de jade ?"],
        steps: [
          { t: "collect", what: "Perle de jade", icon: "🟢", n: 3, near: [36, 36], r: 16 },
          { t: "talk", npc: "yuna", say: ["Merci ! Ce jade vient d'Itoigawa, à des centaines de kilomètres d'ici. Il a voyagé de village en village par échange !"] }
        ] }
    ],
    decor: { pine: 40, maple: 18, chestnut: 16, rock: 14, flower: 30 }
  },
  {
    id: "omori", name: "Baie d'Ōmori", region: "Tokyo actuel", lat: 35.59, lon: 139.73,
    terrain: "coast", ground: 0x7cba62, sun: [30, 140], fog: 0xd8eaf0, particles: "leaves",
    intro: ["La baie d'Ōmori, au bord de la mer. Les habitants y pêchent et ramassent des coquillages depuis des siècles.", "Taku le pêcheur organise un grand festin. Allons le voir !"],
    pois: [
      { type: "shellMound", x: -22, z: -4, title: "L'amas de coquillages", text: ["Pendant des siècles, les habitants jettent leurs coquillages au même endroit. Ces tas, les kaizuka, sont des trésors pour les archéologues.", "En 1877, l'Américain Edward Morse fouille l'amas d'Ōmori : c'est le début de l'archéologie moderne au Japon."] },
      { type: "canoe", x: 30, z: 18, title: "La pirogue monoxyle", text: ["Les pirogues Jōmon sont creusées dans un seul tronc d'arbre. On en a retrouvé dans de nombreux sites.", "Grâce à elles, on transporte de l'obsidienne de l'île de Kōzu-shima jusqu'à Honshū, à plus de 50 km en pleine mer !"] },
      { type: "trapPit", x: -36, z: -44, title: "Les fosses-pièges", text: ["Pour chasser le cerf et le sanglier, les chasseurs Jōmon creusent des fosses profondes sur les sentiers des animaux.", "On a retrouvé des centaines de ces fosses alignées dans certaines collines."] }
    ],
    npcs: [
      { id: "taku", name: "Taku, le pêcheur", x: 8, z: 36, look: L(0x6d8b74, 0x264653, "band"), lines: ["La mer nous donne tout : poissons, coquillages, algues… On pêche au harpon, au filet et à l'hameçon en os.", "Les dauphins et les phoques s'approchent parfois de la côte."] },
      { id: "mina", name: "Mina, la ramasseuse", x: 22, z: -18, look: L(0x2a9d8f, 0xffd166, "band"), lines: ["À marée basse, on ramasse des palourdes et des huîtres. On en fait même sécher pour l'hiver.", "Les coquillages servent aussi à faire des bracelets !"] },
      { id: "kuro", name: "Kuro, le chasseur", x: -20, z: -30, look: L(0x5d4037, 0xd4a373, "band"), lines: ["Avec mon arc et mes flèches à pointe d'obsidienne, je chasse dans les collines.", "Mon chien m'aide à suivre les traces : les Jōmon ont déjà des chiens de chasse !"] }
    ],
    items: { name: "Hameçon en os", icon: "🦴" },
    game: { id: "fishing", npc: "taku" },
    quests: [
      { id: "q-omori", main: true, title: "Le festin de la mer", giver: "taku",
        intro: ["Bienvenue ! Le village prépare un festin pour la fin de l'été.", "Prends ce harpon et montre-moi ce que tu sais faire !"],
        steps: [
          { t: "game", npc: "taku", say: ["Vise bien les poissons quand ils passent près de la surface !"] },
          { t: "collect", what: "Palourde", icon: "🐚", n: 5, near: [30, -10], r: 14 },
          { t: "visit", poi: 0, say: ["Les coquilles vides vont rejoindre l'amas, comme le font les villageois depuis des siècles."] },
          { t: "talk", npc: "taku", say: ["Quel festin ! Tu es digne de notre village.", "Le gardien du torii, sur la colline, a une question pour toi avant de te laisser passer à l'époque suivante."] }
        ] },
      { id: "q-obsidienne", title: "La pierre noire de l'île", giver: "kuro",
        intro: ["Mes pointes de flèches sont cassées. Une pirogue a rapporté de l'obsidienne, mais la cargaison est tombée sur la plage.", "Rapporte-moi 3 éclats d'obsidienne !"],
        steps: [
          { t: "collect", what: "Éclat d'obsidienne", icon: "⬛", n: 3, near: [28, 30], r: 10 },
          { t: "talk", npc: "kuro", say: ["Parfait ! L'obsidienne est un verre volcanique : une fois taillée, elle coupe comme un rasoir."] }
        ] }
    ],
    decor: { pine: 26, maple: 10, rock: 16, flower: 16 }, gate: true
  }
  ]
},

// ═══════════════════════════════════════════ 1. YAYOI & KOFUN
{
  name: "Yayoi et Kofun", dates: "vers 300 av. J.-C. – 538 apr. J.-C.",
  quiz: { q: "Quelle forme ont les plus grands kofun ?", options: ["Une pyramide à degrés", "Un trou de serrure", "Une étoile"], answer: 1, explain: "Bravo ! Une partie ronde et une partie carrée : vu du ciel, un trou de serrure." },
  places: [
  {
    id: "yoshinogari", name: "Yoshinogari", region: "Saga, Kyūshū", lat: 33.32, lon: 130.38,
    terrain: "paddies", ground: 0x9ccc65, sun: [16, 115], fog: 0xf3d9b8, turbidity: 8, particles: "pollen",
    intro: ["Yoshinogari, sur l'île de Kyūshū : un grand village entouré de fossés et de palissades, avec ses tours de guet.", "La culture du riz est arrivée du continent. Kenji le riziculteur prépare les semailles."],
    pois: [
      { type: "watchtower", x: -30, z: -10, title: "Tours de guet et palissades", text: ["Le riz se conserve et se stocke : il attire les convoitises. Les villages Yayoi se protègent par des fossés, des palissades et des tours.", "Yoshinogari était entouré d'un double fossé de plusieurs kilomètres."] },
      { type: "granary", x: 28, z: -20, title: "Greniers sur pilotis", text: ["Le riz est conservé dans des greniers sur pilotis, à l'abri de l'humidité.", "Des disques de bois sur les poteaux empêchent les souris de grimper."] },
      { type: "dotaku", x: -24, z: 24, title: "La cloche dōtaku", text: ["Les dōtaku sont des cloches de bronze décorées de scènes de chasse et de vie quotidienne.", "Elles servaient sans doute dans des rites pour de bonnes récoltes, plutôt que pour sonner."] },
      { type: "riceField", x: 26, z: 26, title: "Les rizières inondées", text: ["On cultive le riz dans des champs remplis d'eau, une technique venue de Corée et de Chine.", "Le riz deviendra si important qu'on paiera même les impôts en riz pendant des siècles."] }
    ],
    npcs: [
      { id: "kenji", name: "Kenji, le riziculteur", x: 8, z: 38, look: L(0xe9c46a, 0x6a4c2a, "straw"), lines: ["Repiquer le riz, c'est un travail d'équipe : tout le village plante les jeunes pousses une à une.", "Nos outils en fer viennent du continent."] },
      { id: "himiko", name: "Himiko, reine du Yamatai", x: -8, z: -30, look: L(0xf8f9fa, 0xd62828, "crown"), lines: ["Je suis Himiko, reine-prêtresse du pays de Wa. Les chroniques chinoises racontent qu'en 239, j'ai envoyé une ambassade à la cour des Wei.", "Où se trouvait mon royaume, le Yamatai ? Ici à Kyūshū, ou près de Nara ? Les historiens en débattent encore !"] },
      { id: "tetsu", name: "Tetsu, le bronzier", x: 18, z: 0, look: L(0x495057, 0xe76f51, "band"), lines: ["Je fonds le bronze pour faire des miroirs, des épées et des cloches.", "Les miroirs de bronze sont des objets précieux, signes de pouvoir."] }
    ],
    items: { name: "Magatama", icon: "🟢" },
    game: { id: "riceplant", npc: "kenji" },
    quests: [
      { id: "q-yoshi", main: true, title: "Les semailles", giver: "kenji",
        intro: ["Le printemps est là ! Il faut repiquer les jeunes plants de riz dans les rizières.", "Viens m'aider, il faut planter en rythme et bien en ligne !"],
        steps: [
          { t: "game", npc: "kenji", say: ["Plante chaque pousse quand le repère passe sur la ligne !"] },
          { t: "collect", what: "Botte de riz", icon: "🌾", n: 5, near: [30, 22], r: 14, say: [] },
          { t: "visit", poi: 1, say: ["Les bottes de riz sont rangées dans le grenier."] },
          { t: "talk", npc: "himiko", say: ["Tu as bien travaillé pour le village. Les esprits nous accorderont une bonne récolte.", "Rends-toi maintenant à Mozu, près de l'actuelle Osaka : on y construit le tombeau d'un grand roi."] }
        ] },
      { id: "q-miroir", title: "Le miroir de la reine", giver: "tetsu",
        intro: ["J'ai poli un miroir de bronze pour la reine Himiko, mais je dois surveiller ma fonderie.", "Peux-tu le lui apporter ?"],
        steps: [{ t: "talk", npc: "himiko", say: ["Un miroir de bronze ! Il reflète la lumière du soleil… Merci, voyageur.", "Les Wei m'avaient offert cent miroirs comme celui-ci."] }] }
    ],
    decor: { pine: 18, bamboo: 14, rock: 8, flower: 30 }
  },
  {
    id: "mozu", name: "Mozu", region: "Sakai, près d'Osaka", lat: 34.56, lon: 135.49,
    terrain: "plain", ground: 0x8fc46a, sun: [44, 200], fog: 0xe3ead6, particles: "pollen",
    intro: ["À Mozu, on bâtit des tombeaux immenses pour les grands rois : les kofun.", "Le chef de chantier Goro manque de bras. Allons l'aider !"],
    pois: [
      { type: "kofun", x: 22, z: -26, title: "Le kofun de Daisen", text: ["Le kofun de Daisen, attribué à l'empereur Nintoku, mesure environ 486 mètres de long : c'est l'un des plus grands tombeaux du monde.", "Avec les autres kofun de Mozu et de Furuichi, il est inscrit au patrimoine mondial de l'UNESCO depuis 2019."] },
      { type: "haniwa", x: -26, z: -6, title: "Les haniwa", text: ["Autour des kofun, on place des centaines de figurines d'argile cuite : guerriers, chevaux, maisons, danseurs.", "Elles nous montrent comment s'habillaient et vivaient les gens de l'époque."] },
      { type: "kiln", x: -30, z: 30, title: "Le four des potiers", text: ["Les haniwa sont cuits en grand nombre. Les potiers du clan Haji en sont les spécialistes.", "Au Ve siècle, une nouvelle poterie grise et très dure, le sue, arrive de Corée avec ses fours en pente."] }
    ],
    npcs: [
      { id: "goro", name: "Goro, chef de chantier", x: 6, z: 36, look: L(0xa47148, 0xf4a261, "band"), lines: ["Des milliers de travailleurs déplacent la terre panier par panier pour élever le tertre.", "Il faudra des années pour finir le tombeau du roi."] },
      { id: "haji", name: "Maître Haji", x: -18, z: 18, look: L(0xe07a3a, 0x3b1f0e, "band"), lines: ["Selon une légende, mon ancêtre Haji no Sukune aurait proposé de remplacer les sacrifices humains par des figurines d'argile.", "C'est une légende… mais les haniwa sont bien nés dans notre clan de potiers !"] },
      { id: "kaya", name: "Kaya, venue de Kaya", x: 16, z: 6, look: L(0x2a9d8f, 0xe9c46a, "bun"), lines: ["Je viens de la confédération de Kaya, dans le sud de la Corée. Mon peuple apporte le fer et de nouvelles techniques.", "Beaucoup d'artisans du continent s'installent au Japon à cette époque."] }
    ],
    items: { name: "Fragment de haniwa", icon: "🧱" },
    game: { id: "kiln", npc: "haji" },
    quests: [
      { id: "q-mozu", main: true, title: "Le tombeau du grand roi", giver: "goro",
        intro: ["Il nous manque de la terre pour le tertre ! Rapporte 6 paniers de terre depuis la carrière, au nord-ouest.", "Puis va voir Maître Haji : il nous faut des haniwa."],
        steps: [
          { t: "collect", what: "Panier de terre", icon: "🧺", n: 6, near: [-44, -40], r: 16 },
          { t: "game", npc: "haji", say: ["Il faut cuire ces haniwa. Garde le feu à la bonne température : ni trop froid, ni trop chaud !"] },
          { t: "visit", poi: 0, say: ["Les haniwa sont alignés sur le tertre. Quel spectacle !"] },
          { t: "talk", npc: "goro", say: ["Le roi reposera en paix grâce à toi. Le gardien du torii t'attend pour la suite du voyage."] }
        ] },
      { id: "q-fer", title: "Le fer du continent", giver: "kaya",
        intro: ["Mes lingots de fer sont tombés de la charrette sur le chemin du sud. Tu m'aides à en retrouver 3 ?"],
        steps: [
          { t: "collect", what: "Lingot de fer", icon: "🔩", n: 3, near: [36, 40], r: 14 },
          { t: "talk", npc: "kaya", say: ["Merci ! Avec ce fer, on fera des outils, des armes et des armures."] }
        ] }
    ],
    decor: { pine: 24, rock: 8, flower: 26, bamboo: 8 }, gate: true
  }
  ]
},

// ═══════════════════════════════════════════ 2. ASUKA & NARA
{
  name: "Asuka et Nara", dates: "538 – 794",
  quiz: { q: "Quelle religion arrive au Japon depuis le continent au VIe siècle ?", options: ["Le shintoïsme", "Le christianisme", "Le bouddhisme"], answer: 2, explain: "Oui ! Le shintoïsme, lui, est la religion propre au Japon, déjà là avant." },
  places: [
  {
    id: "ikaruga", name: "Ikaruga", region: "Nara", lat: 34.61, lon: 135.73,
    terrain: "plain", ground: 0x86cf8a, sun: [46, 210], fog: 0xd6e6f2, particles: "sakura",
    intro: ["Ikaruga, au VIIe siècle. Le bouddhisme, arrivé du royaume coréen de Baekje, s'installe au Japon.", "Le prince Shōtoku fait construire ici un temple qui existe encore : le Hōryū-ji."],
    pois: [
      { type: "pagoda", x: -24, z: -14, title: "La pagode du Hōryū-ji", text: ["Le Hōryū-ji est fondé vers 607 par le prince Shōtoku. Sa pagode à cinq étages abrite des reliques du Bouddha.", "Ses bâtiments comptent parmi les plus anciennes constructions en bois du monde."] },
      { type: "templeHall", x: 18, z: -22, title: "Le Kondō, pavillon d'or", text: ["Le Kondō, la « salle d'or », abrite les statues les plus sacrées du temple.", "Il a été reconstruit après un incendie à la fin du VIIe siècle, et se dresse depuis plus de 1 300 ans."] },
      { type: "yumedono", x: 28, z: 18, title: "Le Yumedono, pavillon des rêves", text: ["Ce pavillon octogonal a été construit au VIIIe siècle sur l'emplacement du palais du prince Shōtoku.", "La légende raconte qu'un être divin venait y aider le prince à comprendre les textes bouddhiques."] }
    ],
    npcs: [
      { id: "shotoku", name: "Prince Shōtoku", x: -6, z: 34, look: L(0x6a4c93, 0xffd166, "eboshi"), lines: ["En 604, j'ai écrit une « Constitution en 17 articles ». Le premier dit que l'harmonie, le « wa », est la chose la plus précieuse.", "J'ai aussi envoyé des ambassades en Chine pour apprendre."] },
      { id: "daiku", name: "Le charpentier Kongō", x: 10, z: -2, look: L(0xb08055, 0x6d4c41, "band"), lines: ["Ma famille est venue de Baekje pour construire des temples. Notre entreprise, la Kongō Gumi, fondée en 578, existera pendant plus de 1 400 ans !", "Nos assemblages en bois tiennent sans un seul clou."] },
      { id: "moine", name: "Moine Ekan", x: -20, z: 10, look: L(0xe76f51, 0xffd166, "bald"), lines: ["Les sūtras sont écrits en caractères chinois. Nous les recopions à la main, pinceau après pinceau.", "Recopier un sūtra est une prière en soi."] }
    ],
    items: { name: "Tuile ancienne", icon: "🧱" },
    game: { id: "calligraphy", npc: "moine" },
    quests: [
      { id: "q-ikaruga", main: true, title: "Le temple du prince", giver: "shotoku",
        intro: ["Je veux que le Hōryū-ji soit digne du Bouddha. Va voir la pagode, puis aide le charpentier Kongō.", "Il lui faut du bois de cyprès, le hinoki."],
        steps: [
          { t: "visit", poi: 0 },
          { t: "talk", npc: "daiku", say: ["Le prince t'envoie ? Parfait ! Rapporte-moi 5 poutres de hinoki, empilées dans la forêt à l'est."] },
          { t: "collect", what: "Poutre de hinoki", icon: "🌲", n: 5, near: [46, -30], r: 16 },
          { t: "game", npc: "moine", say: ["Le temple a besoin de sūtras. Recopie ces caractères avec soin, en suivant le sens des traits !"] },
          { t: "talk", npc: "shotoku", say: ["Le temple est magnifique. Le Japon apprend de la Chine et de la Corée, mais il crée aussi son propre style.", "Va maintenant à Nara : l'empereur Shōmu y bâtit un Bouddha géant."] }
        ] },
      { id: "q-tuiles", title: "Les tuiles du toit", giver: "daiku",
        intro: ["Les tuiles du toit de la pagode sont tombées pendant l'orage. Rapporte-m'en 4 !"],
        steps: [
          { t: "collect", what: "Tuile de toit", icon: "🟫", n: 4, near: [-24, -14], r: 14 },
          { t: "talk", npc: "daiku", say: ["Merci ! Les tuiles de terre cuite sont arrivées au Japon avec le bouddhisme."] }
        ] }
    ],
    decor: { sakura: 18, pine: 16, lantern: 8, flower: 18 }
  },
  {
    id: "nara", name: "Nara (Heijō-kyō)", region: "Nara", lat: 34.69, lon: 135.84,
    terrain: "city", ground: 0x8fcf8a, sun: [40, 230], fog: 0xdbe8f2, particles: "sakura",
    intro: ["En 710, la cour s'installe à Heijō-kyō, l'actuelle Nara, une capitale en damier inspirée de Chang'an, la capitale chinoise.", "Le moine Gyōki parcourt la ville pour réunir des dons : l'empereur veut construire un Bouddha géant."],
    pois: [
      { type: "suzakumon", x: 0, z: 10, title: "La porte Suzaku", text: ["La grande porte rouge Suzaku-mon ouvrait sur l'avenue principale menant au palais impérial.", "Elle a été reconstruite en 1998 à son emplacement d'origine."] },
      { type: "todaiji", x: 30, z: -40, title: "Le Tōdai-ji", text: ["L'empereur Shōmu fait construire le Tōdai-ji. Son Grand Bouddha de bronze, haut d'environ 15 mètres, est inauguré en 752.", "Le bâtiment actuel, de 1709, reste l'un des plus grands édifices en bois du monde."] },
      { type: "deer", x: -28, z: -30, title: "Les cerfs de Nara", text: ["Selon la légende, un dieu est arrivé à Nara sur un cerf blanc. Les cerfs sont considérés comme les messagers des dieux du sanctuaire Kasuga.", "Aujourd'hui, plus d'un millier de cerfs se promènent librement dans le parc."] },
      { type: "shosoin", x: -30, z: 24, title: "Le Shōsō-in", text: ["Ce trésor en rondins de bois conserve les objets de l'empereur Shōmu : instruments de musique, miroirs, tissus… venus jusque de Perse par la route de la soie !", "Plus de 9 000 objets y sont toujours conservés."] }
    ],
    npcs: [
      { id: "gyoki", name: "Le moine Gyōki", x: 8, z: 40, look: L(0x8d6e63, 0xffd166, "bald"), lines: ["Je construis des ponts, des canaux et des refuges pour le peuple.", "L'empereur m'a demandé de réunir des dons pour le Grand Bouddha."] },
      { id: "yasumaro", name: "Ō no Yasumaro", x: -12, z: 0, look: L(0x2a9d8f, 0xe9f5db, "eboshi"), lines: ["En 712, j'ai achevé le Kojiki, la plus ancienne chronique du Japon.", "Elle raconte les mythes des dieux et l'histoire des premiers empereurs."] },
      { id: "fondeur", name: "Le fondeur Kuninaka", x: 22, z: -18, look: L(0x6c757d, 0xff7043, "band"), lines: ["Couler un Bouddha de 15 mètres en bronze ! Nous le fondons par morceaux, couche après couche.", "Il faut une énorme quantité de cuivre, d'étain et même d'or pour le dorer."] },
      { id: "shika", name: "Vendeuse de biscuits", x: -18, z: -16, look: L(0xffafcc, 0x8338ec, "bun"), lines: ["Les cerfs adorent les biscuits ! Si tu leur montres un biscuit, certains baissent la tête comme pour saluer.", "Mais attention, ils sont gourmands !"] }
    ],
    items: { name: "Pièce wadōkaichin", icon: "🟡" },
    game: { id: "deer", npc: "shika" },
    quests: [
      { id: "q-nara", main: true, title: "Le Grand Bouddha", giver: "gyoki",
        intro: ["Le peuple tout entier participe au Grand Bouddha. Aide-moi à réunir 6 offrandes de cuivre dans les quartiers de la ville."],
        steps: [
          { t: "collect", what: "Offrande de cuivre", icon: "🟠", n: 6, near: [0, -20], r: 40 },
          { t: "talk", npc: "fondeur", say: ["Du cuivre ! Avec ça, nous pourrons couler la tête du Bouddha."] },
          { t: "visit", poi: 1, say: ["Le Grand Bouddha est inauguré en 752 devant des milliers de moines, dont certains venus d'Inde !"] },
          { t: "talk", npc: "yasumaro", say: ["Je noterai ton aide dans les chroniques !", "Le gardien du torii t'attend : une nouvelle capitale se prépare, Heian-kyō."] }
        ] },
      { id: "q-cerfs", title: "Les cerfs gourmands", giver: "shika",
        intro: ["Tu veux nourrir les cerfs ? Donne le biscuit uniquement quand un cerf salue !"],
        steps: [{ t: "game", npc: "shika", say: ["C'est parti !"] }, { t: "talk", npc: "shika", say: ["Bravo ! Les cerfs de Nara sont protégés comme « trésor naturel national »."] }] }
    ],
    decor: { sakura: 16, pine: 10, lantern: 12 }, gate: true
  }
  ]
},

// ═══════════════════════════════════════════ 3. HEIAN
{
  name: "Heian", dates: "794 – 1185",
  quiz: { q: "Qui a écrit le Dit du Genji ?", options: ["Himiko", "Murasaki Shikibu", "Hokusai"], answer: 1, explain: "Parfait ! Une dame de la cour de Heian, au début du XIe siècle." },
  places: [
  {
    id: "heiankyo", name: "Heian-kyō", region: "Kyoto", lat: 35.01, lon: 135.77,
    terrain: "city", ground: 0xa8dba8, sun: [24, 250], fog: 0xf6dce4, turbidity: 7, particles: "sakura",
    intro: ["En 794, l'empereur Kanmu fonde Heian-kyō, l'actuelle Kyoto. Elle restera la capitale impériale pendant plus de mille ans.", "À la cour, on se passionne pour la poésie, la calligraphie et les kimonos superposés. Dame Murasaki semble bien embêtée…"],
    pois: [
      { type: "heianPalace", x: -26, z: -26, title: "Le palais impérial", text: ["Devant la grande salle des cérémonies poussent un cerisier et un mandarinier : on les y voit encore aujourd'hui.", "Le vrai pouvoir appartient souvent à la famille Fujiwara, qui marie ses filles aux empereurs."] },
      { type: "kanaDesk", x: 24, z: -6, title: "La naissance des kana", text: ["À l'époque Heian apparaissent les hiragana et les katakana, des signes simplifiés à partir des kanji, qui notent des sons.", "Les hiragana sont très utilisés par les femmes de la cour, qui écrivent journaux, poèmes et romans."] },
      { type: "suzakumon", x: 0, z: 14, title: "La porte Rashō-mon", text: ["Au sud de la ville se dresse la grande porte Rashō-mon. À la fin de l'époque Heian, elle tombe en ruine.", "Elle a inspiré de célèbres récits… et le film « Rashōmon » d'Akira Kurosawa en 1950."] }
    ],
    npcs: [
      { id: "murasaki", name: "Murasaki Shikibu", x: -6, z: 36, look: L(0x9d4edd, 0xffafcc, "longhair"), lines: ["Je suis dame de compagnie de l'impératrice Shōshi. J'écris le Dit du Genji, l'histoire du prince Genji.", "Il est souvent considéré comme l'un des premiers romans de l'histoire du monde."] },
      { id: "sei", name: "Sei Shōnagon", x: 14, z: 18, look: L(0xf77f00, 0xfcbf49, "longhair"), lines: ["J'écris mes Notes de chevet : des listes de choses charmantes, agaçantes ou émouvantes.", "J'adore l'aube au printemps, quand le ciel blanchit doucement au-dessus des montagnes."] },
      { id: "michinaga", name: "Fujiwara no Michinaga", x: -16, z: -6, look: L(0x1d3557, 0xffd166, "eboshi"), lines: ["Quatre de mes filles ont épousé des empereurs. Je suis l'homme le plus puissant de la cour !", "J'ai même écrit un poème où je compare mon pouvoir à la pleine lune, sans aucun défaut."] },
      { id: "dame", name: "Dame Akiko", x: 26, z: 30, look: L(0xff8fab, 0x6a4c93, "longhair"), lines: ["Le kai-awase est notre jeu favori : retrouver les deux moitiés d'un même coquillage, peintes du même motif.", "Les deux valves d'un coquillage ne s'emboîtent qu'avec leur moitié : c'est un symbole de fidélité."] }
    ],
    items: { name: "Coquillage peint", icon: "🐚" },
    game: { id: "kaiawase", npc: "dame" },
    quests: [
      { id: "q-heian", main: true, title: "Les pages du Genji", giver: "murasaki",
        intro: ["Quel malheur ! Le vent a emporté 5 pages de mon nouveau chapitre dans les jardins de la ville.", "Tu veux bien les retrouver ? Les dames de la cour attendent la suite avec impatience."],
        steps: [
          { t: "collect", what: "Page du Genji", icon: "📜", n: 5, near: [0, -10], r: 42 },
          { t: "talk", npc: "murasaki", say: ["Toutes mes pages ! Pour te remercier, les dames t'invitent à jouer au kai-awase."] },
          { t: "game", npc: "dame", say: ["Retrouve les paires de coquillages peints !"] },
          { t: "visit", poi: 0 },
          { t: "talk", npc: "michinaga", say: ["Tu as charmé la cour, voyageur. Va donc à Uji : ma famille y possède une villa magnifique."] }
        ] },
      { id: "q-kemari", title: "La balle de kemari", giver: "sei",
        intro: ["Les jeunes nobles jouent au kemari : il faut garder une balle en cuir en l'air, avec les pieds, le plus longtemps possible.", "Montre-nous ton talent !"],
        steps: [{ t: "game", npc: "sei", game: "kemari", say: ["Tape la balle juste avant qu'elle ne touche le sol !"] }, { t: "talk", npc: "sei", say: ["Charmant ! Je l'ajouterai à ma liste des « choses élégantes »."] }] }
    ],
    decor: { sakura: 20, pine: 8, lantern: 10 }
  },
  {
    id: "uji", name: "Uji", region: "au sud de Kyoto", lat: 34.89, lon: 135.81,
    terrain: "river", ground: 0x95cf8f, sun: [30, 200], fog: 0xe0eee6, particles: "sakura",
    intro: ["Uji, au bord de sa rivière. Les dix derniers chapitres du Dit du Genji se déroulent ici !", "Les pêcheurs au cormoran y travaillent la nuit, à la lueur des torches."],
    pois: [
      { type: "byodoin", x: -24, z: -24, title: "Le pavillon du Phénix", text: ["Le Byōdō-in est construit en 1053 par Fujiwara no Yorimichi, le fils de Michinaga. Avec ses deux ailes au-dessus de l'étang, il ressemble à un oiseau qui se pose.", "On le retrouve sur la pièce de 10 yens, et son phénix ornait l'ancien billet de 10 000 yens."] },
      { type: "bridge", x: 0, z: -2, title: "Le pont d'Uji", text: ["Un pont est construit sur la rivière Uji dès le VIIe siècle : c'est l'un des plus anciens ponts du Japon.", "La rivière a vu plusieurs batailles célèbres, dont certaines pendant la guerre de Genpei."] },
      { type: "ukaiBoat", x: 24, z: 30, title: "Les barques de pêche au cormoran", text: ["Dans la pêche au cormoran, l'ukai, des oiseaux plongent pour attraper les poissons, guidés par un maître depuis la barque.", "Une technique très ancienne, encore pratiquée l'été à Uji."] }
    ],
    npcs: [
      { id: "ukaimaster", name: "Maître pêcheur Sōta", x: 10, z: 40, look: L(0x264653, 0xe9c46a, "straw"), lines: ["Mes cormorans sont mes compagnons. Je les guide avec des cordes, à la lueur d'un feu suspendu à la barque.", "La nuit, la rivière s'illumine de flammes."] },
      { id: "yorimichi", name: "Fujiwara no Yorimichi", x: -10, z: 8, look: L(0x6a4c93, 0xffd166, "eboshi"), lines: ["J'ai transformé la villa de mon père en temple, le Byōdō-in.", "Je veux qu'il ressemble au paradis de la Terre pure du Bouddha Amida."] },
      { id: "kaoru", name: "Ukifune, lectrice", x: -30, z: 30, look: L(0xffc8dd, 0x9d4edd, "longhair"), lines: ["Ukifune est le nom d'une héroïne du Genji, et je l'ai pris pour moi : je lis les « chapitres d'Uji » au bord de l'eau.", "Le Genji a même son musée, ici à Uji !"] }
    ],
    items: { name: "Plume de phénix", icon: "✨" },
    game: { id: "ukai", npc: "ukaimaster" },
    quests: [
      { id: "q-uji", main: true, title: "La nuit des cormorans", giver: "ukaimaster",
        intro: ["Un de mes apprentis est malade. Tu veux guider mes cormorans ce soir ?"],
        steps: [
          { t: "game", npc: "ukaimaster", say: ["Envoie le cormoran sur la bonne ligne quand un poisson apparaît !"] },
          { t: "collect", what: "Fleur de lotus", icon: "🌸", n: 4, near: [-24, -10], r: 14, say: [] },
          { t: "talk", npc: "yorimichi", say: ["Des lotus pour l'étang du Phénix ! Le lotus est la fleur du Bouddha.", "Va voir le pavillon : il est magnifique au coucher du soleil."] },
          { t: "visit", poi: 0, say: ["Mais une guerre éclate entre deux clans de guerriers, les Taira et les Minamoto. Rends-toi à Dan-no-ura, au sud-ouest !"] }
        ] },
      { id: "q-genji-uji", title: "Les chapitres d'Uji", giver: "kaoru",
        intro: ["J'ai prêté mes rouleaux du Genji à des promeneurs… Ils les ont laissés près du pont. Tu me rapportes les 3 rouleaux ?"],
        steps: [{ t: "collect", what: "Rouleau du Genji", icon: "📜", n: 3, near: [-6, 14], r: 12 }, { t: "talk", npc: "kaoru", say: ["Merci ! Les rouleaux illustrés du Genji du XIIe siècle sont des trésors nationaux."] }] }
    ],
    decor: { sakura: 16, pine: 14, bamboo: 14, lantern: 6 }
  },
  {
    id: "dannoura", name: "Dan-no-ura", region: "détroit de Shimonoseki", lat: 33.96, lon: 130.96,
    terrain: "coast", ground: 0x7fb069, sun: [12, 250], fog: 0xf0d6c0, turbidity: 9, particles: null,
    intro: ["1185, le détroit de Dan-no-ura. La guerre de Genpei touche à sa fin : la flotte des Minamoto affronte celle des Taira.", "Le jeune général Minamoto no Yoshitsune prépare la bataille."],
    pois: [
      { type: "heikeFleet", x: 46, z: -14, title: "La flotte des Taira", text: ["Les Taira, qui ont dominé la cour, se battent sur mer avec le jeune empereur Antoku, âgé de 6 ans, à bord.", "Le courant du détroit change de sens pendant la bataille et favorise les Minamoto."] },
      { type: "shrine", x: -26, z: -24, title: "Le sanctuaire Akama", text: ["L'empereur Antoku périt dans les flots à la fin de la bataille. Le sanctuaire Akama, au bord du détroit, lui est dédié.", "On y raconte la légende de Hōichi, le joueur de biwa sans oreilles."] },
      { type: "biwaStage", x: -24, z: 26, title: "Le conteur de biwa", text: ["Le Dit des Heike raconte la chute des Taira. Des moines aveugles le récitent en s'accompagnant d'un luth, le biwa.", "Il commence par l'idée que rien ne dure : même les puissants finissent par tomber."] }
    ],
    npcs: [
      { id: "yoshitsune", name: "Minamoto no Yoshitsune", x: 8, z: 36, look: L(0x1d3557, 0xe63946, "kabuto"), lines: ["Je suis Yoshitsune, demi-frère de Yoritomo. Je commande la flotte des Minamoto.", "Mes victoires me rendront célèbre… mais mon frère finira par se méfier de moi."] },
      { id: "yoichi", name: "Nasu no Yoichi", x: 24, z: 10, look: L(0x2b9348, 0xffd166, "kabuto"), lines: ["Peu avant, à Yashima, j'ai touché d'une flèche un éventail posé sur une barque ennemie, qui dansait sur les vagues !", "Les deux armées ont applaudi."] },
      { id: "biwa", name: "Moine conteur", x: -14, z: 18, look: L(0x2b2d42, 0xf2cc8f, "bald"), lines: ["Écoute le son de la cloche du temple de Gion : il dit que tout passe.", "Les guerriers orgueilleux ne durent pas plus qu'un rêve de printemps."] },
      { id: "pecheur-heike", name: "Pêcheur de crabes", x: 26, z: 40, look: L(0x6d8b74, 0x264653, "straw"), lines: ["Regarde ce crabe : sa carapace ressemble à un visage de samouraï en colère !", "On les appelle heikegani, les crabes des Heike. La légende dit que ce sont les guerriers Taira noyés."] }
    ],
    items: { name: "Carapace de heikegani", icon: "🦀" },
    game: { id: "archery", npc: "yoichi" },
    quests: [
      { id: "q-dannoura", main: true, title: "L'éventail sur les vagues", giver: "yoshitsune",
        intro: ["Avant la bataille, je veux tester mes archers. Va voir Nasu no Yoichi : il te montrera son tir sur l'éventail."],
        steps: [
          { t: "game", npc: "yoichi", say: ["Le vent souffle et la barque tangue. Tire quand l'éventail est dans la mire !"] },
          { t: "collect", what: "Flèche perdue", icon: "🏹", n: 5, near: [30, -30], r: 16 },
          { t: "visit", poi: 0 },
          { t: "talk", npc: "yoshitsune", say: ["La victoire est à nous. Mon frère Yoritomo va fonder un gouvernement de guerriers à Kamakura.", "Le gardien du torii t'attend : l'âge des samouraïs commence !"] }
        ] },
      { id: "q-biwa", title: "Le chant des Heike", giver: "biwa",
        intro: ["J'ai perdu les plectres de mon biwa dans les rochers du rivage. Tu peux en retrouver 3 ?"],
        steps: [{ t: "collect", what: "Plectre de biwa", icon: "🎵", n: 3, near: [-30, -4], r: 12 }, { t: "talk", npc: "biwa", say: ["Merci. Je vais pouvoir chanter le destin des Heike, pour qu'on ne les oublie jamais."] }] }
    ],
    decor: { pine: 30, rock: 18, flower: 8 }, gate: true
  }
  ]
},

// ═══════════════════════════════════════════ 4. KAMAKURA & MUROMACHI
{
  name: "Kamakura et Muromachi", dates: "1185 – 1573",
  quiz: { q: "Comment s'appelle le chef militaire qui gouverne au nom de l'empereur ?", options: ["Le shogun", "Le daimyō", "Le ninja"], answer: 0, explain: "Exactement ! Les daimyō, eux, sont les seigneurs des provinces." },
  places: [
  {
    id: "kamakura", name: "Kamakura", region: "Kanagawa", lat: 35.32, lon: 139.55,
    terrain: "coast", ground: 0x8fc08f, sun: [30, 160], fog: 0xdcd6e8, particles: "momiji",
    intro: ["Kamakura, la ville des guerriers, protégée par les collines et la mer. Minamoto no Yoritomo y installe son gouvernement, le bakufu.", "Les samouraïs s'entraînent au tir à l'arc à cheval, le yabusame."],
    pois: [
      { type: "kamakuraBuddha", x: -28, z: -28, title: "Le Grand Bouddha de Kamakura", text: ["Cette statue de bronze d'environ 11 mètres représente le Bouddha Amida, achevée vers le milieu du XIIIe siècle.", "Le bâtiment qui l'abritait a été emporté à la fin du XVe siècle. Depuis, le Bouddha médite en plein air."] },
      { type: "shrine", x: 12, z: -40, title: "Le sanctuaire Tsurugaoka Hachiman-gū", text: ["Ce sanctuaire est dédié à Hachiman, dieu protecteur des guerriers et du clan Minamoto.", "Chaque année, on y organise encore des démonstrations de yabusame."] },
      { type: "yabusameTrack", x: -30, z: 20, title: "La piste de yabusame", text: ["Au galop, l'archer doit toucher trois cibles de bois en lâchant les rênes.", "C'est un entraînement guerrier devenu un rituel religieux."] }
    ],
    npcs: [
      { id: "yoritomo", name: "Minamoto no Yoritomo", x: 6, z: 36, look: L(0x3a5a40, 0xdda15e, "eboshi"), lines: ["En 1192, l'empereur m'a nommé shogun. Je gouverne les guerriers depuis Kamakura.", "Pendant près de 700 ans, des shoguns dirigeront le pays au nom de l'empereur."] },
      { id: "masako", name: "Hōjō Masako", x: -12, z: 8, look: L(0x6d597a, 0xe5989b, "bun"), lines: ["Je suis l'épouse de Yoritomo. Après sa mort, je deviendrai si puissante qu'on m'appellera la « shogun nonne ».", "Ma famille, les Hōjō, dirigera le bakufu comme régents."] },
      { id: "archer", name: "Archer Kumagai", x: -18, z: 34, look: L(0x8d0801, 0xffd166, "kabuto"), lines: ["Pour le yabusame, il faut tenir l'arc, viser et tirer en plein galop, sans les mains sur les rênes !", "Tu veux essayer ?"] }
    ],
    items: { name: "Pièce chinoise des Song", icon: "🟡" },
    game: { id: "yabusame", npc: "archer" },
    quests: [
      { id: "q-kamakura", main: true, title: "Le tournoi de Hachiman", giver: "yoritomo",
        intro: ["Je veux voir si tu as l'étoffe d'un guerrier. Participe au yabusame avec l'archer Kumagai !"],
        steps: [
          { t: "game", npc: "archer", say: ["Touche les cibles au passage du cheval !"] },
          { t: "visit", poi: 1, say: ["On prie Hachiman pour la protection des guerriers."] },
          { t: "collect", what: "Offrande de saké", icon: "🍶", n: 4, near: [20, -20], r: 18 },
          { t: "talk", npc: "masako", say: ["Merci pour ces offrandes. Mais une menace arrive de l'ouest : les Mongols !", "Va à Hakata, sur l'île de Kyūshū, aider les défenseurs."] }
        ] },
      { id: "q-bouddha", title: "Les pièces du Bouddha", giver: "masako",
        intro: ["Le Grand Bouddha a peut-être été fondu avec des pièces de monnaie chinoises, très utilisées chez nous. Rapporte 4 pièces pour l'entretien de la statue."],
        steps: [{ t: "collect", what: "Pièce de bronze", icon: "🟡", n: 4, near: [-30, -10], r: 16 }, { t: "talk", npc: "masako", say: ["Merci ! Au Japon, on utilise beaucoup de pièces importées de Chine à cette époque."] }] }
    ],
    decor: { maple: 26, pine: 18, bamboo: 12, rock: 10 }
  },
  {
    id: "hakata", name: "Baie de Hakata", region: "Fukuoka, Kyūshū", lat: 33.6, lon: 130.4,
    terrain: "coast", ground: 0x88b878, sun: [22, 220], fog: 0xd9e2ea, turbidity: 6, particles: null,
    intro: ["En 1274, l'empereur mongol Kubilaï Khan envoie une flotte contre le Japon, à Hakata. Il recommencera en 1281.", "Les samouraïs construisent un long mur de pierre le long de la plage."],
    pois: [
      { type: "mongolWreck", x: 32, z: -8, title: "Les navires mongols", text: ["Les deux fois, des tempêtes détruisent une grande partie des navires mongols. Les Japonais les appellent « kamikaze », le vent divin.", "Des archéologues étudient encore les épaves au fond de la mer."] },
      { type: "stoneWall", x: 18, z: -36, title: "Le mur de défense", text: ["Après la première invasion, le bakufu fait construire un mur de pierre d'environ 20 km le long de la baie de Hakata.", "Une partie de ce mur, le genkō bōrui, se visite encore aujourd'hui."] },
      { type: "forge", x: -28, z: 20, title: "La forge du sabre", text: ["L'époque Kamakura est l'âge d'or des sabres japonais. Le forgeron plie et martèle l'acier des dizaines de fois.", "La lame est ensuite trempée : son tranchant devient très dur, son dos reste souple."] }
    ],
    npcs: [
      { id: "suenaga", name: "Takezaki Suenaga", x: 6, z: 36, look: L(0x780000, 0xffd166, "kabuto"), lines: ["J'ai combattu les Mongols en 1274 ! J'ai ensuite fait peindre mes exploits sur de grands rouleaux illustrés.", "Grâce à eux, on sait à quoi ressemblaient les combats : les Mongols utilisaient même des bombes explosives !"] },
      { id: "kaji", name: "Le forgeron Masamune", x: -16, z: 28, look: L(0x495057, 0xff7043, "band"), lines: ["Je suis Masamune, et mes sabres seront célèbres pendant des siècles.", "Frappe le métal quand il est rouge vif, pas avant, pas après !"] },
      { id: "moine-hakata", name: "Moine Nichiren", x: -20, z: -12, look: L(0x2b2d42, 0xf2cc8f, "bald"), lines: ["J'avais annoncé qu'une invasion étrangère menacerait le pays…", "Prions ensemble pour que le pays soit protégé."] }
    ],
    items: { name: "Flèche mongole", icon: "🏹" },
    game: { id: "forge", npc: "kaji" },
    quests: [
      { id: "q-hakata", main: true, title: "Défendre la baie", giver: "suenaga",
        intro: ["Les Mongols reviendront ! Il nous faut des pierres pour le mur et de bons sabres.", "Rapporte 6 pierres de la colline au sud, puis va voir le forgeron."],
        steps: [
          { t: "collect", what: "Pierre", icon: "⛰️", n: 6, near: [-36, 44], r: 16 },
          { t: "visit", poi: 1 },
          { t: "game", npc: "kaji", say: ["Forgeons une lame ! Frappe quand le métal est à la bonne couleur."] },
          { t: "talk", npc: "suenaga", say: ["En 1281, la seconde flotte est encore plus grande… mais le mur et le typhon nous protègent.", "Va à Kyoto : le shogun Ashikaga y construit un pavillon d'or."] }
        ] },
      { id: "q-rouleaux", title: "Les rouleaux de Suenaga", giver: "moine-hakata",
        intro: ["Le vent a dispersé les feuilles du peintre de Suenaga sur la plage. Retrouve-en 3."],
        steps: [{ t: "collect", what: "Peinture de bataille", icon: "🖼️", n: 3, near: [24, 20], r: 14 }, { t: "talk", npc: "suenaga", say: ["Mes rouleaux ! Ils montreront aux générations futures ce que nous avons vécu."] }] }
    ],
    decor: { pine: 30, rock: 20, flower: 8 }
  },
  {
    id: "kitayama", name: "Kyoto, Kitayama", region: "Kyoto", lat: 35.04, lon: 135.73,
    terrain: "forest", ground: 0x8fbc8f, sun: [26, 170], fog: 0xe2d6e8, particles: "momiji",
    intro: ["Au XIVe siècle, les shoguns Ashikaga s'installent à Kyoto, dans le quartier de Muromachi.", "Le bouddhisme zen inspire les jardins, la peinture et la cérémonie du thé."],
    pois: [
      { type: "kinkakuji", x: -26, z: -30, title: "Le Pavillon d'or", text: ["Le shogun Ashikaga Yoshimitsu fait bâtir ce pavillon couvert de feuilles d'or à la fin du XIVe siècle. Il devient ensuite un temple zen.", "Incendié en 1950, il a été reconstruit à l'identique en 1955."] },
      { type: "zenGarden", x: 24, z: -20, title: "Le jardin sec du Ryōan-ji", text: ["Les moines zen créent des jardins secs : du gravier ratissé et quelques rochers.", "Au Ryōan-ji, le jardin compte 15 pierres… mais où que tu sois, tu ne peux jamais les voir toutes à la fois !"] },
      { type: "teaHouse", x: 22, z: 24, title: "Le pavillon de thé", text: ["La cérémonie du thé se développe à cette époque. Le maître Murata Jukō prône la simplicité, que Sen no Rikyū perfectionnera.", "On entre dans le pavillon par une petite porte basse : tout le monde doit s'incliner, même les puissants."] }
    ],
    npcs: [
      { id: "yoshimitsu", name: "Ashikaga Yoshimitsu", x: -8, z: 36, look: L(0xffb703, 0x8338ec, "eboshi"), lines: ["Je suis le shogun Yoshimitsu. J'ai repris le commerce avec la Chine des Ming.", "Mon pavillon d'or montre à tous la richesse du shogunat."] },
      { id: "juko", name: "Maître de thé", x: 14, z: 14, look: L(0x606c38, 0xdda15e, "bald"), lines: ["Le thé n'est pas qu'une boisson. Chaque geste compte : purifier, préparer, servir, recevoir. Bientôt, le maître Murata Jukō en fera un art de la simplicité.", "Veux-tu apprendre l'ordre des gestes ?"] },
      { id: "zenmonk", name: "Jeune moine Ikkyū", x: 26, z: -2, look: L(0x2b2d42, 0xf2cc8f, "bald"), lines: ["Je suis Ikkyū, petit moine farceur : on raconte que je joue des tours au shogun lui-même ! Le zen se trouve dans les gestes simples : balayer, ratisser, respirer.", "Ratisser le gravier, c'est déjà méditer."] }
    ],
    items: { name: "Bol à thé ancien", icon: "🍵" },
    game: { id: "tea", npc: "juko" },
    quests: [
      { id: "q-kitayama", main: true, title: "Le thé du shogun", giver: "yoshimitsu",
        intro: ["Je reçois des envoyés de Chine. Il faut leur servir un thé parfait !", "Rapporte 5 feuilles de thé des jardins, puis apprends les gestes auprès du maître de thé."],
        steps: [
          { t: "collect", what: "Feuille de thé", icon: "🍃", n: 5, near: [40, 30], r: 16 },
          { t: "game", npc: "juko", say: ["Dans le bon ordre, chaque geste !"] },
          { t: "visit", poi: 0 },
          { t: "talk", npc: "yoshimitsu", say: ["Un thé digne d'un empereur ! Mais après moi, le pays sombrera dans la guerre…", "Le gardien du torii t'attend : l'époque des provinces en guerre commence."] }
        ] },
      { id: "q-zen", title: "Le râteau d'Ikkyū", giver: "zenmonk",
        intro: ["J'ai perdu mes 3 dents de râteau dans la forêt d'érables. Sans elles, impossible de ratisser le jardin !"],
        steps: [{ t: "collect", what: "Dent de râteau", icon: "🌲", n: 3, near: [-36, 10], r: 14 }, { t: "talk", npc: "zenmonk", say: ["Merci ! Les lignes du gravier représentent l'eau, et les rochers des îles… ou des montagnes."] }] }
    ],
    decor: { maple: 34, pine: 14, bamboo: 16, rock: 10, lantern: 6 }, gate: true
  }
  ]
},

// ═══════════════════════════════════════════ 5. SENGOKU
{
  name: "Sengoku et Azuchi-Momoyama", dates: "1467 – 1603",
  quiz: { q: "Quelle bataille de 1600 ouvre la voie au pouvoir des Tokugawa ?", options: ["Dan-no-ura", "Nagashino", "Sekigahara"], answer: 2, explain: "Bien joué ! Ieyasu devient shogun trois ans plus tard, en 1603." },
  places: [
  {
    id: "tanegashima", name: "Tanegashima", region: "île au sud de Kyūshū", lat: 30.6, lon: 131.0,
    terrain: "coast", ground: 0x8cc06a, sun: [44, 120], fog: 0xd2ecf2, particles: null,
    intro: ["1543, l'île de Tanegashima. Un navire chinois s'échoue avec, à son bord, des marchands portugais… et des arquebuses !", "Le jeune seigneur de l'île, Tanegashima Tokitaka, est fasciné."],
    pois: [
      { type: "nanbanShip", x: 46, z: -6, title: "Le navire des Nanban", text: ["Les Japonais appellent ces Européens les « Nanban », les barbares du Sud, car ils arrivent par le sud.", "Après eux viendront les missionnaires, comme François Xavier en 1549, et un grand commerce avec Macao."] },
      { type: "forge", x: -26, z: -20, title: "La forge d'arquebuses", text: ["Le forgeron Yaita Kinbei réussit à copier l'arquebuse. Le plus difficile : fermer le canon avec une vis !", "En quelques années, le Japon fabrique des dizaines de milliers d'armes à feu."] },
      { type: "beachCross", x: 24, z: 30, title: "La plage de Kadokura", text: ["C'est près d'ici que le navire a touché terre. Un monument rappelle l'arrivée des armes à feu.", "On appelle d'ailleurs longtemps les arquebuses des « tanegashima »."] }
    ],
    npcs: [
      { id: "tokitaka", name: "Tanegashima Tokitaka", x: 6, z: 36, look: L(0x023e8a, 0xffd166, "topknot"), lines: ["J'ai acheté deux arquebuses aux Portugais, pour une fortune !", "Je veux que mes forgerons apprennent à les fabriquer."] },
      { id: "portugais", name: "Fernão, marchand portugais", x: 28, z: 4, look: L(0x6a040f, 0xffffff, "cap", 0xf0c9a8), lines: ["Olá ! Nous venons de Macao. Les Japonais adorent nos objets : lunettes, horloges, tabac…", "Vous aurez bientôt un mot venu du portugais : « pan », le pain !"] },
      { id: "kinbei", name: "Yaita Kinbei", x: -14, z: -2, look: L(0x495057, 0xff7043, "band"), lines: ["Copier cette arme, c'est un vrai casse-tête ! Mais un forgeron portugais m'a montré comment fileter le fond du canon.", "Charger, bourrer, viser, tirer : il faut être patient."] }
    ],
    items: { name: "Balle de plomb", icon: "⚫" },
    game: { id: "arquebus", npc: "kinbei" },
    quests: [
      { id: "q-tane", main: true, title: "Le secret du fer qui tonne", giver: "tokitaka",
        intro: ["Aide mon forgeron Yaita Kinbei à copier l'arquebuse. Il lui manque du charbon de bois et du salpêtre."],
        steps: [
          { t: "collect", what: "Sac de charbon", icon: "⚫", n: 5, near: [-40, 20], r: 16 },
          { t: "talk", npc: "kinbei", say: ["Du charbon ! Le canon est prêt. Il faut maintenant le tester."] },
          { t: "game", npc: "kinbei", say: ["Charge, puis tire sur les cibles. Attention, recharger prend du temps !"] },
          { t: "talk", npc: "tokitaka", say: ["Ces armes vont changer la guerre au Japon. Les grands seigneurs vont vouloir les mêmes…", "Va à Himeji : Toyotomi Hideyoshi y prépare la conquête de l'ouest pour son maître, Oda Nobunaga."] }
        ] },
      { id: "q-pan", title: "Le pain des Nanban", giver: "portugais",
        intro: ["Notre farine est tombée à la mer ! Rapporte 3 sacs de farine échoués sur la plage."],
        steps: [{ t: "collect", what: "Sac de farine", icon: "🌾", n: 3, near: [30, -30], r: 12 }, { t: "talk", npc: "portugais", say: ["Obrigado ! Le mot japonais « pan » vient bien du portugais « pão »."] }] }
    ],
    decor: { pine: 22, rock: 14, bamboo: 10, flower: 10 }
  },
  {
    id: "himeji", name: "Himeji", region: "Hyōgo", lat: 34.84, lon: 134.69,
    terrain: "castle", ground: 0xa9c46a, sun: [36, 210], fog: 0xf0dcc8, particles: "sakura",
    intro: ["Himeji, base de Toyotomi Hideyoshi dans les années 1580. Le château se dresse sur une colline.", "Les maçons empilent d'énormes pierres pour les murailles."],
    pois: [
      { type: "castleHimeji", x: 0, z: -40, title: "Le château du Héron blanc", text: ["On surnomme le château de Himeji le « Héron blanc » à cause de ses murs blancs. Sa forme actuelle date de 1609.", "Il est inscrit au patrimoine mondial de l'UNESCO depuis 1993, l'un des premiers sites japonais."] },
      { type: "okikuWell", x: 28, z: -14, title: "Le puits d'Okiku", text: ["Selon une célèbre histoire de fantômes, une servante nommée Okiku fut jetée dans ce puits après avoir perdu une assiette précieuse.", "La nuit, on l'entendrait compter les assiettes : « une, deux, trois… neuf »."] },
      { type: "castleWall", x: -28, z: -8, title: "La pierre de la vieille femme", text: ["Quand Hideyoshi manquait de pierres, une vieille marchande lui offrit sa meule à grain.", "On peut encore voir cette « pierre de la vieille femme » dans les murailles !"] }
    ],
    npcs: [
      { id: "hideyoshi", name: "Toyotomi Hideyoshi", x: 8, z: 34, look: L(0xffb703, 0x8338ec, "kabuto"), lines: ["Je suis né fils de paysan, et me voici général d'Oda Nobunaga !", "Après la mort de Nobunaga en 1582, j'achèverai l'unification du pays en 1590."] },
      { id: "macon", name: "Maître maçon", x: -16, z: 14, look: L(0x6c757d, 0xe9c46a, "band"), lines: ["Nos murailles sont faites de pierres empilées sans mortier, en pente douce.", "Elles résistent aux tremblements de terre depuis des siècles !"] },
      { id: "messager", name: "Messager de Nobunaga", x: 22, z: 16, look: L(0x212529, 0xe63946, "kabuto"), lines: ["Mon maître Oda Nobunaga unifie le centre du pays. À Nagashino, en 1575, ses arquebusiers ont battu la cavalerie des Takeda.", "Il a aussi fait bâtir le château d'Azuchi, magnifique."] }
    ],
    items: { name: "Blason (mon)", icon: "🔰" },
    game: { id: "stones", npc: "macon" },
    quests: [
      { id: "q-himeji", main: true, title: "La muraille du Héron", giver: "hideyoshi",
        intro: ["Il me faut un château solide. Aide le maître maçon à élever les murailles !"],
        steps: [
          { t: "game", npc: "macon", say: ["Empile les pierres bien droites : une muraille de travers s'effondre !"] },
          { t: "visit", poi: 2 },
          { t: "collect", what: "Tuile au blason", icon: "🔰", n: 5, near: [10, -20], r: 30 },
          { t: "talk", npc: "hideyoshi", say: ["Le château est magnifique ! Mais après ma mort, deux camps vont se disputer le pouvoir.", "Va à Sekigahara : une grande bataille s'y prépare."] }
        ] },
      { id: "q-okiku", title: "Les assiettes d'Okiku", giver: "messager",
        intro: ["On raconte qu'il manque des assiettes près du puits… et qu'un fantôme les cherche ! Retrouve les 3 assiettes, si tu oses."],
        steps: [{ t: "collect", what: "Assiette", icon: "🍽️", n: 3, near: [34, -24], r: 12 }, { t: "talk", npc: "messager", say: ["Brrr… Tu les as trouvées ! Cette histoire a inspiré des pièces de théâtre et même des films d'horreur."] }] }
    ],
    decor: { sakura: 18, pine: 14, machiya: 12, lantern: 6 }
  },
  {
    id: "sekigahara", name: "Sekigahara", region: "Gifu", lat: 35.36, lon: 136.47,
    terrain: "battlefield", ground: 0xa7b86a, sun: [10, 120], fog: 0xd8d8d0, turbidity: 10, particles: null, fogNear: 18, fogFar: 120,
    intro: ["21 octobre 1600, à l'aube. Un épais brouillard recouvre la vallée de Sekigahara.", "Près de 160 000 guerriers vont s'affronter : l'armée de l'Est de Tokugawa Ieyasu contre l'armée de l'Ouest d'Ishida Mitsunari."],
    pois: [
      { type: "sekigahara", x: -22, z: -10, title: "Le camp d'Ieyasu", text: ["Les bannières, les nobori, permettent de reconnaître chaque armée dans le brouillard.", "Les ordres sont transmis par des messagers, des tambours et des conques."] },
      { type: "hillCamp", x: 34, z: -36, title: "Le mont Matsuo", text: ["Sur cette colline, Kobayakawa Hideaki hésite pendant des heures… puis change de camp au milieu de la bataille.", "Sa trahison décide de la victoire d'Ieyasu."] },
      { type: "drumTower", x: 26, z: 24, title: "Les tambours de guerre", text: ["Les grands tambours taiko rythment la marche des troupes et donnent les signaux de combat.", "Chaque rythme a une signification : avancer, reculer, se regrouper."] }
    ],
    npcs: [
      { id: "ieyasu", name: "Tokugawa Ieyasu", x: -6, z: 36, look: L(0x023e8a, 0xffd166, "kabuto"), lines: ["J'ai été patient, très patient. Aujourd'hui, tout se joue.", "Si je gagne, ma famille gouvernera le Japon depuis Edo."] },
      { id: "mitsunari", name: "Ishida Mitsunari", x: 30, z: 0, look: L(0x6a040f, 0xffd166, "kabuto"), lines: ["Je suis fidèle au fils de Hideyoshi. Ieyasu veut le pouvoir pour lui seul !", "Mes alliés tiendront… n'est-ce pas ?"] },
      { id: "taiko", name: "Tambour Gonzō", x: 14, z: 30, look: L(0x8d0801, 0xffd166, "band"), lines: ["Dans le brouillard, on ne voit rien : seuls les tambours transmettent les ordres.", "Écoute bien et répète les signaux !"] }
    ],
    items: { name: "Pointe de lance", icon: "🗡️" },
    game: { id: "taiko", npc: "taiko" },
    quests: [
      { id: "q-seki", main: true, title: "Les signaux dans le brouillard", giver: "ieyasu",
        intro: ["Mes messagers sont perdus dans le brouillard. Ramasse les 5 bannières tombées, puis aide le tambour à transmettre mes ordres."],
        steps: [
          { t: "collect", what: "Bannière nobori", icon: "🚩", n: 5, near: [0, -10], r: 40 },
          { t: "game", npc: "taiko", say: ["Répète exactement les rythmes que je joue !"] },
          { t: "visit", poi: 1, say: ["Kobayakawa change de camp : la bataille bascule !"] },
          { t: "talk", npc: "ieyasu", say: ["La victoire est à nous. En 1603, je deviendrai shogun.", "Le gardien du torii t'ouvrira la porte d'Edo."] }
        ] },
      { id: "q-mitsunari", title: "La lettre de Mitsunari", giver: "mitsunari",
        intro: ["Mes lettres à mes alliés se sont perdues… Retrouve-en 3, vite !"],
        steps: [{ t: "collect", what: "Lettre scellée", icon: "✉️", n: 3, near: [36, 10], r: 14 }, { t: "talk", npc: "mitsunari", say: ["Trop tard… Plusieurs de mes alliés m'ont déjà trahi. Je serai capturé après la bataille."] }] }
    ],
    decor: { pine: 20, rock: 12, flower: 6, banner: 24 }, gate: true
  }
  ]
},

// ═══════════════════════════════════════════ 6. EDO
{
  name: "Edo", dates: "1603 – 1868",
  quiz: { q: "Qui arrive avec les « navires noirs » en 1853 ?", options: ["Marco Polo", "Le commodore Perry", "François Xavier"], answer: 1, explain: "Exact ! L'Américain Matthew Perry oblige le Japon à s'ouvrir." },
  places: [
  {
    id: "edo", name: "Edo", region: "Tokyo", lat: 35.68, lon: 139.77,
    terrain: "city", ground: 0x9ed8b4, sun: [28, 190], fog: 0xe6eef2, particles: "snow", snow: true,
    intro: ["Edo, capitale des shoguns Tokugawa. Au XVIIIe siècle, c'est l'une des plus grandes villes du monde, avec environ un million d'habitants.", "Il neige sur les toits. Au pont Nihonbashi, les marchands s'activent déjà."],
    pois: [
      { type: "nihonbashi", x: 26, z: -10, title: "Le pont Nihonbashi", text: ["Construit en 1603, le pont Nihonbashi est le point de départ des cinq grandes routes du pays, comme le Tōkaidō vers Kyoto.", "Aujourd'hui encore, les distances routières du Japon se mesurent à partir de ce pont."] },
      { type: "kabuki", x: -26, z: -30, title: "Le théâtre kabuki", text: ["Le kabuki naît au début du XVIIe siècle. Les acteurs portent des maquillages spectaculaires.", "Le rideau à rayures noires, kaki et vertes annonce le spectacle. Le kabuki est inscrit au patrimoine immatériel de l'UNESCO."] },
      { type: "fishMarket", x: 30, z: 26, title: "Le marché aux poissons", text: ["Près du pont Nihonbashi se tient le grand marché aux poissons d'Edo, pendant plus de 300 ans.", "Il ne déménagera à Tsukiji qu'en 1935, après le grand séisme de 1923."] },
      { type: "sushiStall", x: -24, z: 18, title: "L'échoppe de sushis", text: ["À Edo, le sushi devient un « fast-food » : on le mange debout, dans des échoppes de rue.", "Le nigiri, une boulette de riz vinaigré avec une tranche de poisson, naît ici au début du XIXe siècle."] }
    ],
    npcs: [
      { id: "ochiyo", name: "Ochiyo, marchande", x: 6, z: 36, look: L(0xe76f51, 0x2a9d8f, "bun"), lines: ["Edo grouille de monde ! Artisans, marchands, samouraïs, acteurs…", "Les incendies sont si fréquents qu'on les appelle « les fleurs d'Edo »."] },
      { id: "danjuro", name: "Ichikawa Danjūrō", x: -14, z: -14, look: L(0xd62828, 0x111111, "topknot"), lines: ["Je suis acteur de kabuki, d'une lignée célèbre. Mon style « aragoto » est plein de force et d'exagération !", "Le public crie mon nom pendant les poses spectaculaires."] },
      { id: "sushiya", name: "Yohei, maître sushi", x: -16, z: 28, look: L(0x1d3557, 0xffffff, "band"), lines: ["On dit que c'est moi, Hanaya Yohei, qui ai rendu le nigiri populaire !", "Les clients sont pressés : il faut servir vite et juste."] },
      { id: "kapitan", name: "Le capitaine hollandais", x: 16, z: 4, look: L(0x1d3557, 0xffd166, "cap", 0xf0c9a8), lines: ["Pendant le sakoku, seuls les Hollandais et les Chinois peuvent commercer, à Nagasaki. Nous vivons sur l'île artificielle de Dejima.", "Chaque année, nous venons rendre hommage au shogun, ici à Edo."] }
    ],
    items: { name: "Netsuke", icon: "🐒" },
    game: { id: "sushi", npc: "sushiya" },
    quests: [
      { id: "q-edo", main: true, title: "Un jour à Edo", giver: "ochiyo",
        intro: ["C'est jour de fête au théâtre ! Mais Yohei, le maître sushi, est débordé.", "Va l'aider, puis apporte des billets de théâtre à Danjūrō."],
        steps: [
          { t: "game", npc: "sushiya", say: ["Sers à chaque client le sushi qu'il demande, vite !"] },
          { t: "collect", what: "Billet de théâtre", icon: "🎫", n: 5, near: [0, -10], r: 40 },
          { t: "talk", npc: "danjuro", say: ["Mes billets ! Le spectacle peut commencer. Merci, mon ami !"] },
          { t: "visit", poi: 0, say: ["Depuis le pont, le Tōkaidō part vers Kyoto. Pourquoi ne pas le suivre jusqu'à Hakone ?"] }
        ] },
      { id: "q-dejima", title: "Les curiosités hollandaises", giver: "kapitan",
        intro: ["Mes cadeaux pour le shogun sont tombés du palanquin : une longue-vue, un globe et une horloge. Tu les retrouves ?"],
        steps: [{ t: "collect", what: "Cadeau hollandais", icon: "🔭", n: 3, near: [20, 0], r: 22 }, { t: "talk", npc: "kapitan", say: ["Merci ! Grâce à nos livres, des savants japonais étudient la médecine occidentale : c'est le « rangaku »."] }] }
    ],
    decor: { pine: 12, machiya: 30, lantern: 14 }
  },
  {
    id: "hakone", name: "Hakone, sur le Tōkaidō", region: "entre Edo et Kyoto", lat: 35.23, lon: 139.02,
    terrain: "mountain", ground: 0x8cc48a, sun: [34, 200], fog: 0xdfeaf2, particles: null, fuji: true,
    intro: ["Le Tōkaidō, la route de la mer de l'Est, relie Edo à Kyoto en 53 relais. À Hakone, le mont Fuji domine le lac Ashi.", "Le peintre Hiroshige parcourt la route pour dessiner ses célèbres estampes."],
    pois: [
      { type: "sekisho", x: -24, z: -20, title: "Le poste de contrôle de Hakone", text: ["Les voyageurs doivent présenter un laissez-passer au sekisho. Les gardes surveillent surtout les armes qui entrent vers Edo…", "…et les femmes qui en sortent, car les familles des seigneurs doivent rester à Edo comme otages."] },
      { type: "ukiyoeStall", x: 24, z: 6, title: "Les estampes ukiyo-e", text: ["Les ukiyo-e sont des estampes gravées sur bois et imprimées en couleurs, une planche par couleur.", "Les « Cinquante-trois relais du Tōkaidō » d'Hiroshige (1833-1834) connaissent un immense succès."] },
      { type: "cedarRoad", x: -4, z: -44, title: "L'allée des cèdres", text: ["Le long de la route, de grands cèdres ont été plantés au XVIIe siècle pour donner de l'ombre aux voyageurs.", "Certains ont aujourd'hui près de 400 ans."] }
    ],
    npcs: [
      { id: "hiroshige", name: "Utagawa Hiroshige", x: 8, z: 36, look: L(0x457b9d, 0xf1faee, "straw"), lines: ["Je dessine les paysages et les voyageurs du Tōkaidō : la pluie, la neige, la brume…", "Mes estampes inspireront plus tard des peintres européens comme Van Gogh et Monet !"] },
      { id: "garde", name: "Garde du sekisho", x: -12, z: -4, look: L(0x212529, 0xffd166, "topknot"), lines: ["Halte ! Ton laissez-passer ?", "Bon, ça ira pour cette fois, pèlerin."] },
      { id: "basho", name: "Matsuo Bashō", x: 26, z: 30, look: L(0x8d99ae, 0x2b2d42, "straw"), lines: ["Je suis Bashō, poète voyageur. J'écris des haïkus, de très courts poèmes de 5, 7 et 5 syllabes.", "Mon plus célèbre parle d'une grenouille qui saute dans un vieil étang, et du petit bruit de l'eau."] }
    ],
    items: { name: "Estampe miniature", icon: "🖼️" },
    game: { id: "ukiyoe", npc: "hiroshige" },
    quests: [
      { id: "q-hakone", main: true, title: "La vue du Fuji", giver: "hiroshige",
        intro: ["Je veux imprimer une vue du Fuji. Rapporte-moi 4 pigments chez les marchands de la route, puis aide-moi à imprimer."],
        steps: [
          { t: "collect", what: "Pigment", icon: "🎨", n: 4, near: [10, -20], r: 30 },
          { t: "game", npc: "hiroshige", say: ["Chaque couleur a sa planche. Pose chaque planche pile sur les repères, le kentō !"] },
          { t: "visit", poi: 0 },
          { t: "talk", npc: "garde", say: ["Ton laissez-passer est en règle. Tu peux continuer.", "On parle de navires étrangers aperçus près d'Uraga… Va voir ce qui se passe !"] }
        ] },
      { id: "q-haiku", title: "Les mots du voyage", giver: "basho",
        intro: ["Le vent a emporté mes 3 tanzaku, ces bandes de papier où j'écris mes haïkus. Tu les retrouves ?"],
        steps: [{ t: "collect", what: "Tanzaku", icon: "📃", n: 3, near: [36, 40], r: 14 }, { t: "talk", npc: "basho", say: ["Merci ! Mon carnet de voyage « La Sente étroite du Bout-du-Monde » raconte mon voyage vers le nord."] }] }
    ],
    decor: { cedar: 30, pine: 18, rock: 12, flower: 10 }
  },
  {
    id: "uraga", name: "Uraga", region: "entrée de la baie d'Edo", lat: 35.24, lon: 139.72,
    terrain: "coast", ground: 0x8fc48a, sun: [20, 120], fog: 0xd6dde6, turbidity: 6, particles: null,
    intro: ["Juillet 1853 : quatre navires noirs, dont deux à vapeur, entrent dans la baie d'Uraga. Le commodore américain Matthew Perry exige que le Japon s'ouvre au commerce.", "Toute la côte est en alerte."],
    pois: [
      { type: "blackShip", x: 50, z: -14, title: "Les « navires noirs »", text: ["Les Japonais n'ont jamais vu de navires à vapeur aussi grands, crachant de la fumée noire.", "En 1854, Perry revient : le traité de Kanagawa met fin à plus de deux siècles d'isolement."] },
      { type: "battery", x: 20, z: -36, title: "La batterie côtière", text: ["Le shogunat construit en urgence des batteries de canons, comme les forts d'Odaiba dans la baie d'Edo.", "Le nom « Odaiba », aujourd'hui un quartier de Tokyo, vient de ces batteries."] },
      { type: "telegraphGift", x: -24, z: 10, title: "Les cadeaux de Perry", text: ["En 1854, Perry offre au shogun un télégraphe et une locomotive miniature sur laquelle on peut monter !", "Les Japonais découvrent ces technologies avec curiosité. Quinze ans plus tard, ils posent leur propre ligne télégraphique."] }
    ],
    npcs: [
      { id: "moriyama", name: "Moriyama Einosuke", x: 6, z: 36, look: L(0x264653, 0xe9c46a, "topknot"), lines: ["Je suis interprète. J'ai appris le hollandais, puis l'anglais avec un marin américain !", "Je traduis les discussions entre le shogunat et les Américains."] },
      { id: "officier", name: "Officier du shogunat", x: -14, z: -14, look: L(0x212529, 0xd62828, "topknot"), lines: ["Que faire ? Les canons de ces navires sont bien plus puissants que les nôtres.", "Le pays est divisé : faut-il ouvrir les ports ou chasser les étrangers ?"] },
      { id: "marin", name: "Marin américain", x: 26, z: 18, look: L(0x1d3557, 0xffffff, "cap", 0xf0c9a8), lines: ["Hello! Nos navires viennent d'Amérique en passant par l'Afrique et l'Asie.", "Nous voulons des ports pour faire escale et nous ravitailler en charbon."] }
    ],
    items: { name: "Bouton de marin", icon: "⚓" },
    game: { id: "telegraph", npc: "moriyama" },
    quests: [
      { id: "q-uraga", main: true, title: "Les lettres du président", giver: "moriyama",
        intro: ["Perry apporte une lettre du président américain. Il faut que je traduise vite !", "Va d'abord observer les navires depuis la côte, puis apporte-moi les documents tombés sur le quai."],
        steps: [
          { t: "visit", poi: 0 },
          { t: "collect", what: "Document", icon: "📄", n: 4, near: [28, 30], r: 14 },
          { t: "visit", poi: 2 },
          { t: "game", npc: "moriyama", say: ["Les Américains nous montrent le télégraphe ! Répète les messages en morse : points courts, traits longs."] },
          { t: "talk", npc: "officier", say: ["Le Japon va s'ouvrir… Quinze ans plus tard, le shogunat tombera.", "Le gardien du torii t'attend : place à l'ère Meiji !"] }
        ] },
      { id: "q-charbon", title: "Du charbon pour les vapeurs", giver: "marin",
        intro: ["Nos chaudières ont faim ! Rapporte 3 sacs de charbon du dépôt au sud."],
        steps: [{ t: "collect", what: "Sac de charbon", icon: "⚫", n: 3, near: [-30, 40], r: 12 }, { t: "talk", npc: "marin", say: ["Thank you! Le traité de 1854 ouvre les ports de Shimoda et Hakodate à nos navires."] }] }
    ],
    decor: { pine: 26, rock: 16, flower: 8 }, gate: true
  }
  ]
},

// ═══════════════════════════════════════════ 7. MEIJI → SHŌWA
{
  name: "Meiji, Taishō et Shōwa", dates: "1868 – 1989",
  quiz: { q: "En quelle année le premier Shinkansen a-t-il été inauguré ?", options: ["1872", "1964", "2012"], answer: 1, explain: "Oui ! Juste avant les Jeux olympiques de Tokyo de 1964." },
  places: [
  {
    id: "yokohama", name: "Yokohama", region: "Kanagawa", lat: 35.44, lon: 139.64,
    terrain: "coast", ground: 0xa3c48a, sun: [36, 220], fog: 0xe8e4e0, particles: "sakura",
    intro: ["1872 : l'ère Meiji. Le Japon se modernise à toute vitesse. Yokohama, port ouvert aux étrangers, est la vitrine de cette modernité.", "Aujourd'hui, on inaugure la première ligne de chemin de fer du pays !"],
    pois: [
      { type: "train", x: 18, z: -16, title: "La première ligne de chemin de fer", text: ["En 1872, la première ligne relie Shimbashi, à Tokyo, à Yokohama, avec l'aide d'ingénieurs britanniques.", "Le trajet d'environ 29 km prend moins d'une heure, au lieu d'une journée à pied."] },
      { type: "brick", x: -26, z: -30, title: "Les bâtiments de brique", text: ["Les bâtiments de brique à l'occidentale se multiplient : banques, douanes, entrepôts.", "Les célèbres entrepôts de brique rouge de Yokohama seront construits au début du XXe siècle."] },
      { type: "gasLamp", x: -20, z: 20, title: "Les premiers becs de gaz", text: ["En 1872, Yokohama est la première ville du Japon éclairée au gaz.", "Des allumeurs passent chaque soir allumer les lampes une à une."] }
    ],
    npcs: [
      { id: "tomoe", name: "Tomoe, étudiante", x: 6, z: 36, look: L(0x7b2cbf, 0xc77dff, "ribbon"), lines: ["Depuis 1872, l'école est obligatoire pour tous les enfants, garçons et filles !", "Les samouraïs ont perdu leurs privilèges : depuis 1876, ils n'ont plus le droit de porter le sabre en public."] },
      { id: "morel", name: "Edmund Morel, ingénieur", x: 22, z: 4, look: L(0x343a40, 0xffffff, "cap", 0xf0c9a8), lines: ["Je suis l'ingénieur britannique chargé du chemin de fer. J'ai conseillé d'utiliser des traverses en bois japonais plutôt qu'importées.", "Le Japon formera vite ses propres ingénieurs."] },
      { id: "allumeur", name: "L'allumeur de réverbères", x: -12, z: 8, look: L(0x1d3557, 0xffbe0b, "cap"), lines: ["Chaque soir, j'allume les becs de gaz de la rue. Les passants s'arrêtent pour admirer la lumière !", "Plus tard, l'électricité les remplacera."] }
    ],
    items: { name: "Ticket de train", icon: "🎫" },
    game: { id: "train", npc: "morel" },
    quests: [
      { id: "q-yokohama", main: true, title: "Le premier train", giver: "tomoe",
        intro: ["Je vais prendre le train pour la première fois ! Mais l'ingénieur Morel cherche un conducteur pour l'essai.", "Va le voir !"],
        steps: [
          { t: "talk", npc: "morel", say: ["Un volontaire ? Avant de conduire, rapporte-moi 4 boulons tombés le long de la voie."] },
          { t: "collect", what: "Boulon", icon: "🔩", n: 4, near: [18, -30], r: 18 },
          { t: "game", npc: "morel", say: ["Accélère, puis freine pour t'arrêter pile devant le quai !"] },
          { t: "talk", npc: "tomoe", say: ["Quel voyage ! Mais le Japon va aussi connaître des guerres terribles au XXe siècle.", "Va à Hiroshima, pour comprendre. Puis à Tokyo en 1964, pour voir la renaissance."] }
        ] },
      { id: "q-lampes", title: "La tournée de l'allumeur", giver: "allumeur",
        intro: ["Le vent a éteint plusieurs lampes ! Va allumer les 4 becs de gaz éteints de la rue."],
        steps: [{ t: "collect", what: "Bec de gaz allumé", icon: "💡", n: 4, near: [-20, 0], r: 26 }, { t: "talk", npc: "allumeur", say: ["Merci ! Yokohama brille comme une ville d'Europe."] }] }
    ],
    decor: { sakura: 14, lamp: 14, house: 14 }
  },
  {
    id: "hiroshima", name: "Hiroshima", region: "Hiroshima", lat: 34.39, lon: 132.45,
    terrain: "river", ground: 0x9cc98a, sun: [40, 200], fog: 0xe6ecef, particles: null,
    intro: ["Dans les années 1930, le Japon militariste envahit une partie de l'Asie. La guerre du Pacifique s'achève en août 1945.", "Le 6 août 1945, une bombe atomique détruit Hiroshima. Aujourd'hui, la ville est un symbole mondial de paix."],
    pois: [
      { type: "genbaku", x: 26, z: -10, title: "Le Dôme de Genbaku", text: ["Le 6 août 1945, une bombe atomique détruit Hiroshima ; le 9 août, une autre frappe Nagasaki. Des dizaines de milliers de personnes meurent sur le coup, et bien plus dans les mois qui suivent.", "Ce bâtiment en ruine a été conservé tel quel. Inscrit à l'UNESCO en 1996, il rappelle l'importance de la paix."] },
      { type: "childrenMonument", x: -22, z: -24, title: "Le Monument de la paix des enfants", text: ["Sadako Sasaki avait 2 ans lors de la bombe. À 12 ans, malade d'une leucémie, elle plie des grues en papier en espérant guérir.", "Après sa mort en 1955, ses camarades font construire ce monument. Des grues en papier y arrivent du monde entier."] },
      { type: "peaceFlame", x: -24, z: 22, title: "La flamme de la paix", text: ["Cette flamme brûle depuis 1964. Elle restera allumée jusqu'à ce que toutes les armes nucléaires aient disparu de la Terre.", "Chaque 6 août, une cérémonie y rassemble des milliers de personnes."] }
    ],
    npcs: [
      { id: "guide", name: "Guide du Mémorial", x: 6, z: 36, look: L(0x457b9d, 0xf1faee, "hair"), lines: ["Les survivants de la bombe, les hibakusha, ont témoigné toute leur vie pour que cela ne se reproduise jamais.", "En 2024, leur association, Nihon Hidankyō, a reçu le prix Nobel de la paix."] },
      { id: "ecoliere", name: "Haruka, écolière", x: -12, z: 0, look: L(0x2a9d8f, 0xff4d6d, "ribbon"), lines: ["Dans mon école, on plie des guirlandes de mille grues en papier : les senbazuru.", "Une légende dit que celui qui en plie mille voit son vœu exaucé."] },
      { id: "jardinier", name: "Jardinier du parc", x: 14, z: 20, look: L(0x606c38, 0xdda15e, "cap"), lines: ["On disait que rien ne pousserait ici pendant 75 ans… Pourtant, des arbres ont survécu et refleuri.", "Ces arbres survivants, les hibakujumoku, sont protégés aujourd'hui."] }
    ],
    items: { name: "Grue en papier", icon: "🕊️" },
    game: { id: "cranes", npc: "ecoliere" },
    quests: [
      { id: "q-hiroshima", main: true, title: "Mille grues pour la paix", giver: "guide",
        intro: ["Bienvenue au parc du Mémorial de la paix. Haruka et sa classe préparent une guirlande de grues pour le monument des enfants.", "Va les aider."],
        steps: [
          { t: "game", npc: "ecoliere", say: ["Plions une grue ensemble : suis les étapes dans le bon ordre."] },
          { t: "collect", what: "Papier de couleur", icon: "🟥", n: 5, near: [0, -40], r: 22 },
          { t: "visit", poi: 1 },
          { t: "visit", poi: 0 },
          { t: "talk", npc: "guide", say: ["Merci d'avoir pris le temps de comprendre. Après la guerre, le Japon renonce à la guerre dans sa Constitution de 1947.", "Va maintenant à Tokyo, en 1964 : le pays reconstruit accueille le monde."] }
        ] },
      { id: "q-arbres", title: "Les arbres survivants", giver: "jardinier",
        intro: ["Je dois vérifier les plaques des arbres survivants. Repère les 3 plaques vertes près de la rivière."],
        steps: [{ t: "collect", what: "Plaque d'arbre survivant", icon: "🌳", n: 3, near: [10, 10], r: 26 }, { t: "talk", npc: "jardinier", say: ["Merci. Ces arbres sont la preuve que la vie revient, même après le pire."] }] }
    ],
    decor: { sakura: 16, pine: 10, lamp: 8, house: 8 }
  },
  {
    id: "tokyo64", name: "Tokyo 1964", region: "Tokyo", lat: 35.68, lon: 139.72,
    terrain: "city", ground: 0xa3c48a, sun: [42, 210], fog: 0xe8e4e0, particles: null,
    intro: ["Octobre 1964 : Tokyo accueille les premiers Jeux olympiques d'Asie. La ville a changé à toute vitesse : autoroutes, métro, tour de Tokyo…", "Et le 1er octobre, le premier Shinkansen a relié Tokyo à Osaka."],
    pois: [
      { type: "tokyoTower", x: -28, z: -26, title: "La tour de Tokyo", text: ["Inaugurée en 1958, la tour de Tokyo mesure 333 mètres. Elle sert d'antenne pour la télévision.", "Sa couleur orange et blanche respecte les règles de sécurité aérienne."] },
      { type: "shinkansen", x: 30, z: -6, title: "Le Shinkansen", text: ["Le premier Shinkansen relie Tokyo à Osaka à plus de 200 km/h : c'est le premier train à grande vitesse du monde.", "On le surnomme le « train-obus » à cause de son nez arrondi."] },
      { type: "yoyogi", x: -20, z: 26, title: "Le gymnase national de Yoyogi", text: ["Construit pour les Jeux de 1964 par l'architecte Kenzō Tange, avec son toit suspendu comme un pont.", "Il a de nouveau accueilli des épreuves lors des Jeux de Tokyo 2020."] }
    ],
    npcs: [
      { id: "hiroshi", name: "Hiroshi, ouvrier", x: 6, z: 36, look: L(0x3a86ff, 0xffbe0b, "cap"), lines: ["On a construit des autoroutes au-dessus des canaux, le métro, les stades… en quelques années seulement !", "C'est le « miracle économique » : en 1968, le Japon devient la deuxième économie du monde."] },
      { id: "athlete", name: "Sakai, porteur de la flamme", x: -10, z: 8, look: L(0xffffff, 0xe63946, "hair"), lines: ["Le dernier porteur de la flamme olympique s'appelait Yoshinori Sakai. Il est né dans la préfecture d'Hiroshima le 6 août 1945, le jour de la bombe.", "Il symbolisait un Japon tourné vers la paix."] },
      { id: "ingenieur", name: "Ingénieure Ono", x: 22, z: 16, look: L(0x1d4ed8, 0xffffff, "hair"), lines: ["Notre Shinkansen n'a jamais causé de mort de passager par déraillement ou collision depuis 1964 !", "Aujourd'hui, il roule à plus de 300 km/h."] }
    ],
    items: { name: "Pin's olympique", icon: "🏅" },
    game: { id: "sprint", npc: "athlete" },
    quests: [
      { id: "q-tokyo64", main: true, title: "Le relais de la flamme", giver: "hiroshi",
        intro: ["La flamme olympique traverse la ville ! Le porteur Sakai cherche quelqu'un pour courir un relais avec lui."],
        steps: [
          { t: "game", npc: "athlete", say: ["Cours ! Alterne les deux touches le plus vite possible."] },
          { t: "collect", what: "Billet pour les Jeux", icon: "🎟️", n: 5, near: [0, -20], r: 40 },
          { t: "visit", poi: 1 },
          { t: "talk", npc: "hiroshi", say: ["Le Japon est devenu une grande puissance économique, et le monde entier le découvre.", "Le gardien du torii t'attend pour la dernière époque : le Japon d'aujourd'hui !"] }
        ] },
      { id: "q-boulons", title: "L'inspection du Shinkansen", giver: "ingenieur",
        intro: ["Avant le départ, il faut vérifier 3 boîtiers sur la voie. Tu m'aides ?"],
        steps: [{ t: "collect", what: "Boîtier vérifié", icon: "✅", n: 3, near: [30, -20], r: 16 }, { t: "talk", npc: "ingenieur", say: ["Parfait. La ponctualité moyenne du Shinkansen se compte en secondes de retard !"] }] }
    ],
    decor: { sakura: 12, lamp: 14, house: 22 }, gate: true
  }
  ]
},

// ═══════════════════════════════════════════ 8. HEISEI & REIWA
{
  name: "Heisei et Reiwa", dates: "1989 – aujourd'hui",
  quiz: { q: "Quel nom porte l'ère actuelle, commencée en 2019 ?", options: ["Heisei", "Meiji", "Reiwa"], answer: 2, explain: "Bravo ! Reiwa, « belle harmonie ». Tu as terminé le voyage !" },
  places: [
  {
    id: "tokyo", name: "Tokyo", region: "Shibuya et Akihabara", lat: 35.66, lon: 139.70,
    terrain: "night", ground: 0x4b4f6e, sun: [-6, 200], fog: 0x1b1640, particles: "neon", night: true,
    intro: ["En 1989 commence l'ère Heisei, et en 2019 l'ère Reiwa avec l'empereur Naruhito. Bienvenue dans le Tokyo d'aujourd'hui !", "La région de Tokyo compte environ 37 millions d'habitants : c'est la plus grande agglomération du monde."],
    pois: [
      { type: "shibuya", x: 0, z: -10, title: "Le carrefour de Shibuya", text: ["Quand les feux passent au vert, des milliers de piétons traversent dans toutes les directions.", "Tout près se trouve la statue de Hachikō, le chien fidèle qui attendit son maître à la gare pendant près de dix ans."] },
      { type: "skytree", x: -36, z: -40, title: "Tokyo Skytree", text: ["Inaugurée en 2012, la Tokyo Skytree mesure 634 mètres : c'est la plus haute tour du monde.", "634 se lit « mu-sa-shi », comme Musashi, l'ancien nom de la région."] },
      { type: "gameCenter", x: 32, z: 24, title: "Akihabara et les game centers", text: ["Mangas, anime et jeux vidéo japonais sont connus dans le monde entier depuis les années 1980 et 1990.", "Dans les « game centers », on joue aux machines d'arcade et aux attrape-peluches."] }
    ],
    npcs: [
      { id: "yui", name: "Yui, lycéenne", x: 6, z: 36, look: L(0x1d3557, 0xff4d6d, "ponytail"), lines: ["Salut ! Après les cours, on va aux clubs : musique, kendo, manga…", "Et le week-end, direction le game center pour battre des records !"] },
      { id: "pepo", name: "Pepo, robot d'accueil", x: -14, z: 14, look: L(0xe0e1dd, 0x00b4d8, "robot"), lines: ["BIP BOUP. Le Japon est célèbre pour ses robots et ses trains ponctuels à la seconde près.", "Mais le pays vieillit : près d'un Japonais sur trois a plus de 65 ans. BIP !"] },
      { id: "salaryman", name: "M. Tanaka, employé", x: 24, z: 6, look: L(0x343a40, 0x1d3557, "hair"), lines: ["Je prends le métro tous les matins : à l'heure de pointe, des employés aident à pousser les gens dans les wagons !", "Le soir, je m'arrête au konbini, la supérette ouverte 24 h sur 24."] }
    ],
    items: { name: "Capsule gachapon", icon: "🔮" },
    game: { id: "rhythm", npc: "yui" },
    quests: [
      { id: "q-tokyo", main: true, title: "Une soirée à Tokyo", giver: "yui",
        intro: ["Tu as l'air perdu ! Je te fais visiter ? On commence par le game center : battons un record de rythme !"],
        steps: [
          { t: "game", npc: "yui", say: ["Appuie quand les notes arrivent sur la ligne !"] },
          { t: "collect", what: "Carte de métro perdue", icon: "💳", n: 5, near: [0, -10], r: 40 },
          { t: "talk", npc: "salaryman", say: ["Ma carte de métro ! Merci, sans elle je ne rentrais pas chez moi.", "Tu as vu la Skytree ? La vue est incroyable."] },
          { t: "visit", poi: 1, say: ["Depuis le sommet, par temps clair, on voit le mont Fuji ! Va maintenant dans le Tōhoku, au nord-est."] }
        ] },
      { id: "q-pepo", title: "Les batteries de Pepo", giver: "pepo",
        intro: ["BATTERIE FAIBLE. Trouve 3 piles dans les rues. BIP."],
        steps: [{ t: "collect", what: "Pile", icon: "🔋", n: 3, near: [-20, -20], r: 18 }, { t: "talk", npc: "pepo", say: ["BATTERIE PLEINE. MERCI, HUMAIN. BIP BOUP !"] }] }
    ],
    decor: { skyscraper: 26, lamp: 18, sakura: 6 }
  },
  {
    id: "rikuzen", name: "Rikuzentakata", region: "Iwate, Tōhoku", lat: 39.02, lon: 141.63,
    terrain: "coast", ground: 0x7cb36a, sun: [32, 160], fog: 0xdfe8ee, particles: null,
    intro: ["Le 11 mars 2011, un séisme de magnitude 9 frappe le nord-est du Japon, suivi d'un immense tsunami. Il provoque aussi l'accident nucléaire de Fukushima.", "À Rikuzentakata, la ville a été presque entièrement détruite. Elle se reconstruit, avec courage."],
    pois: [
      { type: "memorial2011", x: 24, z: -16, title: "Le pin miraculeux", text: ["Parmi des dizaines de milliers de pins de la côte, un seul a résisté au tsunami. On l'a appelé le « pin miraculeux ».", "L'arbre est mort ensuite à cause de l'eau salée, mais il a été conservé comme symbole d'espoir."] },
      { type: "seawall", x: 30, z: 20, title: "La nouvelle digue", text: ["Après 2011, une digue de 12,5 mètres de haut a été construite le long de la côte.", "Le sol de la ville a aussi été surélevé de plusieurs mètres."] },
      { type: "tsunamiStone", x: -28, z: -30, title: "La pierre du tsunami", text: ["Sur la côte du Tōhoku, d'anciennes pierres gravées avertissent : « Ne construisez pas vos maisons en dessous de ce point ».", "À Aneyoshi, les habitants ont respecté cet avertissement, et leurs maisons ont été épargnées en 2011."] }
    ],
    npcs: [
      { id: "hana", name: "Grand-mère Hana", x: 6, z: 36, look: L(0xb5838d, 0xffcdb2, "bun"), lines: ["Nous avons tout perdu, mais nous nous sommes relevés ensemble.", "Le plus important, c'est de transmettre aux enfants ce qu'il faut faire en cas de tsunami."] },
      { id: "benevole", name: "Ken, bénévole", x: -14, z: 6, look: L(0xff7f11, 0x1d3557, "cap"), lines: ["Des milliers de bénévoles sont venus de tout le Japon et du monde pour aider.", "Au Japon, chaque école organise des exercices d'évacuation."] },
      { id: "ostreiculteur", name: "Pêcheur d'huîtres", x: 22, z: 40, look: L(0x264653, 0xe9c46a, "cap"), lines: ["Les huîtres de la baie sont revenues ! Des ostréiculteurs français nous ont même envoyé du matériel après le tsunami.", "En 1970, c'étaient des huîtres japonaises qui avaient sauvé les élevages français."] }
    ],
    items: { name: "Lanterne de souvenir", icon: "🏮" },
    game: { id: "evacuation", npc: "benevole" },
    quests: [
      { id: "q-rikuzen", main: true, title: "Se souvenir et se préparer", giver: "hana",
        intro: ["Les enfants du quartier préparent un exercice d'évacuation. Ken, le bénévole, a besoin d'un assistant."],
        steps: [
          { t: "game", npc: "benevole", say: ["La terre tremble ! Choisis les bons gestes pour te protéger."] },
          { t: "visit", poi: 2 },
          { t: "collect", what: "Graine de pin", icon: "🌰", n: 5, near: [10, -40], r: 20 },
          { t: "talk", npc: "hana", say: ["Avec ces graines, on replantera la forêt de pins. La vie reprend toujours.", "Va maintenant à Osaka : le monde entier s'y est réuni en 2025."] }
        ] },
      { id: "q-huitres", title: "Les cordes à huîtres", giver: "ostreiculteur",
        intro: ["La tempête a détaché 3 bouées de mes cordes à huîtres. Tu peux les ramasser sur la plage ?"],
        steps: [{ t: "collect", what: "Bouée", icon: "⚪", n: 3, near: [28, 0], r: 14 }, { t: "talk", npc: "ostreiculteur", say: ["Merci ! L'entraide entre la France et le Japon, c'est une belle histoire de mer."] }] }
    ],
    decor: { pine: 22, rock: 12, house: 10, flower: 14 }
  },
  {
    id: "expo", name: "Osaka, Expo 2025", region: "île de Yumeshima", lat: 34.65, lon: 135.39,
    terrain: "plain", ground: 0x8fc46a, sun: [14, 260], fog: 0xf4d6c4, turbidity: 8, particles: "neon",
    intro: ["D'avril à octobre 2025, Osaka accueille l'Exposition universelle sur l'île artificielle de Yumeshima.", "Plus de 150 pays et régions y présentent leurs idées pour l'avenir. C'est la dernière étape de ton voyage !"],
    pois: [
      { type: "grandRing", x: 0, z: -34, title: "Le Grand Anneau", text: ["Le Grand Anneau, dessiné par l'architecte Sou Fujimoto, fait environ 2 km de tour. Il est construit en bois, avec des techniques d'assemblage traditionnelles.", "Il est entré dans le Livre Guinness des records comme la plus grande structure architecturale en bois du monde."] },
      { type: "pavilion", x: -32, z: 10, title: "Les pavillons du monde", text: ["Chaque pays présente sa culture et ses innovations : énergie, santé, robots, nature…", "Osaka avait déjà accueilli une Exposition universelle en 1970."] },
      { type: "hanabiStage", x: 30, z: 18, title: "Le spectacle du soir", text: ["Les feux d'artifice, hanabi (« fleurs de feu »), sont une grande tradition japonaise.", "À Edo, le festival de feux d'artifice de la rivière Sumida existe depuis 1733 !"] }
    ],
    npcs: [
      { id: "architecte", name: "Architecte de l'Expo", x: 6, z: 36, look: L(0x606c38, 0xffffff, "hair"), lines: ["Le Grand Anneau réunit tous les pavillons, comme un symbole d'unité dans la diversité.", "Le bois japonais montre qu'on peut construire grand… et durable."] },
      { id: "visiteuse", name: "Lina, visiteuse belge", x: -14, z: 18, look: L(0xffd60a, 0xe63946, "ponytail", 0xf0c9a8), lines: ["Je viens de Belgique ! Notre pays a aussi son pavillon, bien sûr.", "J'ai goûté aux takoyaki, les boulettes de poulpe d'Osaka : délicieux !"] },
      { id: "artificier", name: "Maître artificier", x: 22, z: 30, look: L(0x1d3557, 0xff006e, "band"), lines: ["Un bon hanabi doit éclater au sommet de sa course, en une sphère parfaite.", "Tu veux tirer le bouquet final ?"] }
    ],
    items: { name: "Tampon souvenir", icon: "💮" },
    game: { id: "hanabi", npc: "artificier" },
    quests: [
      { id: "q-expo", main: true, title: "Le bouquet final", giver: "architecte",
        intro: ["Pour la soirée de clôture, nous préparons un grand feu d'artifice.", "Collecte d'abord 5 tampons souvenirs sur l'île, puis va voir le maître artificier."],
        steps: [
          { t: "collect", what: "Tampon de pavillon", icon: "💮", n: 5, near: [0, 0], r: 44 },
          { t: "visit", poi: 0 },
          { t: "game", npc: "artificier", say: ["Fais éclater chaque fusée au sommet de sa course !"] },
          { t: "talk", npc: "architecte", say: ["Magnifique ! Tu as parcouru tout le chemin de l'histoire du Japon.", "La gardienne du temps t'attend devant le dernier torii, pour ta dernière question."] }
        ] },
      { id: "q-lina", title: "Le carnet de Lina", giver: "visiteuse",
        intro: ["J'ai perdu les 3 pages de mon carnet de tampons ! Tu les as vues ?"],
        steps: [{ t: "collect", what: "Page de carnet", icon: "📒", n: 3, near: [-30, -20], r: 16 }, { t: "talk", npc: "visiteuse", say: ["Merci ! Collectionner les tampons, les « eki stamps », est une vraie passion au Japon."] }] }
    ],
    decor: { sakura: 10, lamp: 16, flower: 20 }, gate: true, final: true
  }
  ]
}
];
