# Toteutussuunnitelma: Fysiikka Sprintti

**Alkuperäinen toteutussuunnitelma.** Sen pohjalta rakennettu peliversio on nyt `index.html`. Kaikki 33 tehtäväperhettä on toteutettu. Suunnitelman historiallinen visuaalinen koonti on `suunnitelma.html`, lähdekartoitus `MATERIAALIKARTOITUS.md` ja toteutetun version kuvaus `TOTEUTUS.md`. Alla kuvataan alkuperäinen tavoite ja toteutusjärjestys; ajantasaiset käyttöohjeet ovat README-tiedostossa.

## 1. Tavoite ja rajaus

Yhdessä päivässä käytettävä suomenkielinen harjoittelupeli, joka opettaa aineiston ratkaisumenetelmät. WordDive-henkisyys tarkoittaa lyhyitä harjoituskierroksia, välitöntä palautetta, näkyvää etenemistä ja toistuvaa mieleenpalautusta. Visuaalinen ilme ja sisältö ovat omia.

Peli ei lupaa kokeen läpäisyä tai täydellistä osaamista päivän aikana. Näytetty osaaminen perustuu ratkaistuihin uusiin tehtäviin, ei pelkkään peliaikaan, pisteisiin tai malliratkaisujen avaamiseen.

**Ensimmäisen peliversion ydin:** kaikki viikkotehtävien 3–5 aihepiirit. Laskuharjoitusten ja diojen sovellukset laajentavat tätä. Mittaustulkinta on valinnainen lisäosio, koska tarkkaa koerajausta ei ole saatavilla. Excelin käyttöliittymä, posterin valmistus ja varsinainen 3D-mekaniikka jäävät pelin ulkopuolelle.

## 2. Tehtäväpankki: 33 suunniteltua perhettä

Yksi perhe tuottaa useita erilaisia tehtäviä. **P1** = ensimmäiseen peliversioon, **P2** = aineiston täydentävät sovellukset, **P3** = mittauslisäosa. Tunnisteet eivät ole valmiiden tehtävien määrä.

| ID | Perhe / kysyttävä asia | Vaihtelu ja ratkaisumenetelmä | Prioriteetti |
| --- | --- | --- | --- |
| N01 | Voima, yksikkö, suunta ja voimalaji | Tilanteen mukaan voiman aiheuttaja/kohde, kosketus/kaukovaikutus ja suure/yksikkö. Perustele valinta. | P1 |
| N02 | Tasapaino vai kiihtyvä liike | Levossa, suoraviivaisessa vakioliikkeessä, kiihdytyksessä, jarrutuksessa ja suunnanmuutoksessa. Päättele a ja ΣF. | P1 |
| N03 | Newtonin III laki | Vaihtuvat vuorovaikutusparit. Tunnista eri kappaleisiin kohdistuvat voimat ja erota tasapainosta. | P2 |
| N04 | Vapaakappalekuva | Hissi, laatikko, kalteva taso, ripustus ja ilmalento. Lisää oikeat voimat ja suunnat; älä lisää ”liikkeen voimaa” tai saman voiman komponentteja uutena voimana. | P1 |
| N05 | Painovoima, kokonaisvoima ja massa | kg/t, N/kN ja eri kysyttävät suureet. G = mg, ΣF = ma; näiden ero. | P1 |
| N06 | Henkilö tai kori hississä | a ylös/alas/nolla, myös kiihtyvyyden ratkaiseminen tukivoimasta. Ylös positiivinen: N − mg = ma tai T − mg = ma. | P1 |
| N07 | Tankkeri ja hidas kiihdytys | Voima, nopeuden muutos ja aika min/s. a = Δv/Δt ja m = ΣF/a. | P2 |
| N08 | Laskuvarjon avautuminen | Vapaa pudotus ja sen jälkeinen nopeuden muutos. Laske keskimääräinen a ja köysivoima etumerkkeineen. | P2 |
| N09 | Voimien komponentit | Kulma vaaka- tai pystyakselista, suunnat ja etumerkit. Piirros ja sini/kosini vaihtuvat kulman määritelmän mukaan. | P1 |
| N10 | Kaltevan tason tasapaino | m ja θ vaihtuvat. G∥ = mg sin θ, G⊥ = mg cos θ, N = G⊥ ja lepokitka = G∥. | P1 |
| N11 | Kaksi erikulmaista hihnaa | m, α₁ ja α₂ → jännitykset; tai jännityksistä massa. Vaakasumma nolla, pystysumma mg. Kulmat pystysuorasta. | P1 |
| N12 | Symmetrinen kannatus | Massa ja vaakatason kulma. 2T sin θ = mg; vertaa loivaa ja jyrkkää ripustusta. | P2 |
| N13 | Kitkaton mäki, tuntematon massa | Tason suuntainen vetovoima ja θ → m ja N. F = mg sin θ. | P2 |
| N14 | Kiihdyttävän auton maskotti | Langan kulma pystysuorasta → a = g tan θ. Johda kahdesta komponenttiyhtälöstä ja huomaa massan supistuminen. | P2 |
| N15 | Laatikko lattian ja seinän nurkassa | Vino työntö ja kitkattomat pinnat → seinän ja lattian tukivoimat. Valitse kuvassa yksiselitteinen voiman suunta. | P2 |
| K01 | Lepokitka, lähtökitka, liikekitka | m, μs, μk, ulkoinen voima ja liikkeen tila. f_s ≤ μsN; f_k = μkN. Ratkaise lähteekö kappale liikkeelle. | P1 |
| K02 | Vaakasuora työntö ja irrotus | Vakionopeus, annettu kiihtyvyys tai vapaa jarrutus. F − μkmg = ma. | P1 |
| K03 | Vino veto tai työntö kitkalla | Ylä-/alaviisto voima, annettu f tai μk. Laske Fx, Fy, N, f ja a. Tulkitse kasvava/pienenevä vauhti annetusta nopeuden suunnasta. | P1 |
| K04 | Liuku kaltevalla tasolla ja rajakulma | m, θ, μs, μk. Liikkeellelähtö: tan θ > μs. Alaspäin liukuessa a = g(sin θ − μk cos θ). Rajatapaukset sanoitetaan erikseen. | P2 |
| K05 | Kitkajarrutus | μk ja alkunopeus tai pysähtymisaika. a = −μkg, t = −v₀/a, s = −v₀²/(2a). Vertaa nopeuden kaksin-/kolminkertaistumista. | P2 |
| K06 | Hinaus mäkeen ja köyden raja | m, θ, Tmax ja tavoitenopeus. T − mg sin θ = ma, sitten t = Δv/a. Kitka sivuutetaan kuten lähteessä. | P2 |
| L01 | Liikkeen suureet ja yksiköt | x, Δx, s, t, v, a, m/s ja km/h, etumerkki. Tunnista mitä annetaan ja kysytään. | P1 |
| L02 | Keskinopeus ja keskivauhti | Edestakainen liike tai eri osuuksien vauhdit. v̄ = Δx/Δt, ū = s/Δt; osamatkoissa aika = s/v, ei vauhtien tavallinen keskiarvo. | P2 |
| L03 | x(t): sekantti ja tangentti | Paloittain lineaarinen tai hallittu kaari. Laske keskimääräinen ja hetkellinen nopeus sekä tulkitse pysähdys ja suunnanvaihto. | P2 |
| L04 | v(t): kiihtyvyys, siirtymä ja matka | Arvotaan taitepisteet ja asteikot. Kulmakerroin → a; etumerkillinen pinta-ala → Δx; itseisarvoalat → s; x₀ + Δx → paikka. Mukana nollakohdan jako. | P1 |
| L05 | Kaarevan v(t):n tulkinta | Kaari + vakio-osuus + suora. Vertaile jyrkkyyttä ja pinta-aloja, tunnista muuttuva kiihtyvyys. Laskuvarjon tasainen putoamisnopeus: vastus = mg. | P1 |
| L06 | a(t), v(t), x(t) -yhteys | Kaavio- ja käsitetehtävät: kulmakerroin yhteen suuntaan, etumerkillinen pinta-ala toiseen. a(t)-numeerinen tehtävä on laajennus diojen periaatteesta. | P2 |
| L07 | Tasainen kiihdytys ja jarrutus | v₀, v, a tai t, myös km/h. v = v₀ + at, Δx = (v₀ + v)t/2. Sama Δv ei tarkoita samaa matkaa. | P1 |
| L08 | Pystysuora heitto | Alkunopeus tai nousuaika → v₀, hmax, y(t), v(t). Ylös +: a = −g; lakipisteessä v = 0, a ≠ 0. | P1 |
| L09 | Pysähtyminen tunnetulla matkalla | Auton/lentokoneen v₀ ja s. a = −v₀²/(2s), t = 2s/v₀. Kysy erikseen kiihtyvyyttä tai hidastuvuuden suuruutta. | P1 |
| M01 | Kitkakertoimen mittaus | Useita m- ja F-rivejä, N = mg, μ = F/N, F(N)-suoran kulmakerroin. Synteettinen data merkitään harjoitusmittaukseksi. | P3 |
| M02 | Sivulle vedetty punnus | Toistomittausten F-keskiarvo, G, T = √(F² + G²), kulma pystysuorasta ja Tx/Ty. Vertaa mitattuja ja ideaalisen tasapainon tuloksia. | P3 |
| M03 | Mittausraportin tulkinta | Valitse sopiva akselipari, yksiköt, pistekuvaaja ja kaava–sijoitus–tulos-ketju. Ei Excel-valikkopolkujen tenttaamista. | P3 |

P1 kattaa **17 perhettä**, P2 täydentää **13 perheellä**, P3 sisältää **3 perhettä**. Viikkotehtävien kattavuustaulukko on materiaalikartoituksessa.

## 3. Oppiminen yhden luvun sijaan

### Tehtävän rakenne

1. **Ymmärrä tilanne:** mikä kappale, mitkä voimat, mikä liikkeen tila? Valinta tai lyhyt perustelun valinta.
2. **Valitse malli:** oikea laki/yhtälö ja positiivinen suunta. Mukana uskottavia virhevaihtoehtoja.
3. **Ratkaise:** vaiheittaiset numeeriset kentät. Oikeat välivastaukset näkyvät, virheellistä kohtaa voi korjata.
4. **Tulkitse:** yksikkö, etumerkki, järkevyys ja esimerkiksi ”hidastuuko vai kiihtyykö?”.

Kaikkia neljää askelta ei pakoteta jokaiseen lyhyeen kertauskorttiin. Opetuspolku käyttää koko ketjua, nopea kertaus valitsee heikon kohdan ja koeharjoitus kysyy kokonaisuuden itsenäisesti.

### Kolme vihjetasoa ja malliratkaisu

- **Vihje 1 / havainto:** ohjaa ajattelemaan tilanteen olennaista ominaisuutta paljastamatta lopputulosta.
- **Vihje 2 / yhtälö:** näytä kyseisen tilanteen voimatasapaino tai liike-ehto ja merkkisopimus.
- **Vihje 3 / sijoitus:** näytä nykyisen tehtävän arvot ja tarvittava yksikkömuunnos. Älä käytä kiinteää esimerkkilukua.
- **Malliratkaisu:** avattava kokonainen laskuketju, yksiköt ja tulkinta. Sen katsominen kirjataan avustetuksi suoritukseksi.

**Esimerkki dynaamisesta hissitehtävästä:** m = 72 kg, a = −1,2 m/s², ylös on positiivinen. Kysymys tukivoimasta. Vihje 1: ”Kiihtyvyys on alaspäin. Tuntuuko henkilö kevyemmältä vai raskaammalta?” Vihje 2: ”N − mg = ma, joten N = m(g + a).” Vihje 3: ”N = 72 · (9,81 − 1,2) N.” Malliratkaisu: N = 619,92 N ≈ 620 N, mikä on pienempi kuin mg = 706,32 N. Uudet m ja a muuttavat kaikki sijoitukset ja tuloksen.

Väärästä vastauksesta annetaan mahdollisuuksien mukaan täsmävihje: ”Käytitkö tonneja kiloina?”, ”Valitsitko sinin kulman viereiselle komponentille?”, ”Kysyttiin siirtymää vai matkaa?” tai ”Tämä on kokonaisvoima, ei painovoima.” Arvaukseen perustuvaa diagnoosia ei esitetä varmana; viesti on tarkistuskysymys.

### Kierrokset, kertaus ja vaihtelu

- **Lähtötaso:** 8–10 lyhyttä, kaikkia pääalueita edustavaa tehtävää. Aloitteleva käyttäjä voi ohittaa testin ja aloittaa perusteista.
- **Opi ratkaisemaan:** 8 tehtävän kierros, yksi uusi taito ja aiempia taitoja. Ei aikapainetta.
- **Heikot kohdat:** enemmän väärin menneitä perheitä, mutta mukana myös eri aiheita. Väärin tehty perhe palaa uusilla luvuilla muutaman muun tehtävän jälkeen.
- **Koekierros:** 12 tehtävää, tasapainoinen aihejakauma. Vihjeet ja ratkaisut vasta lopussa, tulos tehtävä- ja aihekohtaisesti. Aikaraja on vapaaehtoinen; oletus ilman tiukkaa ajastusta.

Satunnaisuus tapahtuu **koerajauksen sisällä**: joka kierroksella kysymykset ja painotukset vaihtelevat, mutta kokonainen pääaihe ei saa vahingossa kadota harjoittelusta. Alussa aliedustetut aiheet nostetaan mukaan. Sama perhe ei toistu heti, ellei käyttäjä valitse omaa kohdennettua harjoitusta.

Osaamistasot: **ei vielä harjoiteltu → harjoiteltu tuella → itsenäinen onnistuminen → vahvistettu**. Vahvistus edellyttää esimerkiksi kolmea ilman vihjettä onnistunutta, toisistaan poikkeavaa tehtävävarianttia vähintään kahdessa kierroksessa; yksi oikein muistettu luku ei riitä. Tämä on pelin käytännön etenemissääntö, ei tieteellisesti validoitu osaamismittari. Näytä itsenäiset onnistumiset ja avustetut suoritukset erikseen.

## 4. Satunnaistuksen fysikaaliset ehdot

Kaikilla laskutehtävillä on yhteinen generaattoridata: lähtöarvot, kuva, oikeat vastaukset, toleranssit, vihjeet ja ratkaisuvaiheet tuotetaan yhdestä mallista. Näyttöarvoja ei arvota erikseen laskennan arvoista. Välivaiheita ei pyöristetä jatkolaskentaan.

| Tilanne | Alustava arvoalue / rajoite |
| --- | --- |
| Perusmassat | Tavallisesti 5–120 kg; autolle ja tankkerille oma mittakaava. Yksiköt ja tarkkuus näkyviin. |
| Kulmat | Tavallisesti 10–50°. Ei lähelle 0°/90° johtavia epävakaita käänteislaskuja alkuvaiheeseen. |
| Hissi | a välillä −3…+3 m/s²; N/T pysyy positiivisena. Kiihtyvyyden suunta ja nopeuden suunta erotetaan. |
| Vino veto | Valitse m, F, θ niin, että N = mg − F sin θ > 0. Työnnössä N = mg + F sin θ. |
| Liikekitka | μk esimerkiksi 0,05–0,50. Kappale ilmoitetaan liukuvaksi, jolloin lähtökitkarajaa ei tarvitse ylittää kyseisellä hetkellä. |
| Lepokitka | μs > μk. Levossa ulkoinen voima määrää kitkan rajaan asti; kaltevan tason lepotehtävässä μs ≥ tan θ tai tasapaino annetaan lähtöoletuksena. |
| Hihnat pystykulmilla | Valitse m, α₁, α₂. T₁ = mg sin α₂ / sin(α₁+α₂), T₂ = mg sin α₁ / sin(α₁+α₂). Varmista ΣFx = 0 ja ΣFy = 0. |
| Hinaus mäkeen | Tmax > mg sin θ, jos vaaditaan kiihtymistä ylöspäin. Muuten vastaus on ”annetuilla ehdoilla mahdoton”, ei negatiivinen kiihdytysaika. |
| Kiihdytys/jarrutus | Δv/a > 0. Muunna km/h jakamalla 3,6:lla. Kysytty etumerkki tai itseisarvo täsmennetään. |
| Pystyheitto | v₀ esimerkiksi 5–20 m/s, y₀ = 0. Kysytty t välillä 0…2v₀/g. Mukaan sekä nousu- että laskuvaiheita. |
| Paloittainen v(t) | Nousevat ajat, rajattu määrä taitepisteitä, nollakohdat ratkaistaan tarkasti. Älä kysy yksikäsitteistä hetkellistä kiihtyvyyttä terävässä taitekohdassa. |
| Kaareva v(t) | Kaari määritellään tunnetulla funktiolla. Jos kysytään numeerista pinta-alaa tai tangenttia, funktion on annettava riittävät tiedot; pelkkää epätarkkaa kuvaa ei pisteytetä tarkkana laskuna. |
| Kuvaajan asteikko | Akselien suureet ja yksiköt, nollataso ja luettavat välit. Ei arvoa vastaavan pisteen peittäviä selitteitä. |
| Mittausharjoitus | Vaihtoehtoisesti ideaalinen tai nimetty synteettinen mittausdata. Mahdollisen hajonnan ja pyöristyksen vaikutus huomioidaan toleransseissa. |

g = **9,81 m/s²** näkyy tehtävässä tai pysyvässä kaavatuessa. Satunnaisuus voidaan toistaa siemenluvulla virheen selvittämiseksi. Uusi kierros saa uuden siemenen; vanhaa vastausta tai pelkkää lopputulosta ei käytetä uuden tehtävän lähtöarvona.

## 5. Vastausten tarkistaminen ja voimakuvat

- Hyväksy desimaalipilkku ja -piste, etumerkit ja tieteellinen merkintä. Estä tyhjän kentän tulkinta nollaksi; älä suorita käyttäjän syöttämää JavaScriptiä.
- Yksikkö näkyy kentän yhteydessä. Tarvittaessa oma yksikkövalinta erottaa muunnosvirheen laskuvirheestä.
- Ilmoita pyöristys tehtävässä. Ensisijainen toleranssi on puolet viimeisen pyydetyn desimaalin yksiköstä lisättynä pienellä liukulukumarginaalilla. Hyväksy myös tarkempi oikea arvo. Älä käytä kaikille tehtäville väljää prosenttirajaa.
- Jatkolaskut tehdään tarkalla arvolla. Jos oppija käyttää omaa pyöristettyä välivastaustaan, ohjeista säilyttämään laskimen tarkkuus ja tarvittaessa hyväksy ennalta laskettu perusteltu pyöristysväli.
- Monivaihetehtävässä oikeat kentät merkitään erikseen. Perustelukysymykset ja numerot näkyvät tuloksissa erillisinä; osaamista ei voi vahvistaa vain arvaamalla monivalinnat.
- Piirtämiseen käytetään SVG-pohjaista nuolityökalua: voiman nimi, suunta ja tarvittaessa kulma. Hissi, laatikko tai tason suunta on taustalla. Kynäpiirtäminen on vapaaehtoinen muistiinpano, jota ei automaattisesti arvioida.
- Automaattinen voimakuvapalaute tarkistaa nimettyjen voimien joukon ja suunnat tehtävän malliin verraten. Nuolen pituutta ei arvostella määrällisesti, ellei sitä erikseen pyydetä. Erota mallikuvalle annetut voimat ja komponenttiapuviivat.
- Puhelimella tarjotaan vetämisen lisäksi painikkeet nuolten ja suuntien valintaan. Näppäimistöllä käytettävä vaihtoehto on pakollinen.

## 6. Visuaalinen ja toiminnallinen rakenne

**Ilme:** lämmin vaalea pohja, tumma sinivihreä teksti, petrooli päävärinä, hillitty oranssi painotukseen. Selkeä typografia, väljä tehtäväkortti, isot toimintopainikkeet ja rauhalliset SVG-piirrokset. Ei ulkoisia fontti- tai kuvariippuvuuksia. WordDive toimii käyttötavan viitteenä, ei kopioitavana ulkoasuna.

**Aloitus:** ”Mitä harjoitellaan?”; jatka kierrosta, aloita lähtötaso, opi aiheittain, heikot kohdat ja koekierros. Eteneminen kertoo taitotason ja harjoitellut perheet. Ei täytettyjä mallipisteitä tai keksittyä putkea.

**Harjoittelu:** aihe ja eteneminen ylhäällä, kysymys ja dynaaminen kuva keskellä, vastaus ja ”Tarkista”, erillinen ”Vihje”. Palaute ja ”Jatka” vakioalueella. Pitkässä tehtävässä lähtöarvot ja suuntavalinta säilyvät helposti näkyvillä. Vihjeen avaaminen ei tyhjennä vastausta tai arvo tehtävää uudestaan.

**Kierroksen loppu:** mitä osaat itsenäisesti, mitä ratkoit tuella, yleisimmät virheet ja seuraava suositeltu kierros. Tallennetaan myös kesken oleva kierros. Ei pakotettua pistekilpailua, ääntä tai jatkuvaa animaatiota.

**Kaavakortit:** keskeiset yhtälöt, niiden käyttöehdot ja kuva. Avattavissa opettelussa, koekierroksella valinnan mukaan. Kaava ei yksin korvaa yhtälön muodostamista.

Saavutettavuus: näppäimistö, näkyvä fokus, selkeät kenttäotsikot, ruudunlukijan palautetekstit, riittävä kontrasti ja palautteen sanallinen muoto värin lisäksi. Kuvaajille tekstimuotoinen tietotaulukko tai vastaava kuvaus. Mobiili alkaen 360 px; huomioi zoomaus ja vähennetyn liikkeen asetus.

## 7. Ehdotettu yhden päivän harjoittelupolku

Ajat ovat muokattava ehdotus, eivät oppimistuloksen lupaus. Kokonaisuus on noin 4 h 20 min aktiivista harjoittelua ja vähintään 50 min taukoja. Jos aikaa on vähemmän, P1 ja virheiden uusintatehtävät tulevat ennen P2/P3-laajennuksia.

| Jakso | Aktiivinen aika | Sisältö / onnistumiskriteeri |
| --- | --- | --- |
| Lähtötaso | 15 min | 8–10 tehtävää. Tunnista epävarmat pääalueet. |
| Voimat ja komponentit | 50 min | NI/NII, G vs ΣF, voimakuva, hissi ja kulman määritelmä. |
| Kitka ja tasapaino | 45 min | Lepo/liikekitka, N, vino veto/työntö, mäki ja hihnat. |
| Liike ja kuvaajat | 60 min | km/h, kulmakerroin, etumerkillinen ala, matka/siirtymä, kiihdytys ja heitto. |
| Sekoitettu kertaus | 30 min | Palaa aiemmin vääriin perheisiin uusilla arvoilla. |
| Koekierros ja purku | 40 min | 12 tehtävää itsenäisesti ja virheiden läpikäynti. |
| Myöhempi paluu | 20 min | Saman illan tai koeaamun lyhyt uusintakierros. |

Pidä vähintään 10 minuutin tauko pidempien jaksojen välissä ja pidempi ruokatauko tarpeen mukaan. Pelin suositus ohjaa palaamaan tauon jälkeen uuteen tehtävään samasta heikosta taidosta, ei samaan muistettuun numeroon.

## 8. Tekniikka ja GitHub Pages

**Valinta:** buildless HTML + CSS + JavaScript. Ei palvelinta, kirjautumista, maksullisia rajapintoja, API-avaimia tai asennettavia kirjastoja. Tehtävät ja tarkistus toimivat selaimessa. Vihjeet ovat laskennallisia malleja, joten satunnaisten lukujen käsittely ei vaadi kielimallia tai verkkoyhteyttä.

**Tallennus:** versionumeroitu localStorage. Tallenna perhekohtaiset itsenäiset/avustetut tulokset, viimeiset variantit, seuraava kertaus, asetukset ja kesken oleva kierros. Selaimen tiedon tyhjennys nollaa etenemisen, eikä synkronointia kavereiden tai laitteiden välillä ole. Jos tallennus ei ole saatavilla, peli toimii istunnon muistissa ja kertoo siitä. Vain ”Nollaa edistyminen” pyytää vahvistuksen. Rajataan tallennukseen tehtävähistoria, ei henkilötietoja.

Tiedostosta avaaminen tuetaan klassisilla skripteillä; vältä tiedostoprotokollassa rajoitettua fetch-latausta ja ES-moduulien pakkoa. Etenemisen pysyvyys voi tiedostoprotokollassa vaihdella selaimittain. HTTP:n tai GitHub Pagesin kautta se testataan erikseen. Täysin offline-käyttö varmistetaan ladatulla kansiolla; verkosta ensimmäistä kertaa avattavan Pages-sivun offline-toimintaa ei luvata ilman myöhempää service worker -toteutusta.

Suunniteltu pelin rakenne (tähdellä merkityt ovat olemassa tässä suunnitteluvaiheessa):

```text
fysiikka-sprintti/
  index.html *                 nyt suunnitelmakoonti, myöhemmin pelin aloitus
  suunnitelma.css *            suunnitelman ilme
  suunnitelma.js *             kartoituksen selaus, ei pelimoottori
  README.md *
  MATERIAALIKARTOITUS.md *
  TOTEUTUSSUUNNITELMA.md *
  .nojekyll *
  css/game.css                pelin responsiivinen ilme
  js/core.js                  satunnaisuus, suureet, laskenta ja tarkistus
  js/generators-forces.js     N-perheet
  js/generators-friction.js   K-perheet
  js/generators-motion.js     L-perheet
  js/diagrams.js              SVG-kuvaajat ja voimakuvat
  js/session.js               kierrokset ja kertaus
  js/storage.js               versioitu selaintallennus
  js/app.js                   käyttöliittymän tilat
  tests/                     laskennan ja generaattorien tarkistukset
```

**Pages-julkaisu myöhemmin:** vie tämän kansion sisältö oman repositorion juureen. GitHubissa Settings → Pages → Deploy from a branch → valittu haara → `/(root)`. Toinen tuettu vaihtoehto on sijoittaa sisältö repositorion `/docs`-kansioon ja valita se julkaisulähteeksi. Pelkkä mielivaltaisen alikansion nimeäminen ei riitä Pagesin haarajulkaisulle. Kaikki resurssit suhteellisilla poluilla; ei `/assets/...`-juuripolkuja eikä SPA-uudelleenohjausriippuvuutta. Lähde: [GitHubin virallinen Pages-ohje](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

Tässä vaiheessa mitään ei julkaista, Git-repositoriota ei alusteta eikä alkuperäisiä lähdetiedostoja liitetä julkaisupakettiin.

## 9. Toteutusjärjestys

1. **Kartoitus ja suunnitelman tarkistus (tämä vaihe):** varmista laajuus, aihepainotukset ja käyttötapa.
2. **Yksi valmis pystysuora kokonaisuus:** hissi ja v(t)-tehtävä, molemmissa uusi arvonta, vihjeet, vastauksen tarkistus ja malliratkaisu. Niillä varmistetaan pelin koko toimintaketju.
3. **P1-perheet:** 17 perhettä, kaikki viikkotehtävien aihepiirit ja tarkistetut voimakuvat/kuvaajat. Harjoittelupolku ja yksikkömuunnokset.
4. **Kertaus ja koeharjoitus:** mukautuva valinta, paikallinen tallennus, itsenäisten tulosten erottelu ja kattavuusnäkymä.
5. **P2/P3 tarpeen mukaan:** täydentävät sovellukset ja valinnainen mittausosio vasta ydinsisällön jälkeen.
6. **Käyttötesti ja jakokelpoinen kansio:** mobiili, näppäimistö, matematiikka, tallennus, file:// ja projektisivun alihakemistopolku. Käyttäjä saa paikallisen valmiin kansion; julkaisu tehdään vasta erikseen pyydettäessä.

## 10. Pelin valmistumisen hyväksymiskriteerit

- Jokainen 18 viikkotehtävän päätehtävä on katettu ainakin yhdellä toimivalla perheellä lähdekartoituksen mukaisesti.
- Uudet arvot muuttavat kysymystä, kuvaa, kaikkia vihjeitä ja malliratkaisua yhdessä. Myös kysyttävä suure ja olennainen suunta vaihtelevat soveltuvissa perheissä.
- Jokaisesta generaattorista tarkistetaan paljon siemenlukuja: arvot äärellisiä, fyysiset rajoitteet voimassa, laskettavat vastaukset ja ratkaisun sijoitukset samat kuin näytetyt arvot.
- Tunnetuilla vertailutapauksilla tarkistetaan erikseen hissi, komponentit, N, kitka, hihnatasapaino, heitto ja kuvaajan etumerkilliset pinta-alat. Generaattorin omaa tulosta ei verrata vain itseensä.
- Tarkistukseen kelpaavat pilkku/piste ja tarkempi oikea vastaus. Tyhjä vastaus, väärä etumerkki, väärä yksikkö tai liian suuri virhe ei mene läpi.
- Virheestä saa ymmärrettävän palautteen. Vihje ja ratkaisu eivät kasvata itsenäisen osaamisen lukua.
- Kuvaajan nollan ylittävä siirtymä, kulman viiteakselin muutos ja paikallaan olevan laatikon lepokitka testataan erillisinä rajatapauksina.
- Kierros sisältää kattavan aihejakauman; heikot kohdat palaavat uusina tehtävinä. Tehtävän arvot eivät vaihdu vihjettä avattaessa.
- Kesken olevan kierroksen palautus, vääristynyt/vanha tallennus ja tallennuksen estävä selain käsitellään ilman kaatumista.
- Kaikki harjoittelutoiminnot ovat käytettävissä puhelimella ja näppäimistöllä. SVG:llä on sanallinen vaihtoehto.
- Sivusto toimii ilman ulkoista API:a tai CDN:ää, sekä paikallisesti että GitHub Pagesin projektipolussa. Ei selaimen virheitä tai puuttuvia resursseja.
- Kaikki painikkeet tekevät ilmoitetun asian. Osaamista tai tuloshistoriaa ei täytetä esimerkkidatalla.

## 11. Suunnitelmavaiheen toimitus

Toimitetaan luettava materiaalikartoitus, tämä toteutussuunnitelma sekä niiden itsenäinen visuaalinen koonti. Koonti ei ole pelin prototyyppi eikä sen nappeja esitetä valmiina harjoituksina. Suunnitelmavaiheen tarkistukset koskevat tiedostojen ja lähdeluettelon kattavuutta, selausnäkymän toimintaa ja staattista julkaisurakennetta; pelin hyväksymiskriteerit toteutetaan vasta rakennusvaiheessa.
