/* ---------- Arschkarte: Kategorien ---------- */
// Alle Antworten sind rechnerisch oder allgemein bekannt; bei Näherungswerten steht "ungefähr" oder die Rechengrundlage in der Frage.
Q.push(
["Wie viele Sterne hat die Flagge der Europäischen Union?",12,""],
["Wie viele Sterne hat die Flagge der USA?",50,""],
["Wie viele Streifen hat die Flagge der USA?",13,""],
["Wie viele Bundesländer hat Deutschland?",16,""]
);
const QX={
'Lustig & Alltag 🤪':[
["Wie viele Hühnereier (Größe M, ca. 58 g) braucht man ungefähr für ein Kilo?",17,"Eier"],
["Wie viele 2-Euro-Münzen (je 8,5 g) wiegen zusammen ein Kilo?",118,"Münzen"],
["Wie viele 1-Cent-Münzen (je 2,3 g) wiegen zusammen ein Kilo?",435,"Münzen"],
["Wie viele Tischtennisbälle (je 2,7 g) wiegen zusammen ein Kilo?",370,"Bälle"],
["Wie viele Brötchen (je 50 g) ergeben ein Kilo?",20,"Brötchen"],
["Wie viele Äpfel (je 150 g) wiegen zusammen drei Kilo?",20,"Äpfel"],
["Wie viele Tage sind eine Million Sekunden?",11.6,"Tage"],
["Wie viele Jahre sind eine Milliarde Sekunden?",31.7,"Jahre"],
["Wie oft schlägt das Herz an einem Tag, wenn es 70-mal pro Minute schlägt?",100800,"Schläge"],
["Wie oft atmet man an einem Tag, wenn man 15-mal pro Minute atmet?",21600,"Atemzüge"],
["Wie viele Euro sind eine Million 1-Cent-Münzen wert?",10000,"€"],
["Wie viele Kilometer legt die Erde auf ihrer Bahn um die Sonne pro Sekunde zurück?",30,"km"],
["Wie viele Minuten braucht man zu Fuß für einen Kilometer bei 5 km/h?",12,"Minuten"],
["Wie viele Sekunden braucht ein Stein im freien Fall (ohne Luftwiderstand) aus 100 m Höhe?",4.5,"s"],
["Wie viele Augen hat ein Würfel auf allen sechs Seiten zusammen?",21,""],
["Wie viele Steine hat ein Domino-Spiel (Doppel-Sechs)?",28,"Steine"],
["Wie viele Felder hat ein Schachbrett?",64,"Felder"],
["Wie viele Karten hat ein Skatblatt?",32,"Karten"],
["Wie viele Karten hat ein Pokerblatt (ohne Joker)?",52,"Karten"],
["Wie viele DIN-A4-Blätter ergeben ein DIN-A0-Blatt?",16,"Blätter"],
["Wie breit ist ein DIN-A4-Blatt?",21,"cm"],
["Wie viele Tage braucht ein Hühnerei zum Ausbrüten?",21,"Tage"],
["Wie viele Kilo wiegt ein Liter Honig?",1.4,"kg"],
["Wie viele Kilo wiegt ein Kubikmeter Luft?",1.2,"kg"]
],
'Essen & Trinken 🍕':[
["Wie viele Kalorien hat 100 g Vollmilchschokolade ungefähr?",540,"kcal"],
["Wie viele Kalorien hat 100 g Gummibärchen ungefähr?",343,"kcal"],
["Wie viele Kalorien hat 100 g Nutella ungefähr?",539,"kcal"],
["Wie viele Kalorien hat 100 g Butter ungefähr?",740,"kcal"],
["Wie viele Kalorien hat eine Dose Cola (0,33 l) ungefähr?",139,"kcal"],
["Wie viele Kalorien hat ein Liter Pils ungefähr?",430,"kcal"],
["Wie viele Liter Milch braucht man ungefähr für ein Kilo Butter?",20,"Liter"],
["Wie viel wiegt ein Stück Würfelzucker?",3,"g"],
["Wie viel Prozent Wasser enthält eine Gurke ungefähr?",95,"%"],
["Wie viel wiegt eine Standard-Tafel Schokolade?",100,"g"],
["Wie viel wiegt eine Standardpackung Spaghetti?",500,"g"]
],
'Tiere & Natur 🐾':[
["Wie viele Eier legt eine Legehenne ungefähr pro Jahr?",300,"Eier"],
["Wie viele Tage ist ein Hund trächtig?",63,"Tage"],
["Wie viel wiegt ein Elefantenbaby bei der Geburt ungefähr?",100,"kg"],
["Wie viele Bienen leben im Sommer in einem Bienenvolk ungefähr?",50000,"Bienen"],
["Wie hoch ist der höchste bekannte Baum der Welt (Hyperion)?",116,"m"],
["Wie lang wird ein Blauwal höchstens ungefähr?",30,"m"],
["Wie lang ist die Donau?",2850,"km"],
["Wie lang ist die Elbe?",1094,"km"],
["Wie viele Halswirbel hat eine Giraffe?",7,""],
["Wie viele Rippen hat ein Mensch?",24,""],
["Wie schnell kann ein Gepard maximal laufen?",110,"km/h"],
["Wie viele Zähne hat ein erwachsener Mensch (mit Weisheitszähnen)?",32,"Zähne"],
["Wie viele Zähne hat ein erwachsener Hund?",42,"Zähne"],
["Wie viele Zähne hat eine erwachsene Katze?",30,"Zähne"]
]};
const QCATS=['Wissen 🧠','Jahreszahlen 📅','Rechnen & Orte 🧮'].concat(Object.keys(QX));
const isYearQ=q=>/^In welchem Jahr/.test(q[0]);
const QPOOL={'Wissen 🧠':()=>Q.filter(q=>!isYearQ(q)),'Jahreszahlen 📅':()=>Q.filter(isYearQ)};
Object.keys(QX).forEach(k=>{QPOOL[k]=()=>QX[k]});
const QGEN={
'Wissen 🧠':[genAge],
'Jahreszahlen 📅':[genAgo,genAgo,genGap],
'Rechnen & Orte 🧮':[genDist,genDist,genDist,()=>genDiff(MOUNT,''),()=>genDiff(MOUNT,''),()=>genDiff(BUILD,''),genDates,genDates,genConv,genConv,genMath,genMath,genMath]
};

