# Party Box – Arbeitsnotizen für Claude

Party-Spiele-App von Sascha. **Eine einzige Datei: `index.html`** (Vanilla JS, kein Build, keine Frameworks), läuft auf GitHub Pages. Nicht aufteilen, solange Sascha es nicht ausdrücklich sagt. Antworten auf Deutsch, knapp, ehrlich; Annahmen und Unsicherheit offen nennen.

## Aufbau von index.html

1. `<style>` (CSS, Themes über `body[data-theme]`: feuer/neon/ozean; `body.calm` = Animationen aus)
2. Body: `#app` (Spiel), `#hw` (Host-Overlay "Gerade dran"), `#lv` (Client: Lobby verlassen), `canvas#fx`
3. Zwei eingebettete Bibliotheken: PeerJS (minifiziert, 1 Zeile) und qrcode-generator. **Nicht verändern.** Zum Lesen/Suchen nur mit `grep`/Offset, nie ganz ins Fenster laden.
4. Letztes `<script>` = die App, in dieser Reihenfolge (Abschnitte per `/* ===== … ===== */` markiert):
   core (Hilfsfunktionen, Config, Verlauf, Haptik/Ton, Effekte) → Fragen `Q` + Generatoren `GEN` → Wortlisten `PW`, Twists `TW` → UI (Home, Spieler, Einstellungen, Setup, Glücksrad, Session, `plan`, `hand`, `boardHTML`, `finish`) → Spiele (`arsch`, `pant`, `spy`, `wave`, `bluff`, `react`, `bomb`, `c4`) → Online (`net`, Host, Client).

## Globale Zustände

| Name | Inhalt |
|---|---|
| `C` | Config `{days, fx, vib, sound, theme}`, gespeichert in `pb_cfg` (zusammen mit Namen) |
| `S` | `names`, `mode` ('solo'/'team'), `nt`, `P` (Spielernamen der laufenden Session), `tm` (Teams) |
| `G` | laufende Session (`id, def, o, team, ents, pts, …` plus Spiel-Felder) |
| `OPT` | Optionen pro Spiel (`OPT.arsch.rounds` …) |
| `CUR` | aktuelle Spiel-ID, `TH` = Farbverlauf des Spiels |
| `NET` | Online-Zustand (`on, host, client, code, m[], inGame, scr, peer, conn, perm, idx, localNames, syn`) |
| `ACT`, `PERM`, `WAIT` | Online: wer sieht/bedient gerade (siehe unten) |

## Spiele

Jedes Spiel ist `GAMES.<id>={name,e,tag,c,min,teams,desc,rules,opts(),start()}` (optional `nt2`). Screens kommen aus `scr(html)` (Template-Strings, Inline-`onclick`). Reihum-Spiele nutzen `hand(spielerIndex, nachricht, weiter, fortschrittHTML, tag)`: lokal der "Gerät weitergeben"-Screen, online siehe unten. `G.ents` sind Einzelspieler oder Teams, Punkte immer in `G.pts[eOf(i)]`. Ende mit `finish({asc,unit,vals,extra})`. Rundenplan für Teams: `plan(rounds)`.

**Wiederholungssperre:** `ordered(liste, keyFn, ns)` + `mark(ns,key)`, localStorage `pb_h_<ns>`. Namespaces in `HNS`: q (Fragen), w (Wörter), l (Orte), s (Skalen), b (Bluff), c (Bombe-Kategorien). Neuer Namespace → in `HNS` eintragen (sonst greift "Verlauf zurücksetzen" nicht).

## Online-Modus (PeerJS-Cloud, kein eigener Server)

- Spiel läuft **nur auf dem Host**. Clients bekommen eine DOM-Spiegelung von `#app` (MutationObserver, Elemente per `data-n`-ID). Pakete Host→Client: `full`, `mut` (ops `h`=innerHTML, `a`=Attribut), `wait`, `perm`, `fx` (confetti/flash/vib/sfx). Clients→Host: `hi`, `ev` mit `ty` = click | in | key | pointerdown/move/up/cancel | hb.
- Der Host führt Client-Events am echten DOM aus (`el.click()`, synthetische `PointerEvent`s, `NET.syn=true`). Es wird **kein Code von Clients ausgeführt**; Client-HTML wird beim Einsetzen von `on*`-Attributen befreit (`strip`, → `data-h-*`).
- `ACT` = Spielerindex, dessen Gerät den privaten Screen sieht (gesetzt vom `hand()`-Wrapper). Alle anderen bekommen `WAIT` ("Gerade dran"), der Host sieht dann das Overlay `#hw`. Private Inhalte (Schätzungen, Karten, Antworten) dürfen nur in Screens stehen, die nach `hand()` erzeugt werden.
- `PERM` regelt, wer auf **öffentlichen** Screens bedienen darf: `'host'` (Standard), `'all'`, Spielerindex oder Funktion. Festgelegt in `PUBW` (Liste der Funktionen, die `ACT=null` setzen und Views synchronisieren) und `PERMS` (Ausnahmen, z. B. `spyTalk`/`waGuess` = alle, `spyGuess` = Spion, `boLight` = Halter, `c4Round` = Spieler am Zug).
- **Neues Spiel:** jede Funktion, die einen öffentlichen Screen aufbaut (Ergebnis, Abstimmung, Rundenstart …), in `PUBW` eintragen, bei Bedarf Recht in `PERMS`. Sonst bleibt `ACT` vom letzten privaten Screen hängen.
- **Parallele Eingaben (Online-Host, `PAR`):** Statt Reihum (`hand`) bekommt jedes Gerät gleichzeitig einen eigenen Screen. `parBegin({head,msg,steps,done})` zeigt öffentlich nur den Stand (✅/⏳), jeder Schritt `{k,html(pi),sub(pi,{v,f})}` rendert das private Formular (Packet `own`; beim Host im Overlay `#hw`). Buttons tragen `data-sub`/`data-v`, Felder `data-f`, der Container `data-p` (Spielerindex). Clients schicken Daten `{ty:'sub',p,k,v,f}`, keine DOM-Klicks; der Host prüft in `parSub` (Gerät gehört zu `p`, Schritt passt) und `sub()` validiert und gibt `true` oder eine Fehlermeldung zurück. Getrennte Spieler: ihr Formular zeigt der Host, nach Wiederbeitritt bekommt sie wieder ihr Gerät. Genutzt von Arschkarte (`arPar`), Bluff (`bPar`/`bVotePar`) und Spion (`spyPar`); lokal bleibt alles Reihum. `PAR` wird in `wrapPub`, `lobbyScreen`, `netStop` zurückgesetzt.
- **Fragezeichen/Info (Arschkarte):** `qInfo(q)` = `q[3]` (generierte Fragen) oder `INFO[Fragetext]` (feste Fragen); Lookup-Tabellen `CITYI`, `MI` (Berge/Gebäude), `EVI` (Ereignisse), `PEOPLEI` für die Generatoren. `qBtn`/`qBox` bauen den "?"-Knopf und die verborgene Infobox in die Frageseite (lokal `arGuess`, online `arPar`); das Auf-/Zuklappen läuft rein lokal auf dem jeweiligen Gerät (`data-tg="qi"`). **Regeln für neue Infos:** erklären, was/wer gemeint ist, **keine Zahl nennen, die die Antwort ist** (Test prüft das); neue Personen/Städte/Ereignisse/Berge brauchen einen Eintrag in der passenden Tabelle. Ohne Info erscheint kein "?".
- **Hauptmenü-Knopf:** `#hm` (oben links, `body.live`) erscheint nur während eines laufenden Spiels (`setLive(true)` in `startSession`, `setLive(false)` in `home`, `gameSetup`, `settings`, `playersScreen`, `statsScreen`, `lobbyScreen`, `onlineMenu`, `joinScreen`, `finish`; neue Menü-Screens dort ebenfalls eintragen). Mit Rückfrage (`hmAsk`) → `home()`; auf Client-Geräten (Klasse `live` ab Beitritt) erscheint er ebenfalls, dort heißt der Dialog "Lobby verlassen" und ruft `netLeave()`; beim Host beendet er das Spiel für alle.
- **Arschkarte zu zweit:** `G.tip=S.P.length>2`; ohne Tippen (nur 2 Spieler, die Wahl wäre erzwungen) entfallen Tipp-Bildschirm/-Schritt, Tipp-Zeilen und die Tippzeit (`arAfter`, `arPar` mit einem Schritt). **4 Gewinnt** hat `min:1`: mit einem Spieler (`S.names.length<2`) ist der Gegner immer der Computer; die Spielerliste geht bis 1 herunter (andere Spiele sperren per `pickGame`).
- **Arschkarte-Kategorien:** `QCATS` (Wissen, Jahreszahlen, Rechnen & Orte, Lustig & Alltag, Essen & Trinken, Tiere & Natur); feste Fragen je Kategorie in `QPOOL` (`Q` aufgeteilt in Wissen/Jahreszahlen, neue Kategorien in `QX`), generierte in `QGEN`. `OPT.arsch.cats` (nichts gewählt = alle), `buildDeck` mischt feste und generierte Fragen (je Hälfte, falls beides da ist) und liefert bei kleinen Kategorien ein kürzeres Deck; `arStart` kürzt dann `G.rounds`. Neue Fragen: `[Text, Zahl ≠ 0, Einheit]`, bei Näherungswerten "ungefähr" bzw. die Rechengrundlage in die Frage schreiben, keine doppelten Texte.
- **Timer:** Anzeige `#tmr` (oben mittig) per `tmrShow(ms,onEnd)`/`tmrHide()` (`stopAll()` blendet sie aus). Lokal (Arschkarte, `OPT.arsch.timer`, 0 = aus, Standard 30 s): `arGuess` startet ihn, bei Ablauf zählt eine getippte Zahl (`arTimeUp`), sonst `null` = keine Antwort (in `arResult` ohne Punkte, aus Best/Worst herausgerechnet). Online: `parBegin({dur:[ms,…]})` = Zeitphasen pro Schritt (Schätzen, danach `ARTIP_MS` zum Tippen); der Host schließt eine Phase 1,5 s nach Ablauf (`parTick`, `step.timeout(pi)` setzt Standardwerte), die Clients bekommen Paket `tm` (Restzeit, kein Datum → keine Uhrenabweichung) und schicken bei 0 den getippten Wert automatisch ab (`autoSub`). `parEnd()` beendet alles und schickt `tm {off}`.
- **Statistik:** nur pro Gerät, `localStorage` `pb_stats` (Schlüssel `n:<name klein>`, je Spiel `{n,w,p,s:{Zähler},m:{Minima}}`), keine IP/kein Server. `recordStats` in `finish()` (Einzel- und Teamspiele, bei 4 Gewinnt über `G.pi`, CPU wird ignoriert); Online speichert der Host alle Namen und schickt jedem Client Paket `stat`, das dessen Gerät unter `NET.name` speichert. Zusatzwerte je Spiel in `statExtra` (Arschkarte: Arschkarten/nächste, Reflex: beste ms). Anzeige `statsScreen()` (📊 auf der Startseite, nur wenn nicht online).
- Pointer-Interaktionen (Balken, Brett) brauchen `data-ptr` am Element; Positionen laufen normiert (`rx`, `ry`).
- Verbindung: Lobby-Code 5 Zeichen (`APP_CODE_LEN`), Host-Peer-ID `pbox-CODE`, Heartbeat alle 4 s, Timeout 16 s. Getrennte Spieler bleiben in `NET.m`, ihr Gerät fällt auf den Host zurück (`devIdx`); Identität eines Geräts = Geräte-ID (`pb_cid` in localStorage, wird in `hi` mitgeschickt): gleiche ID übernimmt den Platz, auch wenn die alte Verbindung noch offen wirkt; gleicher Name mit anderer ID wird "Name 2"; alte Clients ohne ID: Übernahme per Name nur bei getrennter Verbindung. **Neuladen/App-Neustart (Client):** die Sitzung (`pb_sess`: Code, Name, max. 3 h) wird beim Beitritt gemerkt und beim Start automatisch wieder aufgebaut; vergessen wird sie bei bewusstem Verlassen, `bye` (Lobby geschlossen/voll) und fehlgeschlagenem Beitritt. Der **Host** kann nach Neuladen nicht wiederhergestellt werden (Spielzustand liegt nur im Speicher). Max. 10 Spieler. Wake Lock auf dem Host.
- Link-Beitritt: `index.html#CODE`.

## Bekannte Grenzen

- Reflex: Online zählt die Zeit auf dem Host, Netzlatenz verfälscht sie (Host im Vorteil). Besser: Messung auf dem Client.
- Reihum statt parallel laufen online noch Pantomime, Wellenlänge, Reflex, Bombe (inhaltlich Reihum) – Arschkarte, Bluff, Spion sind parallel.
- Kein TURN-Relay: über Mobilfunk (CGNAT) kann die Verbindung scheitern.
- Host muss die App offen lassen.

## Testen

- Playwright; Chrome liegt unter `/usr/bin/google-chrome` (`--no-sandbox`), in der Cloud-Umgebung reicht `chromium.launch()`. Scripts und temporäre Dateien **außerhalb** des Repos ablegen (Scratchpad).
- Online-Tests: `Peer` per BroadcastChannel mocken (2–4 Tabs im **selben** Browser-Kontext, lokaler `http.server`; `localStorage` pro Tab mit Präfix trennen, sonst teilen sich die Tabs Geräte-ID und `pb_sess`), PeerJS-Cloud nicht nötig. Prüfen: Spiegelung, Rechte, **Privatsphäre** (kein Mitspieler sieht fremde Geheimnisse), Verbindungsabbruch/Wiederbeitritt.
- Vor jedem Commit: keine JS-Fehler im Browser (`pageerror`, `console.error`), lokaler Modus und Online-Modus laufen. Ist etwas nicht getestet, im Bericht sagen.

## Arbeitsweise

- Nur ändern, was Sascha verlangt; bei Unklarheit nachfragen.
- Kleine Commits mit deutscher Beschreibung. Zielbranch laut Sascha `main`; in dieser Cloud-Sitzung darf nur auf `claude/upbeat-faraday-v4vk3v` gepusht werden (`main` existiert; Sascha hat einmalig erlaubt, dorthin zu pushen – sonst nur per PR). Keine Pull Requests ohne Aufforderung.
- Nach jeder Aufgabe in 2–3 Sätzen berichten: was geändert, was getestet.

## Ideen für später (NICHT umsetzen, nur festgehalten)

**Anzeige-Bildschirm + mehrere Handys als Mitspieler** (Idee von Sascha, Annahme: so gemeint)
- Heute: Das Host-Gerät ist Spiel *und* Spieler. Wenn der Host selbst dran ist, verdeckt sein privates Formular (`#hw`-Overlay) den gemeinsamen Bildschirm; der Host kann also nicht gleichzeitig mitspielen und den öffentlichen Stand sehen.
- Idee: Das Host-Gerät (z. B. iPad oder Laptop) zeigt dauerhaft nur den **gemeinsamen Anzeige-Bildschirm** (Status, Ergebnisse, Brett, Rangliste) als Overlay über allem. Alle Spieler, **auch der Host als Person**, spielen mit ihrem eigenen Handy als normaler Client (privater Screen wie bei den parallelen Eingaben). So kann der Host genauso mitspielen wie jeder andere.
- Mögliche Bausteine: eigene Rolle "Anzeige" in `NET.m` (kein Spielerindex), Host-Person als zusätzlicher Client-Spieler, Steuerrecht für öffentliche Screens ("Nächste Frage", Rundenstart) für den Host-Spieler oder alle statt nur das Host-Gerät, Reihum-Spiele zeigen "Gerade dran" auf der Anzeige. Die Mechanik `own`/`parSub` und `PERMS` sind dafür schon die Grundlage.
- Offen: ob die Anzeige auch ohne Mitspieler-Slot laufen soll, und wie der Host-Spieler ohne zweites Gerät spielt (zweiter Browser-Tab auf demselben Gerät?).
