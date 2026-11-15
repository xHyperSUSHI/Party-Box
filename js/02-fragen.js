const Q=[
["Wie hoch ist die Zugspitze?",2962,"m"],
["Wie viele Knochen hat ein erwachsener Mensch?",206,""],
["Wie weit ist der Mond im Mittel von der Erde entfernt?",384400,"km"],
["Wie viele Tasten hat ein Standard-Klavier?",88,""],
["Wie hoch ist der Mount Everest?",8849,"m"],
["Wie lang ist der Rhein?",1233,"km"],
["Wie viele Stufen hat der Südturm des Kölner Doms?",533,""],
["Wie alt wurde Jeanne Calment, die älteste dokumentierte Person?",122,"Jahre"],
["Wie viele Länder sind Mitglied der Vereinten Nationen?",193,""],
["Wie lang ist der Erdumfang am Äquator?",40075,"km"],
["Wie viele Sekunden hat ein Tag?",86400,"s"],
["Wie viele Elemente hat das Periodensystem?",118,""],
["Wie lang ist ein Marathon?",42.195,"km"],
["Wie viele Sitze hat der aktuelle Bundestag?",630,""],
["Wie hoch ist der Burj Khalifa?",828,"m"],
["Wie schwer ist ein Tischtennisball?",2.7,"g"],
["Wie lange braucht das Sonnenlicht bis zur Erde?",8.3,"Minuten"],
["Wie viele Zuschauer fasst die Allianz Arena ungefähr?",75000,""],
["Wie lang ist der Gotthard-Basistunnel?",57,"km"],
["Wie tief ist der Bodensee an der tiefsten Stelle?",251,"m"],
["Wie viele Liter fasst ein olympisches Schwimmbecken (50 × 25 × 2 m)?",2500000,"Liter"],
["Wie alt wurde Mozart?",35,"Jahre"],
["Wie viele Sinfonien hat Beethoven komponiert?",9,""],
["Wie lange dauert ein siderischer Mondumlauf um die Erde?",27.3,"Tage"],
["Wie alt ist die Erde?",4.54,"Mrd. Jahre"],
["Wie schnell ist der 100-m-Weltrekord der Männer?",9.58,"s"],
["Wie hoch ist der Hochsprung-Weltrekord der Männer?",2.45,"m"],
["Wie heiß ist die Oberfläche der Sonne?",5500,"°C"],
["Wie weit ist die Sonne von der Erde entfernt?",149.6,"Mio. km"],
["Wie viele Tore schoss Miroslav Klose bei Weltmeisterschaften?",16,""],
["Wie viele Bundesliga-Tore schoss Gerd Müller?",365,""],
["Wie viele Liter Blut hat ein Erwachsener durchschnittlich?",5,"Liter"],
["Wie schnell fährt ein ICE in Deutschland maximal?",300,"km/h"],
["In welchem Jahr fiel die Berliner Mauer?",1989,"Jahr"],
["In welchem Jahr sank die Titanic?",1912,"Jahr"],
["In welchem Jahr landete der erste Mensch auf dem Mond?",1969,"Jahr"],
["In welchem Jahr erreichte Kolumbus Amerika?",1492,"Jahr"],
["In welchem Jahr war die Katastrophe von Tschernobyl?",1986,"Jahr"],
["In welchem Jahr wurde Google gegründet?",1998,"Jahr"],
["In welchem Jahr kam das erste iPhone auf den Markt?",2007,"Jahr"],
["In welchem Jahr wurde der Euro als Bargeld eingeführt?",2002,"Jahr"],
["In welchem Jahr wurde der Mount Everest erstmals bestiegen?",1953,"Jahr"],
["In welchem Jahr begann der Bau von Schloss Neuschwanstein?",1869,"Jahr"],
["In welchem Jahr wurde der FC Bayern München gegründet?",1900,"Jahr"],
["In welchem Jahr wurde die Berliner Mauer gebaut?",1961,"Jahr"],
["In welchem Jahr begann die Französische Revolution?",1789,"Jahr"],
["In welchem Jahr wurde der Flughafen BER eröffnet?",2020,"Jahr"],
["In welchem Jahr wurde YouTube gegründet?",2005,"Jahr"]
];

/* ================= Mehr Fragen + Generatoren ================= */
Q.push(
["Wie tief ist das Challengertief im Marianengraben?",10935,"m"],
["Wie lange braucht die Erde für einen Umlauf um die Sonne?",365.25,"Tage"],
["Wie hoch ist der Olympus Mons auf dem Mars?",21.9,"km"],
["Wie schnell bewegt sich ein Punkt am Äquator durch die Erdrotation?",1670,"km/h"],
["Wie viele Billionen Kilometer ist ein Lichtjahr lang?",9.46,"Billionen km"],
["Bei wie viel °C schmilzt Eisen?",1538,"°C"],
["Wie viel °C hat der absolute Nullpunkt?",-273.15,"°C"],
["Wie groß ist die Fläche Deutschlands?",357600,"km²"],
["Wie groß ist die Fläche Bayerns?",70550,"km²"],
["Wie groß ist die Fläche des Bodensees?",536,"km²"],
["Wie viele Länder grenzen direkt an Deutschland?",9,""],
["Wie viele Zeitzonen hat Russland?",11,""],
["Wie viele Kantone hat die Schweiz?",26,""],
["Wie viele Mitgliedsstaaten hat die EU?",27,""],
["Wie lang ist die Isar?",295,"km"],
["Wie viel wiegt eine 2-Euro-Münze?",8.5,"g"],
["Wie groß ist der Durchmesser einer 2-Euro-Münze?",25.75,"mm"],
["Wie viele Pixel hat ein Full-HD-Bild (1920 × 1080)?",2073600,"Pixel"],
["Wie viel wiegt ein menschliches Gehirn ungefähr?",1400,"g"],
["Wie oft schlägt ein Herz am Tag ungefähr?",100000,"Schläge"],
["Wie viel Zucker steckt ungefähr in 0,33 l Cola?",35,"g"],
["Wie viele Stunden schläft ein Koala am Tag?",20,"Stunden"],
["Wie lange ist ein Elefant trächtig?",22,"Monate"],
["Wie groß ist ein Kaiserpinguin?",1.1,"m"],
["Wie viele Herzen hat ein Oktopus?",3,""],
["Wie hoch hängt ein Basketballkorb?",3.05,"m"],
["Wie breit ist ein Fußballtor?",7.32,"m"],
["Wie weit ist der Weitsprung-Weltrekord der Männer?",8.95,"m"],
["Wie oft wurde Deutschland Fußball-Weltmeister der Männer?",4,""],
["Wie viele Spiele hat eine Bundesliga-Saison pro Verein?",34,""],
["Wie hoch ist die Mona Lisa?",77,"cm"],
["Wie lang ist ein DIN-A4-Blatt?",297,"mm"],
["Wie viele Sekunden hat ein Jahr (ohne Schaltjahr)?",31536000,"s"],
["Wie viele Tage hat ein Schaltjahr?",366,"Tage"],
["In welchem Jahr wurde die erste E-Mail verschickt?",1971,"Jahr"],
["In welchem Jahr wurde die erste SMS verschickt?",1992,"Jahr"],
["In welchem Jahr kam der erste Game Boy auf den Markt?",1989,"Jahr"],
["In welchem Jahr wurde BMW gegründet?",1916,"Jahr"],
["In welchem Jahr wurde Volkswagen gegründet?",1937,"Jahr"],
["In welchem Jahr erschien das Ford Model T?",1908,"Jahr"],
["In welchem Jahr fand die erste Tour de France statt?",1903,"Jahr"],
["In welchem Jahr wurden die Kinder- und Hausmärchen der Brüder Grimm erstmals veröffentlicht?",1812,"Jahr"],
["In welchem Jahr wurde das Brandenburger Tor fertiggestellt?",1791,"Jahr"],
["In welchem Jahr endete die Weltumsegelung von Magellans Expedition?",1522,"Jahr"],
["In welchem Jahr wurde München gegründet?",1158,"Jahr"],
["In welchem Jahr wurde das Römische Weltreich im Westen formal beendet?",476,"Jahr"],
["In welchem Jahr fand die Schlacht bei Hastings statt?",1066,"Jahr"],
["In welchem Jahr wurde die Magna Carta unterzeichnet?",1215,"Jahr"],
["In welchem Jahr veröffentlichte Einstein die Spezielle Relativitätstheorie?",1905,"Jahr"],
["In welchem Jahr begannen die Terroranschläge vom 11. September?",2001,"Jahr"]
);
const EV=[
["fiel die Berliner Mauer","die Berliner Mauer fiel",1989],["sank die Titanic","die Titanic sank",1912],
["landeten Menschen erstmals auf dem Mond","Menschen erstmals auf dem Mond landeten",1969],
["erreichte Kolumbus Amerika","Kolumbus Amerika erreichte",1492],
["wurde Google gegründet","Google gegründet wurde",1998],["kam das erste iPhone auf den Markt","das erste iPhone auf den Markt kam",2007],
["wurde der Euro als Bargeld eingeführt","der Euro als Bargeld eingeführt wurde",2002],
["wurde der Mount Everest erstmals bestiegen","der Mount Everest erstmals bestiegen wurde",1953],
["wurde der FC Bayern München gegründet","der FC Bayern München gegründet wurde",1900],
["wurde die Berliner Mauer gebaut","die Berliner Mauer gebaut wurde",1961],
["begann die Französische Revolution","die Französische Revolution begann",1789],
["wurde YouTube gegründet","YouTube gegründet wurde",2005],["wurde Facebook gegründet","Facebook gegründet wurde",2004],
["wurde Apple gegründet","Apple gegründet wurde",1976],["wurde Microsoft gegründet","Microsoft gegründet wurde",1975],
["wurde Amazon gegründet","Amazon gegründet wurde",1994],["wurde der Eiffelturm eröffnet","der Eiffelturm eröffnet wurde",1889],
["begann der Erste Weltkrieg","der Erste Weltkrieg begann",1914],["begann der Zweite Weltkrieg","der Zweite Weltkrieg begann",1939],
["flog Juri Gagarin als erster Mensch ins All","Juri Gagarin als erster Mensch ins All flog",1961],
["fand die erste Fußball-WM statt","die erste Fußball-WM stattfand",1930],
["startete die erste Bundesliga-Saison","die erste Bundesliga-Saison startete",1963],
["wurde Penicillin entdeckt","Penicillin entdeckt wurde",1928],["wurde das Schaf Dolly geboren","das Schaf Dolly geboren wurde",1996],
["wurde das erste Oktoberfest gefeiert","das erste Oktoberfest gefeiert wurde",1810],
["fiel Konstantinopel","Konstantinopel fiel",1453],["wurde die Bundesrepublik Deutschland gegründet","die Bundesrepublik Deutschland gegründet wurde",1949],
["wurde Deutschland wiedervereinigt","Deutschland wiedervereinigt wurde",1990],["wurde das erste Auto von Carl Benz patentiert","das erste Auto von Carl Benz patentiert wurde",1886],
["wurde Lego gegründet","Lego gegründet wurde",1932],["wurde der Flughafen BER eröffnet","der Flughafen BER eröffnet wurde",2020],
["wurde der Kölner Dom fertiggestellt","der Kölner Dom fertiggestellt wurde",1880],["wurde John F. Kennedy erschossen","John F. Kennedy erschossen wurde",1963],
["wurde Nintendo gegründet","Nintendo gegründet wurde",1889],["wurde die Röntgenstrahlung entdeckt","die Röntgenstrahlung entdeckt wurde",1895]
];
const PEOPLE=[["Ludwig van Beethoven",56],["Albert Einstein",76],["Johann Wolfgang von Goethe",82],["Friedrich Schiller",45],["Vincent van Gogh",37],["Johann Sebastian Bach",65],["Isaac Newton",84],["Marie Curie",66],["Pablo Picasso",91],["Charles Darwin",73],["Winston Churchill",90],["Nikola Tesla",86],["Sigmund Freud",83],["Abraham Lincoln",56],["Leonardo da Vinci",67],["Napoleon Bonaparte",51],["Immanuel Kant",79]];
const MOUNT=[["die Zugspitze",2962],["der Watzmann",2713],["der Großglockner",3798],["der Mont Blanc",4806],["das Matterhorn",4478],["der Eiger",3967],["der Kilimandscharo",5895],["der Aconcagua",6961],["der Mount Everest",8849],["der K2",8611],["der Fuji",3776],["der Elbrus",5642],["der Ben Nevis",1345]];
const BUILD=[["der Eiffelturm (mit Antenne)",330],["der Kölner Dom",157],["der Berliner Fernsehturm",368],["der Burj Khalifa",828],["der Shanghai Tower",632],["das Empire State Building (mit Antenne)",443],["das Taipei 101",508],["der CN Tower",553],["das Ulmer Münster",161],["der Schiefe Turm von Pisa",56]];
const CITY=[["München",48.1351,11.582],["Berlin",52.52,13.405],["Hamburg",53.5511,9.9937],["Köln",50.9375,6.9603],["Frankfurt",50.1109,8.6821],["Stuttgart",48.7758,9.1829],["Dresden",51.0504,13.7373],["Wien",48.2082,16.3738],["Zürich",47.3769,8.5417],["Rom",41.9028,12.4964],["Paris",48.8566,2.3522],["London",51.5074,-0.1278],["Madrid",40.4168,-3.7038],["Lissabon",38.7223,-9.1393],["Athen",37.9838,23.7275],["Moskau",55.7558,37.6173],["New York",40.7128,-74.006],["Tokio",35.6762,139.6503],["Sydney",-33.8688,151.2093],["Kapstadt",-33.9249,18.4241],["Rio de Janeiro",-22.9068,-43.1729],["Peking",39.9042,116.4074],["Dubai",25.2048,55.2708],["Reykjavik",64.1466,-21.9426],["Kairo",30.0444,31.2357],["Innsbruck",47.2692,11.4041],["Bad Tölz",47.7611,11.5586],["Los Angeles",34.0522,-118.2437],["Bangkok",13.7563,100.5018],["Istanbul",41.0082,28.9784],["Oslo",59.9139,10.7522],["Amsterdam",52.3676,4.9041]];
function genDist(){
  let a=pick(CITY),b=pick(CITY);while(b===a)b=pick(CITY);
  const r=x=>x*Math.PI/180,dl=r(b[2]-a[2]),dp=r(b[1]-a[1]);
  const h=Math.sin(dp/2)**2+Math.cos(r(a[1]))*Math.cos(r(b[1]))*Math.sin(dl/2)**2;
  let d=2*6371*Math.asin(Math.sqrt(h));
  d=d<100?Math.round(d):d<1000?Math.round(d/5)*5:Math.round(d/10)*10;
  return [`Wie weit ist es in Luftlinie von ${a[0]} nach ${b[0]}?`,d,'km',`${a[0]}: ${CITYI[a[0]]||''}. ${b[0]}: ${CITYI[b[0]]||''}. „Luftlinie“ heißt: die kürzeste Verbindung über die Erdoberfläche, nicht die Straße.`];
}
function genDiff(list,what){
  let a=pick(list),b=pick(list);while(a===b)b=pick(list);if(a[1]<b[1])[a,b]=[b,a];
  return [`Wie viele Meter ist ${a[0]} höher als ${b[0]}?`,a[1]-b[1],'m',`${cap(a[0])}: ${MI[a[0]]||''}. ${cap(b[0])}: ${MI[b[0]]||''}. Gefragt ist der Unterschied der beiden Höhen.`];
}
function genDates(){
  const t0=Date.UTC(2000,0,1),t1=Date.UTC(2026,11,31);
  let x=t0+Math.floor(Math.random()*(t1-t0)),y=t0+Math.floor(Math.random()*(t1-t0));if(x>y)[x,y]=[y,x];
  const f=t=>{const d=new Date(t);return `${pad(d.getUTCDate())}.${pad(d.getUTCMonth()+1)}.${d.getUTCFullYear()}`};
  const days=Math.round((y-x)/864e5);if(days<30)return genDates();
  return [`Wie viele Tage liegen zwischen dem ${f(x)} und dem ${f(y)}?`,days,'Tage','Tipp: Rechne Jahre, Monate und Tage getrennt – und denk an Schaltjahre und unterschiedlich lange Monate.'];
}
function genAgo(){const e=pick(EV),now=new Date().getFullYear();return [`Wie viele Jahre ist es her, dass ${e[1]}?`,now-e[2],'Jahre',`Worum geht es: ${EVI[e[0]]||''}. Überlege, in welchem Jahr das war, und rechne bis heute.`]}
function genGap(){let a=pick(EV),b=pick(EV);while(a===b||a[2]===b[2])b=pick(EV);return [`Wie viele Jahre liegen zwischen dem Jahr, in dem ${a[1]}, und dem Jahr, in dem ${b[1]}?`,Math.abs(a[2]-b[2]),'Jahre',`Erstes Ereignis: ${EVI[a[0]]||''}. Zweites Ereignis: ${EVI[b[0]]||''}. Gefragt ist der Abstand der beiden Jahreszahlen.`]}
function genAge(){const p=pick(PEOPLE);return [`Wie alt wurde ${p[0]}?`,p[1],'Jahre',`${p[0]}: ${PEOPLEI[p[0]]||''}.`]}
function genConv(){
  const c=pick([[[2,3,5,7,10,12,14,30],'Tage','Sekunden',86400],[[2,5,12,24,36],'Stunden','Sekunden',3600],[[2,3,4,6],'Wochen','Minuten',10080],[[2,3,5],'Jahre (ohne Schaltjahre)','Stunden',8760],[[3,7,10,30],'Tage','Minuten',1440]]);
  const n=pick(c[0]);return [`Wie viele ${c[2]} sind ${n} ${c[1]}?`,n*c[3],c[2],'Tipp: Rechne Schritt für Schritt von der großen zur kleinen Einheit (zum Beispiel Tage → Stunden → Minuten → Sekunden).'];
}
function genMath(){
  const k=rnd(0,4);
  if(k===0){const a=rnd(12,99),b=rnd(12,99);return [`Was ergibt ungefähr ${a} × ${b}?`,a*b,'','Tipp: Runde die Zahlen (zum Beispiel 38 auf 40) und rechne im Kopf.']}
  if(k===1){const a=rnd(6,19),b=rnd(6,19),c=rnd(6,19);return [`Was ergibt ungefähr ${a} × ${b} × ${c}?`,a*b*c,'','Tipp: Runde die Zahlen und multipliziere zuerst zwei davon.']}
  if(k===2){const N=pick([200,300,500,1000,2000]);let c=0;for(let i=2;i<N;i++){let p=true;for(let j=2;j*j<=i;j++)if(i%j===0){p=false;break}if(p)c++}return [`Wie viele Primzahlen gibt es unter ${N}?`,c,'','Eine Primzahl ist nur durch 1 und durch sich selbst teilbar (2, 3, 5, 7, 11 …).']}
  if(k===3){if(Math.random()<.5){const e=rnd(40,300);return [`Wie viele Ziffern hat die Zahl 2 hoch ${e}?`,Math.floor(e*Math.log10(2))+1,'','„2 hoch n“ heißt: n-mal die 2 mit sich selbst multipliziert. Gefragt ist, wie viele Stellen das Ergebnis hat.']}
    const n=rnd(10,40);let f=1n;for(let i=2n;i<=BigInt(n);i++)f*=i;return [`Wie viele Ziffern hat ${n}! (${n} Fakultät)?`,String(f).length,'','„n!“ (Fakultät) heißt: 1 × 2 × 3 × … × n. Gefragt ist, wie viele Stellen das Ergebnis hat.']}
  const r=rnd(3,30);return [`Wie groß ist die Fläche eines Kreises mit ${r} m Radius?`,Math.round(Math.PI*r*r),'m²','Tipp: Kreisfläche = π × Radius × Radius, mit π ≈ 3,14.'];
}
const GEN=[genDist,genDist,genDist,()=>genDiff(MOUNT,''),()=>genDiff(MOUNT,''),()=>genDiff(BUILD,''),genDates,genDates,genAgo,genAgo,genGap,genAge,genConv,genConv,genMath,genMath,genMath];

