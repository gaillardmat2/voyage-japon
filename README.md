# Michi — Le voyage du pèlerin du temps

Jeu 3D d'exploration (navigateur) qui retrace l'histoire du Japon, de l'époque Jōmon (vers 14 000 av. J.-C.) à l'ère Reiwa.
9 époques et 24 lieux emblématiques (Sannai-Maruyama, Nara, Kyoto, Kamakura, Himeji, Edo, Hiroshima, Tokyo, Expo d'Osaka…),
chacun avec son terrain, ses quêtes principales et secondaires, 5 objets cachés et un mini-jeu d'époque (25 mini-jeux).
On voyage de lieu en lieu grâce à la carte du Japon. Profils de joueurs sauvegardés sur l'appareil, avec code de transfert.

## Lancer en local
Il faut un petit serveur web (les modules JavaScript ne marchent pas en ouvrant le fichier directement) :

    python -m http.server 8000

puis ouvrir http://localhost:8000

## Déployer sur Render
1. Pousser ce dossier sur un dépôt GitHub.
2. Sur render.com : New > Blueprint, choisir le dépôt (le fichier render.yaml configure un « Static Site »).

## Commandes
- ZQSD / WASD / flèches : marcher — Maj : courir — E : parler / découvrir
- M : carte du Japon — J : carnet — H : indice de Kiko — souris : tourner la caméra — molette : zoom
- Tactile : joystick à gauche, bouton d'action à droite, glisser pour la caméra, pincer pour zoomer

## Structure
- `index.html`, `style.css` : interface
- `js/main.js` : moteur (Three.js), joueur, caméra, commandes, progression
- `js/places.js` : contenu historique (lieux, personnages, quêtes, questions) — c'est ici qu'on ajoute du contenu
- `js/minigames.js` : les mini-jeux d'époque
- `js/builders.js` : monuments et décors en 3D
- `js/textures.js` : textures générées (bois, pierre, tuiles, herbe, eau…)
