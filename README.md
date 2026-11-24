# Michi — Le voyage du pèlerin du temps

Jeu 3D d'exploration (navigateur) qui retrace l'histoire du Japon, de l'époque Jōmon (vers 14 000 av. J.-C.) à l'ère Reiwa.
9 époques, monuments à découvrir, personnages historiques à rencontrer, un gardien de torii et sa question à la fin de chaque époque.

## Lancer en local
Il faut un petit serveur web (les modules JavaScript ne marchent pas en ouvrant le fichier directement) :

    python -m http.server 8000

puis ouvrir http://localhost:8000

## Déployer sur Render
1. Pousser ce dossier sur un dépôt GitHub.
2. Sur render.com : New > Blueprint, choisir le dépôt (le fichier render.yaml configure un « Static Site »).

## Commandes
- ZQSD / WASD / flèches : marcher — Maj : courir — E : parler / découvrir
- J : carnet — H : indice de Kiko — souris : tourner la caméra — molette : zoom
- Tactile : joystick à gauche, bouton d'action à droite, glisser pour la caméra, pincer pour zoomer

## Modèles 3D réalistes (optionnel)
Dépose un personnage animé au format .glb dans `models/` (par ex. un pack gratuit CC0 de Quaternius ou un personnage Mixamo exporté en glb),
puis indique-le dans `assets.json` :

    { "player": "models/player.glb", "playerHeight": 2.1 }

Les animations dont le nom contient « idle », « walk » et « run » sont utilisées automatiquement.

## Structure
- `index.html`, `style.css` : interface
- `js/main.js` : moteur (Three.js), joueur, caméra, commandes, progression
- `js/eras.js` : contenu historique (lieux, personnages, questions) — c'est ici qu'on ajoute du contenu
- `js/builders.js` : monuments et décors en 3D
- `js/textures.js` : textures générées (bois, pierre, tuiles, herbe, eau…)
