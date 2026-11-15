const PW={
'Tiere 🐧':['Pinguin','Giraffe','Kuh','Faultier','Krake','Känguru','Hahn','Flamingo','Schlange','Elefant','Eichhörnchen','Frosch','Gorilla','Fledermaus','Krokodil','Schildkröte','Biene','Adler','Pfau','Hund beim Gassi','Katze, die vom Tisch schubst','Wal','Schwein im Schlamm','Seepferdchen','Bär beim Honigklauen','Murmeltier','Papagei','Nilpferd','Hamster im Laufrad','Löwe','Krebs','Spinne','Chamäleon','Seehund','Storch','Maulwurf','Kolibri','Wolf beim Heulen','Dackel','Esel','Qualle'],
'Berufe 👨‍🍳':['Zahnarzt','Pilot','Friseur','Bäcker','DJ','Astronaut','Dirigent','Müllmann','Fotograf','Zauberer','Feuerwehrmann','Pizzabote','Schornsteinfeger','Taucher','Lehrer','Richter','Koch','Bergführer','Polizist','Metzger','Maler','Schäfer','Kellner','Bodybuilder','Zirkusdirektor','Tierarzt','Barista','Gärtner','Archäologe','Schauspieler','Clown','Rettungssanitäter','Schreiner','Torwart','Fitnesstrainer','Postbote','Sänger auf der Bühne','Winzer','Wetterfrosch','Zirkusartist'],
'Alltag 🏠':['Zähneputzen','Duschen','Wäsche aufhängen','Handy suchen','Schnarchen','Niesen','Staubsaugen','Regenschirm aufspannen','Bus verpassen','Wecker ausmachen','Kaffee kochen','Selfie machen','Fenster putzen','Rasen mähen','Schlüssel verlieren','Zelt aufbauen','Koffer packen','Geschenk einpacken','Spaghetti essen','Zwiebeln schneiden','Bett machen','Pizza belegen','Pfannkuchen wenden','Haare föhnen','Nudeln abgießen','Fahrrad aufpumpen','Reifen wechseln','Kaugummi im Haar','Einkaufswagen mit klemmendem Rad','Pflaster aufkleben','Brille suchen, die auf dem Kopf sitzt','Zimmer aufräumen','Auto einparken'],
'Sport 🏄':['Skifahren','Surfen','Boxen','Golf','Basketball','Bogenschießen','Klettern','Yoga','Tennis','Rudern','Eiskunstlauf','Bungee-Jumping','Fallschirmspringen','Eishockey','Kegeln','Reiten','Gewichtheben','Snowboarden','Tischtennis','Skateboard','Synchronschwimmen','Hürdenlauf','Badminton','Dart','Curling','Fechten','Judo','Wasserball','Rugby','Minigolf','Trampolinspringen','Eisstockschießen','Paragliding','Stand-up-Paddling','Hula-Hoop'],
'Peinlich 🙈':['Auf Bananenschale ausrutschen','Hose platzt','Beim Tanzen erwischt werden','Mückenjagd nachts','Gähnen','Schluckauf','Muskelkater','Eiswürfel im Rücken','Heißes Essen verschlucken','Zu spät zur Prüfung','Kitzlig sein','Im Aufzug allein singen','Falsche Person winken','Erschrecken bei Gewitter','Mit vollem Mund lachen','Gegen die Glastür laufen','Spinat zwischen den Zähnen','Handy fällt ins Klo','Falsches Auto aufschließen','Namen vergessen','Kaffee verschütten','Auf der Rolltreppe stolpern','Zu laut niesen in der Bibliothek','Stolpern und so tun, als wäre nichts'],
'Berge ⛰️':['Lawine','Gipfelkreuz','Seilbahn fahren','Wandern im Regen','Kuhglocke','Lagerfeuer','Angeln','Schlittenfahren','Schneemann bauen','Almabtrieb','Rettungshubschrauber','Pilze sammeln','Zecke entfernen','Brotzeit auf der Hütte','Steigeisen anziehen','Nebel auf dem Berg','Gämse','Edelweiß pflücken','Jodeln','Schneeschuhwandern','Gipfelbier','Skilift fahren','Wetterumschwung am Gipfel','Blasen an den Füßen','Hüttenwirt','Abseilen'],
'Chaos-Mix 🎲':[],
'Figuren 🧛':['Zombie','Superheld','Vampir','Pirat','Ritter','Geist','Cowboy','Ninja','Hexe','Roboter','Außerirdischer','Dinosaurier','Meerjungfrau','Detektiv','Yeti','Drache','Mumie','Sumo-Ringer','Ballerina','Oma beim Stricken','Prinzessin','Gespenst','Weihnachtsmann','Osterhase','Kobold','Superschurke','Schlafwandler','Pharao','Wikinger','Samurai','Hippie','Rockstar']
};
// [Emoji, Name, Beschreibung, Punkte-Faktor, Zeit-Faktor]
const TW=[
['✌️','Kein Twist','Ganz normal – aber gib alles!',1,1],
['🐢','Zeitlupe','Alles in extremer Zeitlupe!',2,1],
['🤖','Roboter','Bewege dich wie ein Roboter!',2,1],
['😶','Nur Mimik','Keine Hände – nur Gesicht und Körper!',2,1],
['🦩','Einbeinig','Du stehst die ganze Zeit auf einem Bein!',2,1],
['🎭','Opern-Drama','Maximal übertrieben, wie auf der großen Bühne!',1,1],
['⚡','Speed','Nur die halbe Zeit – dafür dreifache Punkte!',3,.5],
['🥷','Schleicher','Spiel alles ganz leise und heimlich geduckt!',2,1],
['🧊','Frostig','Du frierst die ganze Zeit fürchterlich dabei!',1,1]
];

const MIX='Chaos-Mix 🎲';
const MS=['Ein Pinguin','Ein Zombie','Eine Oma','Ein Roboter','Ein Pirat','Ein Faultier','Ein Ninja','Ein Superheld','Eine Giraffe','Ein Vampir','Ein Sumo-Ringer','Eine Ballerina','Ein Cowboy','Ein Gorilla','Ein Astronaut','Ein Kellner','Ein Zauberer','Ein Hund','Ein Dinosaurier','Ein Geist'];
const MA=['beim Zähneputzen','beim Skifahren','beim Tanzen','beim Kochen','beim Joggen','beim Einparken','beim Selfie-Machen','beim Bungee-Jumping','beim Schnarchen','beim Pizza-Backen','beim Gitarrespielen','beim Verlieben','beim Schlittschuhlaufen','beim Zelten','beim Klettern','beim Fensterputzen','beim Karaoke','beim Zahnarzt','beim Vorstellungsgespräch','beim Bowling'];
const mixWord=()=>pick(MS)+' '+pick(MA);

