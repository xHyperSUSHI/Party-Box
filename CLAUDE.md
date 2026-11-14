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
- Pointer-Interaktionen (Balken, Brett) brauchen `data-ptr` am Element; Positionen laufen normiert (`rx`, `ry`).
- Verbindung: Lobby-Code 5 Zeichen (`APP_CODE_LEN`), Host-Peer-ID `pbox-CODE`, Heartbeat alle 4 s, Timeout 16 s. Getrennte Spieler bleiben in `NET.m`, ihr Gerät fällt auf den Host zurück (`devIdx`); Wiederbeitritt mit demselben Namen übernimmt den Platz. Max. 10 Spieler. Wake Lock auf dem Host.
- Link-Beitritt: `index.html#CODE`.

## Bekannte Grenzen

- Reflex: Online zählt die Zeit auf dem Host, Netzlatenz verfälscht sie (Host im Vorteil). Besser: Messung auf dem Client.
- Reihum statt parallel laufen online noch Pantomime, Wellenlänge, Reflex, Bombe (inhaltlich Reihum) – Arschkarte, Bluff, Spion sind parallel.
- Kein TURN-Relay: über Mobilfunk (CGNAT) kann die Verbindung scheitern.
- Host muss die App offen lassen.

## Testen

- Playwright; Chrome liegt unter `/usr/bin/google-chrome` (`--no-sandbox`), in der Cloud-Umgebung reicht `chromium.launch()`. Scripts und temporäre Dateien **außerhalb** des Repos ablegen (Scratchpad).
- Online-Tests: `Peer` per BroadcastChannel mocken (2–4 Tabs, lokaler `http.server`), PeerJS-Cloud nicht nötig. Prüfen: Spiegelung, Rechte, **Privatsphäre** (kein Mitspieler sieht fremde Geheimnisse), Verbindungsabbruch/Wiederbeitritt.
- Vor jedem Commit: keine JS-Fehler im Browser (`pageerror`, `console.error`), lokaler Modus und Online-Modus laufen. Ist etwas nicht getestet, im Bericht sagen.

## Arbeitsweise

- Nur ändern, was Sascha verlangt; bei Unklarheit nachfragen.
- Kleine Commits mit deutscher Beschreibung. Zielbranch laut Sascha `main`; in dieser Cloud-Sitzung darf nur auf `claude/upbeat-faraday-v4vk3v` gepusht werden (`main` existiert; Sascha hat einmalig erlaubt, dorthin zu pushen – sonst nur per PR). Keine Pull Requests ohne Aufforderung.
- Nach jeder Aufgabe in 2–3 Sätzen berichten: was geändert, was getestet.
