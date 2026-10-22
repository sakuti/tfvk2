# Käyttöliittymän arvio — 22.10.2026

Tämä täydentää toiminnallista puutelistaa käyttöliittymän rakenteen, visuaalisen hierarkian, säätimien ja oppimispolun osalta. Sovellusta ei ole muutettu.

## Tarkistuksen kattavuus ja näyttö

Käyty läpi etusivun, opetuksen, oman tehtävän, ratkaisun, tulosten, edistymisen, kaavojen, asetusten ja erillisen suunnitelmasivun HTML, CSS ja tapahtumankäsittely. Opetuksen vaihemerkintä ja kuvapaneelin aukiolon palautuminen on lisäksi toistettu jsdomissa; hihna-animaation tekstikoordinaatit tarkistettu generoimalla SVG.

**Päivitetty todellisen selaintarkistuksen jälkeen.** Sovellus avautui osoitteessa `http://127.0.0.1:5500/`. Käyty läpi etusivu, opetus ja ymmärryskysymys, oma monivalinta- ja laskutehtävä, väärän vastauksen palaute, voimakuvatyökalu, koko 12 tehtävän koekierros ohittamalla tehtävät, tulokset ja ratkaisukatselmukset, edistyminen, kaavat, asetukset sekä materiaalikartan yhteenveto ja haku. Molemmat teemat tarkistettiin. Näyttökoot olivat 320×568, 390×844, 768×1024, 844×390 ja 1440×900; jokainen yksittäinen näkymä ei ollut erikseen testissä kaikilla koilla. Näyttökoon väliaikainen muutos palautettiin lopuksi.

Mainitut nuoli- ja slider-ongelmat näkyvät nyt myös selaimessa. Modal mitattiin 1440 px leveässä ikkunassa 520 px levyiseksi; matalassa 844×390-koossa harjoituksen vieritettävälle sisällölle jäi 170 px korkeutta. Hihnakuvan tekstien päällekkäisyys ja kuvapaneelin käyttäjän valinnan ylikirjoittuminen varmistettiin selaimessa. Tarkistusselaimessa ei ollut suomenkielistä puheääntä, joten puheen todellinen toisto ja voimakkuuden säätö sen aikana ovat edelleen vahvistamatta. Fyysisen puhelimen näppäimistöä, Safaria, ruudunlukijaa ja 200 % selainzoomausta ei testattu.

Näyttömerkinnät: **käyttäjä** = käyttäjän ilmoitus; **koodi** = suoraan HTML/CSS/JS-toteutuksesta todettava; **DOM** = käyttöpolku toistettu DOM-simulaatiossa; **SVG** = generoitu kuvadata tarkistettu; **selain** = todettu toimivassa selaimessa; **arvio** = suunnittelua koskeva parannusehdotus. P1 = keskeinen rakenteellinen muutos, P2 = selvä käytettävyys- tai esitysongelma, P3 = viimeistely. Raportissa on **31 UI-havaintoa** sekä aiemmat toiminnalliset löydökset.

## Harjoittelun rakenne

| ID | Taso / näyttö | Puute ja vaikutus | Suositeltu muutos |
| --- | --- | --- | --- |
| UI-01 | P1 · käyttäjä, koodi | Sovelluksen päätoiminto avautuu modaalisena dialogina. Työpöydällä taustasivu sumennetaan ja harjoitus esitetään erillisenä kelluvana ikkunana. Käyttäjä kokee tämän häiritseväksi. | Harjoittelusta oma reittinäkymä sivun sisälle. Otsakkeeseen selkeä Takaisin / Tallenna ja poistu. Modaalit vain lyhyisiin vahvistuksiin. |
| UI-02 | P2 · koodi, arvio | `body`, alavalikko ja harjoitus on rajattu 520 pikselin leveyteen myös suurella näytöllä. Työpöytämediaehto muuttaa lähinnä reunoja ja välejä. Kuva ja lasku jäävät kapeaan palstaan. | Eri asettelu puhelimelle ja työpöydälle; suurella näytöllä esimerkiksi kuva/tehtävänanto ja vastaus/ratkaisu rinnakkain, leipätekstin rivipituus rajattuna. |
| UI-03 | P2 · koodi, arvio | Harjoituksen aikana sivun vieritys lukitaan ja sisältö vierii erillisessä `wizard-scroll`-alueessa kiinteän otsakkeen ja alapalkin välissä. Tämä lisää asettelun monimutkaisuutta erityisesti pienessä korkeudessa ja näppäimistön kanssa. | Oman harjoittelusivun luonteva päävieritys ja harkittu kiinnittyvä toimintopalkki. Näppäimistön peitto ja lyhyt vaakasuuntainen näyttö tarkistettava selaimessa. |
| UI-04 | P2 · koodi, arvio | Ääni ja selostus on ennen tehtävän aihetta ja pääotsikkoa jokaisessa harjoitusvaiheessa. Aputoiminto vie sisällön alusta pystysuuntaista tilaa. | Tehtävän otsikko ja tilanne ensin. Kompakti äänitoiminto otsakkeen yhteyteen tai sisällön jälkeiseen työkaluriviin. |

## Ääni, selostus ja säätimet

| ID | Taso / näyttö | Puute ja vaikutus | Suositeltu muutos |
| --- | --- | --- | --- |
| UI-05 | P2 · käyttäjä, koodi | Ääniotsikon oikea nuoli on fontin merkki `⌄`. Sen optista sijaintia ei säädetä, eikä se muutu aukiolon mukaan. Käyttäjän mukaan se näyttää liian alhaalla. | Kiinteäkokoinen SVG-chevron keskitettyyn ikonilaatikkoon; käännä se avoimessa tilassa. |
| UI-06 | P2 · käyttäjä, koodi | Äänenvoimakkuussäätimessä on vain `accent-color` ja kokomääritykset. Rata ja nuppi tulevat pääosin selaimen oletusulkoasusta. Se ei muodosta muun käyttöliittymän kanssa yhtenäistä komponenttia. | Yhtenäisesti muotoiltu rata, täyttö ja nuppi molempiin teemoihin. Säilytä natiivin range-kentän näppäimistö- ja saavutettavuustuki. |
| UI-07 | P2 · koodi | Äänenvoimakkuuden rata on vain 88 px leveä. Nykyistä prosenttiarvoa ei näytetä tekstinä. | Leveämpi säädin omalla rivillä ja näkyvä arvo, esimerkiksi 30 %. Riittävän suuri kosketusalue. |
| UI-08 | P2 · koodi, arvio | Auki oleva ääniosa koostuu yhdestä rivittyvästä flex-rivistä: äänipainike, voimakkuus, kuuntelu, pysäytys ja saatavuusteksti. Toiminnoilla ei ole selvää ryhmittelyä. | Erota palauteäänien valinta, voimakkuus ja selostuksen toisto selkeiksi riveiksi. Tarkista rivittyminen eri leveyksillä. |
| UI-09 | P2 · koodi | Pysäytä puhe näkyy opetuksessa heti, jos sopiva ääni löytyy, vaikka puhetta ei olisi käynnistetty. Käyttöliittymä ei seuraa puheen alkamista ja loppumista näkyvänä toistotilana. | Tilat valmis / puhuu / päättynyt. Näytä pysäytys vain aktiivisessa toistossa ja kerro toiston tila myös sanallisesti. |
| UI-10 | P2 · koodi | Äänenvoimakkuuden muuttaminen pysäyttää selostuksen jokaisella input-tapahtumalla. Säätimen käyttäminen katkaisee kuunneltavan sisällön. | Määritä odotettu käytös: äänen säätö mahdollisuuksien mukaan toiston aikana, tai selkeä ilmoitus ja Jatka / Kuuntele uudelleen. |
| UI-11 | P3 · koodi, arvio | Ääniasetukset ovat vain harjoituksen sisällä. Asetukset-sivulla niitä ei ole. Käyttäjä ei voi valmistella ääntä ennen harjoittelua samasta paikasta kuin teeman. | Yhteiset ääniasetukset Asetuksiin; harjoitteluun nopeat toistotoiminnot. |

## Typografia ja kuvitus

| ID | Taso / näyttö | Puute ja vaikutus | Suositeltu muutos |
| --- | --- | --- | --- |
| UI-12 | P2 · koodi, arvio | Moni toiminto, vaihemerkintä ja ohje on 9–11 px, taitokorttien otsikot 13 px ja useat selitykset 12 px. Ulkoasu painottaa pientä tekstiä, vaikka sisältöä pitää lukea tarkasti. | Nosta tärkeät ohjeet ja säätimien nimet vähintään noin 14–16 pikseliin, varsinainen leipäteksti noin 16 pikseliin. Varmista suurennus ja rivittyminen. Tämä ei ole väite automaattisesta WCAG-rikkomuksesta. |
| UI-13 | P2 · koodi | Opetuksen SVG:t skaalataan 600 yksikön leveydestä puhelimen palstaan. Esimerkiksi 19 yksikön teksti kutistuu 346 px leveydessä noin 11 pikseliin; 17 yksikön teksti noin 10 pikseliin. Laskutehtävien ei-kuvaaja-SVG:t käyttävät 720 yksikön leveyttä ja kutistuvat vastaavasti. | Responsiiviset kuvat, vähemmän kuvaan upotettua tekstiä ja keskeiset arvot luettavina HTML-elementteinä. |
| UI-14 | P2 · SVG | Hihnojen opetuskuvassa G-teksti on kohdassa x=300, y=276. Samassa kohdassa kulkee keskitetty selitys Vaakakomponentit kumoutuvat, x=300, y=275. Tekstit ovat päällekkäin. | Siirrä selitys kuvan ulkopuoliseksi kuvatekstiksi tai varaa sille oma alue; pidä voimamerkinnät nuolten yhteydessä. |
| UI-15 | P3 · koodi, arvio | Nuolissa, toistossa, tauossa ja muissa toimintomerkeissä käytetään sekaisin SVG-kuvakkeita ja fonttimerkkejä. Fonttimerkkien paino ja optinen keskitys vaihtelevat. | Yhteinen pieni SVG-kuvakejoukko ja yhdenmukaiset ikonien koot sekä kohdistus. |

## Vaiheistus ja palaute

| ID | Taso / näyttö | Puute ja vaikutus | Suositeltu muutos |
| --- | --- | --- | --- |
| UI-16 | P2 · DOM, koodi | Opetuspolun Kokeile itse -vaihe ei koskaan aktivoidu. Ymmärryskysymyksessä aktiivinen vaihe on Esimerkki, ja omassa tehtävässä koko opetuspolku on piilotettu. | Johda vaiheilmaisin samasta tilasta kuin sisältö. Anna ymmärrystarkistukselle oikea paikka ja näytä siirtyminen omaan tehtävään. |
| UI-17 | P2 · koodi, arvio | Kierroksen edistymispalkki ei liiku opetussivuilla aiheen sisällä: leveys perustuu vain aiheen indeksiin. Usean opetussivun eteneminen ei näy tässä palkissa. | Erota aiheen sisäinen eteneminen ja kierroksen tehtävämäärä selvästi tai laske opetussivut mukaan palkkiin. |
| UI-18 | P2 · koodi, arvio | Tehtävän koko tilanne toistetaan jokaisella vastausvaiheella. Ratkaistun esimerkin koko tehtävänanto toistuu jokaisella ratkaisusivulla. Vaiheenvaihto siirtää vierityksen alkuun. | Säilytä tehtävänanto helposti saatavana mutta tiivistettynä; pidä nykyinen kysymys ja vastaus visuaalisesti etusijalla. |
| UI-19 | P2 · DOM, koodi | Tilannekuva ja taulukko -osion itse valittu aukiolo ei säily. N04-tehtävässä käyttäjän sulkema kuva avautui uudelleen vastauksen tarkistuksessa. | Tallenna käyttäjän valinta tehtäväkohtaisesti ja muuta sitä automaattisesti vain perustellussa siirtymässä. |
| UI-20 | P3 · koodi | Tutustuminen on merkitty 1 · Tutustu tilanteeseen, mutta ensimmäinen vastausvaihe alkaa uudelleen numerosta 1 / N. Numerot kuvaavat eri asioita lähes samassa paikassa. | Käytä johdonmukaista vaiheistusta tai jätä tutustumisen numerointi pois. |
| UI-21 | P2 · koodi | Ohita koko tehtävä aloittaa oppimistiloissa malliratkaisun ensimmäisestä vaiheesta. Käyttäjä joutuu edelleen etenemään ratkaisuvaiheiden läpi päästäkseen seuraavaan tehtävään. | Erota Ohita tehtävä ja Katso ratkaisu. Painikkeen nimen tulee kuvata välitön lopputulos. |
| UI-22 | P3 · koodi, arvio | Valmistuneen tehtävän pääotsikko on Hyvä, jatketaan eteenpäin myös suoraan katsotun ratkaisun jälkeen. Kierroksen otsikko on Kierros ratkaistu myös kokonaan ohitetun kokeen jälkeen. Tarkemmat tilat ovat alempana. | Käytä tulosta vastaavia neutraaleja otsikoita ja erota itsenäinen ratkaisu, tuettu ratkaisu ja katsottu ratkaisu jo pääviestissä. |

## Muut näkymät ja navigaatio

| ID | Taso / näyttö | Puute ja vaikutus | Suositeltu muutos |
| --- | --- | --- | --- |
| UI-23 | P2 · koodi, arvio | Puhelimella yläpalkin Jatka-painike piilotetaan kokonaan. Edistymisestä, kaavoista ja asetuksista pitää palata etusivulle jatkamaan tehtävää. | Yhtenäinen, helposti löydettävä Jatka harjoittelua -toiminto myös näissä näkymissä. |
| UI-24 | P3 · koodi, arvio | Edistymislistassa korostuvat sisäiset tunnisteet kuten N06 ja suoritusmäärät. Opetuksen katsominen ei näy taitorivillä, eikä käyttöliittymästä suoraan erotu katsomaton opetus ja kokeilematon tehtävä. | Näytä oppijalle merkitykselliset tilat: opetus käyty, harjoittelu aloitettu, itsenäisesti onnistuttu, vahvistettu. Tunnisteet tarvittaessa lisätietoihin. |
| UI-25 | P2 · koodi, arvio | Materiaalikartta vaihtaa vanhaan vihreään suunnittelukäyttöliittymään, joka ei noudata pelin teemaa. Käyttöohje avautuu Markdown-tiedostona. Polku tuntuu siirtymältä eri tuotteeseen. | Pelaajalle tarkoitettu materiaalinäkymä ja luettava käyttöohjesivu yhteiseen ulkoasuun. Alkuperäinen suunnitelma erikseen nimettyyn dokumentaatioon. |

## Selaimessa löytyneet lisäpuutteet

| ID | Taso / näyttö | Puute ja vaikutus | Suositeltu muutos |
| --- | --- | --- | --- |
| UI-26 | P2 · selain | 320 px leveydessä Edistyminen-näkymän Viikkotehtävien ydin -valinta katkeaa. Voimakuvan suuntavalikossa Kohtisuoraan kaltevasta tasosta ulos katkeaa myös 390 px leveydessä. Käyttäjä ei näe koko valitsemaansa arvoa suljetusta valikosta. | Anna valinnalle koko rivin leveys tai näytä valittu suunta myös rivittyvänä tekstinä. Käytä lyhyempiä nimiä, jos niiden merkitys säilyy. |
| UI-27 | P3 · selain, koodi | Hihnamallissa on Toista/Tauko, Alusta ja aikajana, vaikka ajan siirtäminen ei muuta mallin kuvaa tai lukuarvoja. Myös osa muista malleista on ajasta riippumattomia. Säätimet lupaavat animaation, jota ei näy. | Näytä toistosäätimet vain ajassa muuttuvissa malleissa. Staattisessa mallissa pidä vain ilmiötä muuttava parametrisäädin. |
| UI-28 | P2 · selain | Voimakuvan ratkaisukatselmuksessa näytetään kaksi tilannekuvaa: ensin kuva ilman nuolia ja selite ei vielä valittuja voimia, sitten oikea voimakuva. Ensimmäinen kuva ei esitä käyttäjän vastauksia, joten vertailun tarkoitus jää epäselväksi. | Näytä nimetty Oma voimakuva / Mallin voimakuva -vertailu tai vain ratkaisuun tarvittava kuva. |
| UI-29 | P2 · selain, koodi | Nopeuskuvaajan harjoituksessa on mahdollisuus lukea pisteet tekstitaulukkona, mutta tulosten ratkaisukatselmuksessa vastaavaa taulukkoa ei ole. Kuvaajan vaihtoehtoinen esitystapa katoaa siinä vaiheessa, kun omaa ratkaisua pitäisi tarkistaa. | Käytä samaa saavutettavaa kuvaaja- ja taulukkokomponenttia harjoituksessa ja tuloksissa. |
| UI-30 | P2 · selain | Siirry sisältöön -linkki käyttää hashia #main, jonka reititys tulkitsee tuntemattomaksi näkymäksi ja vaihtaa etusivulle. Asetukset-näkymästä linkin Enter-aktivointi avasi etusivun. Sama tapahtuu suunnitelmasivulla: tehtäväperheistä siirrytään yhteenvetoon. | Siirrä fokus nykyisen näkymän sisältöön muuttamatta näkymäreittiä; tai käsittele ohitusankkuri erikseen reitittimessä. |
| UI-31 | P2 · selain, koodi | Pelkästään ohitettu taito merkitään Harjoiteltu tuella, vaikka rivillä lukee 0 itsenäisesti / 0 tuella. Toistossa K01 näytti 0 itsenäisesti / 0 tuella / 2 harjoitusta ja silti Harjoiteltu tuella. | Erota yritetty/ohitettu/väärin mennyt ja oikeasti tuella ratkaistu taito. Tilatekstin tulee vastata sen vieressä näkyviä lukuja. |

## Aiemmat toiminnalliset löydökset, jotka vaikuttavat myös UI:hin

- Uusi harjoitus korvaa vanhan ilman yhteistä varoitusta kaikissa aloituskohdissa.
- Koekierroksen piste- ja onnistumislaskurit paljastavat tietoa ennen loppupalautetta.
- Kaavat-näkymän avaaminen voi muuttaa tauolla olevan tehtävän tuetuksi ilman tapahtumakohtaista ilmoitusta.
- Tyhjän vastauksen tarkistus kuluttaa itsenäisen onnistumisen mahdollisuuden.
- Usean välilehden tallennuksista puuttuu ristiriitojen käsittely.
- Koekierrokselta puuttuu aiempien tehtävien tarkistus ennen palautusta.
- Käyttöliittymässä näkyy vain 10 tallennetusta 30 kierroksesta.
- Aktiivinen sisältörajaus on piilossa lisävalinnoissa.
- Etusivun eri mittarit käyttävät 17 ja 33 taidon kokonaisuuksia.
- Materiaalikartassa on vanhentuneita toteutuksen tilaa kuvaavia tekstejä.

## Suositeltu korjausjärjestys

1. Harjoittelusta oma sivunäkymä ja sille puhelimen sekä työpöydän asettelut. Samaan työhön poistumisen, jatkamisen ja tallennuksen selkeys.
2. Äänikomponentin uudistus: nuoli, ryhmittely, leveä säädin, prosentti ja todellinen toistotila.
3. Tekstikoot, kuvituksen luettavuus ja hihnakuvan päällekkäinen teksti.
4. Opetuksen vaiheindikaattori, eteneminen, kuvapaneelin tilan säilytys ja ohittamisen toiminta.
5. Edistymisen, tulosten, materiaalien ja käyttöohjeen viimeistely.

Ennen UI:n hyväksymistä tarvitaan vielä fyysisen puhelimen ja virtuaalinäppäimistön testaus, Safari, 200 % selainzoomaus, kattava ruudunlukijatesti ja selostuksen todellinen toisto suomalaisella puheäänellä. Näppäimistöstä tarkistettiin kohdennetusti mm. ohituslinkki ja animaation aikajanan ohjaus; tämä ei ole täydellinen saavutettavuusauditointi. Tehtävien ohittaminen koekierroksessa testasi näkymät ja loppuyhteenvedon, ei kaikkien vastausten oikeellisuutta. Konsolin virhe-/varoitushaku ei palauttanut merkintöjä tarkistushetkellä.

## Todennus

- Kohdennettu DOM-tarkistus: `node .qa/ui-audit.cjs` projektin yläkansiosta. Tämä on auditoinnin apuskripti, ei osa julkaistavaa peliä.
- Kokeen tulos: ymmärryskysymyksen aktiivinen vaihe oli Esimerkki; omassa tehtävässä vaihepolku katosi; N04:n suljettu kuvapaneeli avautui uudelleen tarkistuksessa; äänenvoimakkuudella ei ollut näkyvää output-arvoa eikä ääniasetuksia löytynyt Asetukset-näkymästä.
- Hihnamallin SVG: G `(300, 276)` ja selityksen keskikohta `(300, 275)`.
- Lähdekohdat: `index.html` 51–70; `css/game.css` 5–22; `js/app.js` 25–31, 142–178, 196–219, 243, 265–266, 280–288, 305–307, 325–328; `js/lessons.js` 71–73 ja 90–103.

### Selaimen kuvakaappaukset

Kuvat ovat projektin `.qa/ui-kuvat/`-kansiossa. Julkaistavan pelin tiedostoja ei muutettu.

- `01-modal-tyopoyta.jpg`: 520 px harjoitusmodal 1440×900-ikkunassa.
- `02-opetus-puhelin.jpg`: opetusnäkymä 390 px leveydessä.
- `03-edistyminen-puhelin.jpg`: edistymisnäkymän hierarkia ja taitokortit.
- `04-hihnat-paallekkainen-teksti.jpg`: hihnakuvan tekstit ja toistosäätimet.
- `05-kuvaaja-puhelin.jpg`: kuvaajatehtävän vastausvaihe.
- `06-ratkaisukatselmus.jpg`: ratkaisukatselmuksen rakenne.
- `07-voimien-suuntavalinta.jpg`: katkeava voimansuuntavalinta.
- `08-aanipaneeli.jpg`: ääniotsikon nuoli ja äänenvoimakkuussäädin, rajattu komponenttiin.

Selaimessa varmistuivat erityisesti myös UI-01, UI-02, UI-03, UI-05–08, UI-12–14, UI-16–20, UI-22–25. UI-09–10:n puhetoiminnan havainnot perustuvat edelleen toteutuksen tarkistukseen, koska suomenkielistä ääntä ei ollut saatavilla.
