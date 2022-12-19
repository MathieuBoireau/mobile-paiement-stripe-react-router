Projet étudiant - 5 décembre 2022

* Penser à indiquer l'adresse ip dans client/ipaddress.json, et la clé public stripe dans App.tsx

## Fonctionnement de l'application
1. Connecter par Internet le smartphone et le pc pour qu'ils soient sur le même réseau.
2. Mettre l'adresse ip du pc dans ./client/ipaddress.json
3. Lancer le serveur dans ./server avec la commande 'docker compose up --build'
4. Faire la commande 'npm start' depuis ./client
5. Utiliser l'application Expo Go du smartphone pour scanner le QR Code affiché dans le terminal après le 'npm start'
6. L'application de paiement est démarrée. Il ne reste plus qu'à ajouter des items au panier en allant dans 'Scanner un QR Code'.
   Des QR codes sont disponibles dans le dossier ./client/QRCodes. Un message d'erreur s'affiche si le code ne correspond pas à un
   item de la base de données ou si l'item du QR Code est invalide. A noter que les QR Codes contiennent juste des .json avec un
   identifiant.
   En cas de refus d'utilisation de l'appareil photo du téléphone, on peut saisir des identifiants dans un champ de texte à la
   place.
7. Depuis le panier, il est possible d'augmenter ou diminuer la quantité d'un item déjà ajouté. On peut vider le panier ou procéder
   au paiement. A noter que le paiement par Stripe ne fonctionne pas pour des sommes inférieures à 1 €.

Mathieu BOIREAU
