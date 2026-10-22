# Toteutettu versio 1.3

Päiväys: 22.10.2026. Peli avataan `index.html`-tiedostosta. Alkuperäinen suunnitelmasivu on säilytetty nimellä `suunnitelma.html`. Julkaisua, Git-repositorion alustusta tai pushia ei ole tehty.

## Puhelin ja PWA (versio 1.3)

Mallikuvan suuntaan tehty mobiiliulkoasu: hiilenharmaa #202023, pyöristetyt hieman vaaleammat kortit, laventelin sävyinen korostus ja paikallinen vaihtelevapainoinen Manrope-fontti. Fontin alkuperäinen tiedosto ja OFL-lisenssi ovat mukana. Kuvakkeet ovat omia SVG-kuvioita sekä asennusta varten tuotettuja PNG-versioita. Neljän kohteen alavalikko korvaa sivupalkin. Myös työpöydällä säilyy rauhallinen yhden sarakkeen sovellusleveys.

Etusivun kaari laskee oikeasti vahvistetut P1-taidot / 17. Katsotut opetukset, harjoitellut taidot ja itsenäiset onnistumiset erotellaan. Puhelimessa opetusdialogi täyttää näytön, ylä- ja alareunan turva-alueet huomioidaan ja jatkamispainike pysyy alareunassa. Visual Viewport -tapahtumat sopeuttavat korkeutta näppäimistöön. Laskuissa on desimaalinäppäimistö ja ±-painike. Ääniasetukset avautuvat yhden rivin alta. Leipätekstin ja apuvärien kontrasti tarkistetaan molemmissa teemoissa suhteessa taustaan ja kortteihin (vähintään 4,5:1).

`manifest.webmanifest` määrittää paikallisen sovellustunnisteen ja alikansioscopen, itsenäisen sovellusikkunan, sovellusvärit ja 192/512 pikselin sekä maskable-kuvakkeet. Apple touch -kuvake on 180 pikseliä. `js/pwa.js` rekisteröi palvelutyöntekijän vain HTTPS- tai localhost-osoitteessa. Asennus käynnistetään käyttäjän painalluksesta, ja iPhoneen näytetään Safari-ohje. `file://` säilyy pelattavana ilman PWA-asennusta.

`sw.js` esilataa pelin resurssit, fontin, kuvakkeet ja materiaalikartan yhtenä asennuksena. Pelin offline-resurssit ovat cache-first-strategialla: vain nimetyt oman alkuperän resurssit käsitellään. Sivun juuriosoite ja index.htmlin kyselyparametrit käyttävät samaa tallennettua aloitussivua. Tuntemattomia osoitteita, ulkopuolisia pyyntöjä tai POST-pyyntöjä ei käsitellä. Välimuistin nimitila on alikansiokohtainen. Uusi versio odottaa käyttäjän hyväksymää päivityspainallusta ja avointa harjoitusta pyydetään sulkemaan ennen sitä. Tallennusavainta ei vaihdettu; oppimistiedot säilyvät.

PWA-testit ajavat install/activate/fetch/message-ketjut VM-ympäristössä ja varmistavat kaikki nimetyt resurssit sekä juurihakemistossa että GitHub Pagesin alikansiossa. Asennus-, virhe- ja päivityskäyttöliittymä testataan DOM-simulaatiossa. Tämä ei korvaa fyysisen iPhonen tai Androidin asennustestiä eikä oikean selaimen visuaalista tarkistusta; jäljempänä kuvattu ympäristön rajoitus on edelleen voimassa. Julkaisua ei ole tehty.

## Opetus ennen harjoittelua (versio 1.2)

Oppimis- ja aihetilassa uusi taito alkaa opetuksesta. Polku on havainto ja säädettävä havainnollistus, periaate, saman tehtäväperheen ratkaistu esimerkki vaiheittain, ymmärryskysymys ja oma tehtävä eri luvuilla tai tilanteella. Esimerkin sisällön ero omaan tehtävään varmistetaan generaattorin varianttitunnisteella. Opetuksen ja esimerkin aikana oman tehtävän vastauskentät ovat piilossa.

Kaikki 33 tehtäväperhettä on liitetty yhteen 15 visuaalisesta perusmallista. Sovellusten omat ratkaisuesimerkit tulevat perheen generaattorista. Voit säätää muun muassa voimaa, kiihtyvyyttä, kulmaa, massaa tai alkunopeutta. Animaatiot sisältävät liikkuvia kappaleita, voima- ja nopeusnuolia sekä kuvaajan kanssa synkronoitua liikettä ja kertyvää etumerkillistä pinta-alaa. Osa malleista, kuten komponenttikolmio ja mittauskuvaaja, reagoi vain säätimeen. Toisto alkaa kitkamalleissa levosta; vinon voiman esimerkissä laatikko liukuu jo oikealle. Oletukset ja yksiköt ovat opetustekstissä. Play/tauko, alusta ja aikajana ovat käytettävissä. Vähennetty liike aloittaa tauolta. Sulkeminen ja sivunvaihto lopettavat animaation ajastuksen.

Opetuksen ymmärryskysymys antaa selityksen myös väärälle valinnalle ja odottaa oikeaa ajatusta ennen omaa tehtävää. Se ei kirjaa suoritusta. Katsotut opetukset ovat omassa `lessons`-tilassaan: ei XP:tä, harjoitusyritystä tai itsenäisen osaamisen kasvua. Uuden kierroksen valinta etenee ensin katsomattomissa taidoissa perusteista alkaen. Koetila, lähtötaso ja heikkojen kohtien kertaus eivät avaa opetusta automaattisesti. Opetuksen uusinta säilyttää luonnoksen ja paluuvaiheen; kesken oman vastauksen avattu opetus merkitsee tuen käytön.

`js/lessons.js` sisältää perusmallit, SVG-havainnollistukset ja opetussivut. `js/media.js` tuottaa lyhyet pehmeät palauteäänet Web Audio -rajapinnalla. AudioContext luodaan vasta käyttäjän kytkettyä äänet päälle. Oletus on mykistetty, voimakkuus säädettävä. Puhe käyttää vain selaimen ilmoittamaa paikallista suomenkielistä puheääntä ja vain Kuuntele-painalluksesta; saatavuus tarkistetaan ja puuttuminen selitetään käyttöliittymässä. Puhe ei ole ennalta tuotettu äänitiedosto eikä sen saatavuutta voi luvata kaikilla laitteilla. Mykistys ja näkymän sulkeminen pysäyttävät puheen. Ääniä tai puhetta ei haeta verkosta.

Tallennusmuoto on edelleen versio 1. Vanhat suoritukset säilyvät, puuttuvat opetus- ja ääniasetukset saavat oletusarvot. Kesken vastatun vanhan tehtävän päälle ei avata opetusta automaattisesti. Myös keskeneräisen opetuksen vaihe ja säädin säilyvät.

## Vaiheikkuna (versio 1.1)

Harjoittelu käyttää vaiheittaista HTML-dialogia, joka on puhelimessa koko näytön kokoinen ja työpöydällä keskitetty. Muut harjoittelutavat ovat etusivulla avattavan lisävalinnan takana.

1. Tutustu tehtävän tilanteeseen ja kuvaan.
2. Ratkaise yksi alakohta kerrallaan. Lähtötilanne on samassa ikkunassa; kuvaajan tai voimakuvan saa tarvittaessa näkyviin.
3. Tarkista kyseinen vaihe. Väärä vastaus pitää käyttäjän samassa kohdassa, oikea vastaus avaa Jatka-painikkeen. Tehtävä kirjataan vain kerran, kun kaikki kohdat on ratkaistu.
4. Koetilassa jokainen kohta tallennetaan erikseen, mutta oikeellisuus paljastuu vasta kierroksen lopussa. Aiempiin kohtiin voi palata muokkaamaan vastausta.
5. Malliratkaisu etenee yksi lasku-/selitysvaihe kerrallaan samassa ikkunassa.

Vihjeet ja kaavatuki ovat saman keskitetyn sisällön yhteydessä. Viimeisin vihje on avattuna; aiempiin voi palata avaamalla ne. Toimintopainikkeet pysyvät ikkunan alareunassa. Pitkä sisältö vierii ikkunan sisällä. Native dialog tarjoaa selaimessa modaalisen fokuksen ja taustan eristämisen. Rasti ja Esc tallentavat vaiheen ja sulkevat harjoituksen. Tallennusmuoto säilyttää myös aiemman version suoritukset ja keskeneräiset vastaukset; puuttuva vaihetila alustetaan avattaessa.

Vaiheikkunan toiminta, kaikki 33 tehtäväperhettä ja vanhan tallennuksen palautus tarkistetaan DOM-testeissä. Todellisen selainrenderöinnin rajoitus on edelleen voimassa, kuten alla kuvataan.

## Toimitettu sisältö

Kaikki **33 suunniteltua tehtäväperhettä** on toteutettu. Oletusrajaus on 17 P1-perhettä eli viikkotehtävien ydin. Sisältövalinta ”Kaikki materiaalit” tuo mukaan 13 P2-sovellusta ja 3 P3-mittausperhettä. Yksittäisen perheen voi valita Osaamiseni-sivulta.

| Kokonaisuus | Toteutetut tunnisteet | Huomio |
| --- | --- | --- |
| Voimat | N01–N15 | Käsitteet, tasapaino, Newton III, voimakuva, G/ΣF/m, hissi, tankkeri, laskuvarjo, komponentit, kalteva taso, hihnat, ripustus, mäen massa, maskotti ja nurkan tukivoimat. |
| Kitka | K01–K06 | Lepokitkan raja, todellinen lepo-/liikekitka, työntö ja irrotus, ylä-/alaviisto voima, liukukulma, kitkajarrutus ja hinaus mäkeen. |
| Liike | L01–L09 | Yksiköt, keskinopeus/keskivauhti myös osamatkojen aikojen kautta, x(t), etumerkillinen v(t), kaareva v(t), a(t), tasainen kiihdytys/jarrutus, pystyheitto ja pysähtymismatka. |
| Mittaus | M01–M03 | Ideaalinen vetokoe, toistomittausten keskiarvo ja punnuksen jännitys sekä raportin akselit/yksiköt/kaavasijoitus. |

Alkuperäinen 18 viikkotehtävän kattavuustaulukko on `MATERIAALIKARTOITUS.md`:ssä. Erityisesti VT4/3:n hihnoista on sekä jännitykset massasta laskeva että kuorman massan jännityslukemista ratkaiseva variantti. VT3/6:n tunnettu kitkavoima ja VT4/5:n kitkakertoimesta laskettava kitka ovat saman K03-perheen eri variantteja. Voimakuvissa harjoitellaan myös sekä yläviistoa vetoa että alaviistoa työntöä.

## Toimiva oppimisketju

- Tehtävän siemenluku määrää lähtöarvot, valinnat, kuvan, oikeat vastaukset, kolme vihjettä ja malliratkaisun. Vihjeen avaaminen ei arvo tehtävää uudelleen.
- Laskuja ja perusteluvalintoja käytetään rinnakkain. Kentät tarkistetaan erikseen; virheestä saa etumerkkiin, yksiköihin tai malliin ohjaavan palautteen.
- Kaavatuki toimii oppimistilassa. Koekierroksella vihjeet, malliratkaisut ja kaavatuki on suljettu kierroksen loppuun asti.
- Oppimis- ja kertauskierros sisältää 8 tehtävää, lähtötaso 9 ja koekierros 12. Kertaamisessa ja testikierroksilla pääaiheet vuorottelevat. Uusien opetusten kierros etenee pedagogisessa järjestyksessä. Heikkojen kohtien tilassa epävarmat ja aiemmin väärin menneet taidot saavat suuremman valintapainon.
- Tukea tarvinnut perhe voidaan lisätä uusilla arvoilla kolmen muun tehtävän päähän. Enintään kaksi tällaista uusintaa kierroksessa; koetilassa ja lähtötasolla ei lisäyksiä.
- Itsenäinen, tuettu ja suoraan katsottu ratkaisu erotellaan. Vahvistukseen lasketaan tehtävän sisällöstä tunnistettuja eri variantteja; pelkkä eri siemen tai vastausjärjestys ei riitä.
- localStorage sisältää versioidun tilan, luonnokset, saman keskeneräisen tehtävän, osaamisen ja 30 viimeisen kierroksen ratkaisuhistorian. Kokonaiskierrosmäärä säilyy myös historian vanhimpien kierrosten poistuessa.
- Tallennuksen estyminen ei pysäytä harjoittelua. Virheellinen tai eri version tallennus palautuu tyhjään toimivaan tilaan.

## Kuvitus ja saavutettavuus

Kuvaajat ja tilannekuvat ovat omia SVG-kuvioita. Kuvaajan koordinaatisto piirretään tehtäväkortin leveyden mukaan, jotta akselitekstit eivät vain kutistu puhelimella. Kuvaajan tarkat taitepisteet saa tekstitaulukkona laskutehtävissä; kaarevan v(t):n laadullisessa tehtävässä osien rajat ja muoto kerrotaan myös tekstissä. Funktiotehtävissä tarkka yhtälö on tehtävätekstissä.

Voimakuvatyökalu käyttää nimettyjä voimia ja suuntavalikoita: se toimii kosketuksella ja näppäimistöllä. Valitut nuolet piirretään näkyviin, ja voimien joukko sekä suunnat tarkistetaan malliin. Nuolten pituutta tai vapaata käsialaa ei pisteytetä. Tämä toteuttaa suunnitelman rakenteisen voimakuvatyökalun; erillistä vapaapiirtocanvasta ei ole.

Lomakkeissa on kenttäryhmät, radioryhmät, yksiköt, näkyvä näppäimistöfokus, sanallinen palaute ja ruudunlukijan palautteet. Sivunvaihto kohdistaa fokuksen otsikkoon. Vähennetyn liikkeen asetus huomioidaan. Responsiiviset tyylit on tehty työpöydälle ja puhelimelle, mutta todellisen selaimen visuaalista tarkistusta koskee alla oleva rajoitus.

## Tekniikka

Peli on buildless HTML/CSS/JavaScript. Ei ulkoisia data-API-kutsuja, ES-moduulipakkoa, CDN:ää, ulkoa ladattavia fontteja, API-avaimia tai sovelluspalvelinta. PWA:n palvelutyöntekijä lataa oman staattisen julkaisun tiedostot offline-välimuistiin. Käyttäjän lukusyötettä ei suoriteta koodina. Kaikki polut ovat suhteellisia, ja `.nojekyll` on mukana. Alkuperäiset PDF:t ja kuvat eivät ole pelin riippuvuuksia eivätkä mukana julkaistavassa kansiossa.

`js/core.js` hoitaa satunnaisuuden, lukutulkinnan, toleranssit ja yhteisen tarkistuksen. Neljä `generators-*.js`-tiedostoa tuottaa tehtävät. `diagrams.js` piirtää kuvat, `session.js` käsittelee kertauksen ja tallennuksen, `app.js` käyttöliittymän ja `css/game.css` ulkoasun.

## Tarkistukset

Testit ajetaan Noden sisäänrakennetulla testiajurilla. DOM-testit käyttävät jsdom 29.1.1:tä vain kehitystyökaluna, eivät pelin riippuvuutena.

- **500 siemenlukua jokaiselle 33 perheelle (16 500 tehtävävarianttia):** toistettavuus, äärelliset luvut, vaihtoehtojen yksikäsitteisyys, omien täsmällisten ja pyöristettyjen vastausten hyväksyntä sekä SVG:n kelvolliset koordinaatit.
- **Vertailutapaukset:** hissin tukivoima, vino veto ja kitka, pystyheiton laskuvaihe sekä etumerkillinen pinta-ala ja kuljettu matka. Näissä on ennalta laskettu vertailutulos.
- **Fyysiset ehdot:** 1 000 siementä hihnatasapainolle, kontaktin säilymiselle, kitkarajalle ja heiton aikarajalle. Komponenttien suunnat ja vaaka-/pystykulmat tarkistetaan erikseen.
- **Kierrokset ja tallennus:** aiheiden kattavuus, uudelleen arvottu kertaus, tuetun suorituksen erottelu, osaamisvariantit, keskeneräisen tehtävän palautus, koetilan tulokset ja viallinen/estetty tallennus.
- **DOM-käyttöliittymätestit:** kaikki 33 perhettä aloitetaan ja ratkaistaan lomakkeiden kautta. Lisäksi väärä vastaus ja kolme vihjettä, sivun uudelleenavaus, 12 tehtävän koekierros loppuun, ratkaisuhistorian palautus, malliratkaisun katsominen, kaavatuki, file-protokolla ja nollauksen vahvistus.
- **Staattinen julkaisu:** paikalliset resurssit, yksilölliset HTML-tunnisteet, alihakemiston URL-polut, `.nojekyll` sekä verkko- ja koodinsuoritusriippuvuuksien puuttuminen pelimoottorista.

Version 1.3 kokonaisajo: **46 testiä, 46 hyväksyttyä, 0 hylättyä**. Mukana ovat PWA:n offline-resurssit ja alikansiopolut, cache-eristys, asennus ja päivitys, paikallinen fontti, värikontrasti, mobiilinäppäimistön etumerkki sekä todellisiin suorituksiin perustuva edistymiskaari. Uudet tarkistukset kattavat kaikkien 33 taidon opetuksen ja erillisen esimerkin, 15 mallin säädinrajat, fysiikan vertailukohdat, ymmärryskysymyksen, opetuksen palautuksen, vähennetyn liikkeen sekä äänten opt-in- ja paikallisen puheen ehdot. Kaikkien 33 perheen vaiheittainen ratkaiseminen, Esc/sulkeminen, vaiheeseen palaaminen, vanha tallennus ja pysyvä teemavalinta sisältyvät testeihin. Tumma teema on oletus; vaihto vaaleaan säilyttää kesken olevan tehtävän. SVG-kuvioiden värit seuraavat samaa teemaa CSS-muuttujilla.

Version 1.0 hyväksytty kokonaisajo 22.10.2026: **27 testiä, 27 hyväksyttyä, 0 hylättyä**. Vaiheikkunan testit ovat tämän jälkeen laajentuneet. Kaikkien kahdeksan peliskriptin JavaScript-syntaksi tarkistettiin myös erikseen. Kehittäjän komennot ovat README-tiedostossa.

### Todellisen selaintarkistuksen rajoitus

Edellisen suunnitteluvaiheen paikallinen selainavaus estyi ympäristön URL-käyttöpolitiikkaan, ja paikallisen HTTP-osoitteen tarkistus estyi verkkorajoitukseen. Tätä rajoitusta ei kierretty toisella selainohjausmenetelmällä. Käyttöliittymän tapahtumaketjut testattiin jsdomin DOM-simulaatiossa, joka ei tee visuaalista renderöintiä.

Siksi äänten todellista kuuluvuutta ja laatua, puhesynteesin käytännön toimintaa, ulkoasua, tekstien todellista rivittymistä, mobiililaitteen kosketuskäyttöä, ruudunlukijaa, todellista GitHub Pages -julkaisua tai fyysisen puhelimen PWA-asennusta ei ole vahvistettu selaimessa. Ulkoasu tarkistetaan avatusta `index.html`:stä; PWA-asennus ja offline-käyttö tarkistetaan erikseen julkaistusta HTTPS-osoitteesta. Julkaisuun ei ole tehty ulkoisia muutoksia.

## Käytännön rajat

Tarkkaa koerajausta ei ole saatu; ydin noudattaa viikkotehtäviä 3–5. Peli opettaa alkuperäisen paikallaan olevan kaltevan tason laatikon kitkan lepokitkana. Hihnojen käänteisvariantin annetut jännityslukemat ovat näkyvästi pyöristettyjä, ja sen laskenta käyttää juuri näitä lukemia. Mittausdata on nimetty synteettiseksi harjoitusdataksi.

Koetilan 30 minuutin aika on vapaaehtoinen tavoite, ei automaattinen aikakatkaisu. Osaamistaso on käytännön harjoittelusääntö eikä validoitu arvio koemenestyksestä. Käyttäjätilejä, kavereiden tulostaulua, laitteiden synkronointia ei ole. Offline-välimuisti palvelutyöntekijällä on mukana versiosta 1.3 alkaen. Ladattu kokonainen kansio toimii ilman verkkoyhteyttä.
