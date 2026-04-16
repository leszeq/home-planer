export interface DocumentTemplate {
  id: string
  title: string
  description: string
  content: string
}

export const DOCUMENT_TEMPLATES: DocumentTemplate[] = [
  {
    id: 'umowa-roboty-budowlane',
    title: 'Umowa o roboty budowlane (Generalny Wykonawca / Wykonawca SSZ)',
    description: 'Klasyczna umowa na wykonanie stanu surowego lub pod klucz z ustaleniem kar umownych i harmonogramu.',
    content: `
UMOWA O ROBOTY BUDOWLANE
zawarta w dniu [DATA] w [MIEJSCOWOŚĆ] pomiędzy:

[IMIĘ I NAZWISKO INWESTORA], zamieszkałym w [ADRES], PESEL: [PESEL], legitymującym się dowodem osobistym nr [NR DOWODU], zwanym dalej "Inwestorem",

a

[NAZWA FIRMY WYKONAWCY], z siedzibą w [ADRES FIRMY], NIP: [NIP], REGON: [REGON], reprezentowaną przez [IMIĘ I NAZWISKO REPREZENTANTA], zwanym dalej "Wykonawcą".

§ 1. PRZEDMIOT UMOWY
1. Inwestor zleca, a Wykonawca przyjmuje do wykonania roboty budowlane polegające na: [DOKŁADNY OPIS PRAC, np. budowa domu jednorodzinnego w stanie surowym zamkniętym] w oparciu o projekt budowlany stanowiący Załącznik nr 1 do niniejszej umowy.
2. Prace będą realizowane na działce nr [NUMER DZIAŁKI], położonej w [MIEJSCOWOŚĆ], dla której prowadzona jest księga wieczysta nr [NUMER KW].

§ 2. TERMINY REALIZACJI
1. Przekazanie placu budowy nastąpi do dnia: [DATA] r.
2. Rozpoczęcie prac nastąpi w dniu: [DATA] r.
3. Zakończenie całości prac i zgłoszenie do odbioru nastąpi do dnia: [DATA] r.
4. Harmonogram rzeczowo-finansowy stanowi Załącznik nr 2 do umowy.

§ 3. WYNAGRODZENIE I ZASADY PŁATNOŚCI
1. Strony ustalają za wykonanie przedmiotu umowy ryczałtowe wynagrodzenie w wysokości: [KWOTA CYFROWO] zł brutto (słownie: [KWOTA SŁOWNIE] złotych).
2. Wynagrodzenie obejmuje robociznę [ORAZ MATERIAŁY - JEŚLI DOTYCZY].
3. Zapłata następować będzie częściowo, po bezusterkowym odbiorze poszczególnych etapów zdefiniowanych w Harmonogramie, w terminie 7 dni od daty podpisania protokołu odbioru częściowego.

§ 4. OBOWIĄZKI STRON
1. Obowiązki Inwestora: przekazanie projektu, udostępnienie prądu i wody, powołanie Kierownika Budowy.
2. Obowiązki Wykonawcy: wykonanie prac zgodnie ze sztuką budowlaną, utrzymanie porządku na placu, zabezpieczenie terenu.

§ 5. KARY UMOWNE
1. Wykonawca zapłaci Inwestorowi karę umowną za opóźnienie w zakończeniu prac w wysokości X% [NP. 0,2%] wynagrodzenia za każdy dzień zwłoki.
2. Inwestor zapłaci Wykonawcy odsetki ustawowe za opóźnienie w płatnościach.

§ 6. GWARANCJA I RĘKOJMIA
Wykonawca udziela gwarancji na wykonane prace na okres [LICZBA] miesięcy, licząc od dnia podpisania protokołu odbioru końcowego.

§ 7. POSTANOWIENIA KOŃCOWE
1. Wszelkie zmiany umowy wymagają formy pisemnej w postaci aneksu pod rygorem nieważności.
2. Umowę sporządzono w dwóch jednobrzmiących egzemplarzach, po jednym dla każdej ze stron.

Podpisy:
[INWESTOR] ...................................
[WYKONAWCA] ...................................
`
  },
  {
    id: 'umowa-kierownik-budowy',
    title: 'Umowa z Kierownikiem Budowy',
    description: 'Umowa określająca zakres obowiązków kierownika budowy na poszczególnych etapach wnoszenia budynku.',
    content: `
UMOWA O PEŁNIENIE FUNKCJI KIEROWNIKA BUDOWY
zawarta w dniu [DATA] w [MIEJSCOWOŚĆ] pomiędzy:

[IMIĘ I NAZWISKO INWESTORA], zwanym dalej "Inwestorem",

a

[IMIĘ I NAZWISKO KIEROWNIKA], legitymującym się uprawnieniami budowlanymi nr [NUMER UPRAWNIEŃ] i wpisanym do okręgowej izby inżynierów budownictwa pod numerem [NUMER CZŁONKOWSKI], zwanym dalej "Kierownikiem Budowy".

§ 1. PRZEDMIOT UMOWY
1. Inwestor powierza, a Kierownik Budowy przyjmuje na siebie obowiązek pełnienia funkcji kierownika budowy dla inwestycji polegającej na budowie [RODZAJ BUDYNKU] na działce nr [NUMER DZIAŁKI] w [MIEJSCOWOŚĆ].
2. Zakres obowiązków Kierownika Budowy reguluje ustawa Prawo budowlane (art. 22).

§ 2. ZAKRES WSPÓŁPRACY
1. Kierownik Budowy zobowiązuje się do obecności na placu budowy minimum [X] razy w miesiącu oraz przy odbiorze każdych robót zanikających lub ulegających zakryciu.
2. W szczególności Kierownik odbiera i wpisuje do Dziennika Budowy: zbrojenie fundamentów, wieńców, stropów oraz układ więźby dachowej.

§ 3. WYNAGRODZENIE
1. Całkowite wynagrodzenie ryczałtowe za pełnienie funkcji do momentu oddania budynku do użytku ustala się na kwotę: [KWOTA] zł.
2. Płatność nastąpi w [X] ratach wg ustalonego harmonogramu.

Podpisy:
[INWESTOR] ...................................
[KIEROWNIK BUDOWY] ...................................
`
  },
  {
    id: 'protokol-odbioru',
    title: 'Wzór Protokołu Odbioru Częściowego / Końcowego',
    description: 'Prosty protokół używany do akceptacji kolejnych etapów robót budowlanych i odblokowywania płatności.',
    content: `
PROTOKÓŁ ODBIORU ROBÓT (CZĘŚCIOWY / KOŃCOWY*)
(* niepotrzebne skreślić)

W dniu [DATA] w [MIEJSCOWOŚĆ] sporządzono niniejszy protokół odbioru dla inwestycji zlokalizowanej pod adresem: [ADRES INWESTYCJI].

W odbiorze uczestniczą:
Inwestor: [IMIĘ I NAZWISKO]
Wykonawca: [NAZWA FIRMY / IMIĘ I NAZWISKO]
Kierownik Budowy: [IMIĘ I NAZWISKO] (jeśli wymagane)

Przedmiotem odbioru jest: [DOKŁADNY OPIS ODBIERANYCH PRAC, np. zbrojenie i wylanie płyty fundamentowej, tynki wewnętrzne, wymurowanie ścian parteru].

1. Ocena wykonanych robót:
Prace wykonano ZGODNIE / NIEZGODNIE* z projektem budowlanym oraz sztuką budowlaną.

2. Usterki i wady:
Podczas odbioru stwierdzono następujące usterki (jeśli brak wpisać "Brak"):
a) ........................................................................
b) ........................................................................

3. Termin usunięcia napraw/usterek:
W przypadku stwierdzenia usterek, Wykonawca zobowiązuje się usunąć je do dnia: [DATA].

4. Decyzja:
Inwestor PRZYJMUJE / ODRZUCA* poprawność wykonanych robót.
Protokół ten stanowi podstawę do wystawienia faktury obciążeniowej na kwotę objętą tym etapem prac.

Podpisy stron:

Inwestor: ...........................
Wykonawca: ...........................
Kierownik budowy: ...........................
`
  },
  {
    id: 'umowa-projekt-architektoniczny',
    title: 'Umowa z Architektem / Biurem Projektowym',
    description: 'Umowa o opracowanie projektu budowlanego i uzyskanie pozwolenia na budowę wraz z nadzorem autorskim.',
    content: `
UMOWA O DZIEŁO – PROJEKT BUDOWLANY
zawarta w dniu [DATA] w [MIEJSCOWOŚĆ] pomiędzy:

[IMIĘ I NAZWISKO INWESTORA], zamieszkałym w [ADRES], zwanym dalej "Zamawiającym",

a

[IMIĘ I NAZWISKO ARCHITEKTA / NAZWA BIURA], posiadającym uprawnienia architektoniczne nr [NUMER UPRAWNIEŃ], NIP: [NIP], zwanym dalej "Projektantem".

§ 1. PRZEDMIOT UMOWY
1. Zamawiający zleca, a Projektant zobowiązuje się do wykonania kompletnego projektu budowlanego budynku mieszkalnego jednorodzinnego na działce nr [NUMER DZIAŁKI] w [MIEJSCOWOŚĆ], zgodnie z wytycznymi określonymi w Programie Funkcjonalno-Użytkowym stanowiącym Załącznik nr 1.
2. W zakres zamówienia wchodzą:
   a) Projekt koncepcyjny (3 warianty do wyboru),
   b) Projekt budowlany zgodny z wymogami Prawa Budowlanego,
   c) Projekty wykonawcze branżowe (konstrukcja, instalacje),
   d) Uzyskanie decyzji o pozwoleniu na budowę w imieniu Zamawiającego (na podstawie pełnomocnictwa).

§ 2. TERMINY
1. Projekt koncepcyjny: w terminie [X] tygodni od podpisania umowy.
2. Projekt budowlany: w terminie [X] tygodni od akceptacji koncepcji.
3. Złożenie wniosku o pozwolenie: w terminie [X] tygodni od wykonania projektu.

§ 3. WYNAGRODZENIE
1. Wynagrodzenie za kompletny projekt wynosi: [KWOTA] zł brutto.
2. Harmonogram płatności:
   - [X]% zaliczki przy podpisaniu umowy,
   - [X]% po akceptacji koncepcji,
   - [X]% po złożeniu wniosku o pozwolenie,
   - pozostała kwota po uzyskaniu decyzji.

§ 4. NADZÓR AUTORSKI
Projektant zobowiązuje się do pełnienia nadzoru autorskiego w trakcie realizacji inwestycji za dodatkowym wynagrodzeniem w wysokości [KWOTA] zł/wizyta lub [KWOTA] zł ryczałtowo.

§ 5. PRAWA AUTORSKIE
Projektant przenosi na Zamawiającego autorskie prawa majątkowe do projektu w zakresie niezbędnym do realizacji inwestycji oraz uzyskania wszelkich decyzji administracyjnych.

§ 6. ODPOWIEDZIALNOŚĆ
Projektant odpowiada za kompletność i zgodność projektu z obowiązującymi przepisami prawa budowlanego, normami technicznymi i warunkami zabudowy.

Podpisy:
[ZAMAWIAJĄCY] ...................................
[PROJEKTANT] ...................................
`
  },
  {
    id: 'umowa-sprzedaz-dzialki',
    title: 'Przedwstępna Umowa Kupna-Sprzedaży Działki Budowlanej',
    description: 'Przedwstępna umowa cywilna rezerwująca działkę przed podpisaniem aktu notarialnego.',
    content: `
PRZEDWSTĘPNA UMOWA KUPNA-SPRZEDAŻY NIERUCHOMOŚCI
zawarta w dniu [DATA] w [MIEJSCOWOŚĆ] pomiędzy:

[IMIĘ I NAZWISKO SPRZEDAJĄCEGO], zamieszkałym w [ADRES], PESEL: [PESEL], zwanym dalej "Sprzedającym",

a

[IMIĘ I NAZWISKO KUPUJĄCEGO], zamieszkałym w [ADRES], PESEL: [PESEL], zwanym dalej "Kupującym".

§ 1. PRZEDMIOT UMOWY
1. Sprzedający oświadcza, że jest właścicielem nieruchomości gruntowej – działki ewidencyjnej nr [NUMER DZIAŁKI], o powierzchni [POWIERZCHNIA] m², położonej w [MIEJSCOWOŚĆ], gmina [GMINA], dla której Sąd Rejonowy w [MIEJSCOWOŚĆ] prowadzi Księgę Wieczystą nr [NUMER KW].
2. Nieruchomość jest przeznaczona pod zabudowę mieszkaniową jednorodzinną zgodnie z miejscowym planem zagospodarowania przestrzennego / decyzją o warunkach zabudowy.*

§ 2. ZOBOWIĄZANIE DO ZAWARCIA UMOWY PRZYRZECZONEJ
Strony zobowiązują się zawrzeć przyrzeczoną umowę sprzedaży w formie aktu notarialnego do dnia [DATA] r., na warunkach określonych w niniejszej umowie.

§ 3. CENA
1. Cena sprzedaży nieruchomości wynosi: [KWOTA] zł (słownie: [KWOTA SŁOWNIE] złotych).
2. Kupujący wpłaca zadatek w kwocie [KWOTA ZADATKU] zł w dniu zawarcia niniejszej umowy.
3. Pozostała kwota zostanie uiszczona najpóźniej w dniu zawarcia umowy przyrzeczonej.

§ 4. ZADATEK
1. W przypadku niewykonania umowy z winy Kupującego, Sprzedający zachowuje zadatek.
2. W przypadku niewykonania umowy z winy Sprzedającego, Kupującemu zwraca się zadatek w dwukrotnej wysokości.

§ 5. OŚWIADCZENIA SPRZEDAJĄCEGO
Sprzedający oświadcza, że:
a) nieruchomość jest wolna od obciążeń hipotecznych, służebności i roszczeń osób trzecich,
b) nie toczy się żadne postępowanie administracyjne lub sądowe dotyczące nieruchomości,
c) nieruchomość nie jest przedmiotem dzierżawy ani najmu.

§ 6. KOSZTY TRANSAKCJI
Koszty sporządzenia umowy notarialnej, podatku od czynności cywilnoprawnych oraz wpisu do księgi wieczystej ponosi Kupujący.

Podpisy:
[SPRZEDAJĄCY] ...................................
[KUPUJĄCY] ...................................
`
  },
  {
    id: 'umowa-inspektor-nadzoru',
    title: 'Umowa z Inspektorem Nadzoru Inwestorskiego',
    description: 'Umowa o wykonywanie niezależnego nadzoru nad jakością i zgodnością robót z projektem w imieniu inwestora.',
    content: `
UMOWA O PEŁNIENIE NADZORU INWESTORSKIEGO
zawarta w dniu [DATA] w [MIEJSCOWOŚĆ] pomiędzy:

[IMIĘ I NAZWISKO INWESTORA], zwanym dalej "Inwestorem",

a

[IMIĘ I NAZWISKO / NAZWA FIRMY INSPEKTORA], posiadającym uprawnienia budowlane nr [NUMER UPRAWNIEŃ], zwanym dalej "Inspektorem Nadzoru".

§ 1. PRZEDMIOT UMOWY
Inwestor powierza, a Inspektor Nadzoru przyjmuje nadzór inwestorski nad budową [RODZAJ OBIEKTU] realizowaną na działce nr [NUMER DZIAŁKI] w [MIEJSCOWOŚĆ], na podstawie projektu budowlanego i pozwolenia na budowę nr [NUMER DECYZJI].

§ 2. ZAKRES OBOWIĄZKÓW INSPEKTORA NADZORU
Inspektor Nadzoru zobowiązuje się do:
1. Reprezentowania Inwestora na budowie.
2. Sprawdzania jakości wykonywanych robót, wbudowanych materiałów i stosowanych technologii.
3. Sprawdzania i odbioru robót ulegających zakryciu lub zanikających.
4. Uczestniczenia w próbach i odbiorach technicznych instalacji i urządzeń.
5. Kontrolowania zgodności realizacji z projektem, pozwoleniem na budowę i przepisami.
6. Potwierdzania faktycznie wykonanych robót oraz usunięcia wad.
7. Wydawania poleceń kierownikowi budowy dotyczących prawidłowości wykonywania robót.

§ 3. WIZYTY NA BUDOWIE
Inspektor zobowiązuje się do wizyt na placu budowy minimum [X] razy w miesiącu oraz każdorazowo na wezwanie Inwestora w terminie [X] dni roboczych. Z każdej wizyty sporządzany jest raport.

§ 4. WYNAGRODZENIE
1. Wynagrodzenie miesięczne Inspektora wynosi: [KWOTA] zł brutto.
   LUB
1. Wynagrodzenie ryczałtowe za cały okres budowy wynosi: [KWOTA] zł brutto.
2. Wynagrodzenie płatne jest do [X] dnia każdego miesiąca na rachunek bankowy Inspektora.

§ 5. CZAS TRWANIA UMOWY
Umowa obowiązuje od dnia [DATA] do dnia odbioru końcowego i uzyskania pozwolenia na użytkowanie, jednak nie dłużej niż do dnia [DATA].

Podpisy:
[INWESTOR] ...................................
[INSPEKTOR NADZORU] ...................................
`
  },
  {
    id: 'umowa-instalacja-elektryczna',
    title: 'Umowa o Wykonanie Instalacji Elektrycznej',
    description: 'Umowa z elektrykiem na kompleksowe wykonanie instalacji elektrycznej, odgromowej i niskoprądowej w budynku.',
    content: `
UMOWA O ROBOTY ELEKTRYCZNE
zawarta w dniu [DATA] w [MIEJSCOWOŚĆ] pomiędzy:

[IMIĘ I NAZWISKO INWESTORA], zwanym dalej "Zamawiającym",

a

[IMIĘ I NAZWISKO / NAZWA FIRMY], NIP: [NIP], posiadającym uprawnienia elektryczne do [SEP/E1/D1], zwanym dalej "Wykonawcą".

§ 1. PRZEDMIOT UMOWY
Wykonawca zobowiązuje się do wykonania kompleksowej instalacji elektrycznej w budynku mieszkalnym przy ul. [ADRES], zgodnie z projektem instalacji elektrycznej stanowiącym Załącznik nr 1, obejmującej:
1. Instalację rozdzielczą (tablica główna TG + tablice piętrowe TP),
2. Instalację gniazdkową i oświetleniową (230V),
3. Instalację siłową (400V) dla urządzeń AGD i pompy ciepła/klimatyzacji,
4. Instalację odgromową i wyrównanie potencjałów,
5. Instalację niskoprądową: TV/SAT, Internet, domofon, systemy alarmowe.

§ 2. ZAKRES MATERIAŁÓW
Wykonawca dostarcza: [WYMIENIĆ CO – KABLE, PUSZKI, ŁĄCZNIKI] / Materiały dostarcza Zamawiający.

§ 3. TERMINY
1. Rozpoczęcie prac: [DATA].
2. Zakończenie (I etap – przygotowanie przed tynkami): [DATA].
3. Zakończenie (II etap – montaż osprzętu): [DATA].
4. Wykonanie pomiarów elektrycznych i odbiór: [DATA].

§ 4. WYNAGRODZENIE
1. Wynagrodzenie ryczałtowe za całość prac wynosi: [KWOTA] zł brutto.
2. Płatność w ratach:
   - [X]% zaliczki przed rozpoczęciem,
   - [X]% po zakończeniu I etapu,
   - [X]% po zakończeniu II etapu i wykonaniu pomiarów.
3. Wykonawca dostarczy protokoły pomiarów elektrycznych.

§ 5. GWARANCJA
Wykonawca udziela gwarancji na wykonane prace przez okres [X] lat od odbioru końcowego.

Podpisy:
[ZAMAWIAJĄCY] ...................................
[WYKONAWCA] ...................................
`
  },
  {
    id: 'umowa-instalacja-hydrauliczna',
    title: 'Umowa o Wykonanie Instalacji Wodno-Kanalizacyjnej i CO',
    description: 'Umowa z hydraulikiem/instalatorem na wykonanie instalacji wody, kanalizacji i centralnego ogrzewania.',
    content: `
UMOWA O ROBOTY INSTALACYJNE (WOD-KAN I CENTRALNE OGRZEWANIE)
zawarta w dniu [DATA] w [MIEJSCOWOŚĆ] pomiędzy:

[IMIĘ I NAZWISKO INWESTORA], zwanym dalej "Zamawiającym",

a

[IMIĘ I NAZWISKO / NAZWA FIRMY], NIP: [NIP], zwanym dalej "Wykonawcą".

§ 1. PRZEDMIOT UMOWY
Wykonawca zobowiązuje się do wykonania instalacji wewnętrznych w budynku mieszkalnym przy [ADRES]:

A. INSTALACJA WODNO-KANALIZACYJNA:
1. Instalacja wodociągowa zimnej i ciepłej wody użytkowej,
2. Podejścia do wszystkich punktów poboru (umywalki, WC, wanny, natryski, zlewy, pralka),
3. Instalacja kanalizacyjna sanitarna wraz z podejściami spustowymi,
4. Przyłącze do kanalizacji zewnętrznej / szamba / przydomowej oczyszczalni.*

B. INSTALACJA CENTRALNEGO OGRZEWANIA:
1. Rozdzielacze i obwody grzewcze,
2. Grzejniki / ogrzewanie podłogowe,
3. Podłączenie źródła ciepła: [KOCIOŁ/POMPA CIEPŁA/PIEC].

§ 2. TERMINY
Etap I (przed wylewkami/tynkami): do [DATA]
Etap II (montaż osprzętu): do [DATA]
Próby szczelności i odbiór: do [DATA]

§ 3. WYNAGRODZENIE
Wynagrodzenie ryczałtowe za całość wynosi: [KWOTA] zł brutto.
Harmonogram płatności: zaliczka [X]%, po etapie I [X]%, po odbiorze końcowym [X]%.

§ 4. MATERIAŁY
[Materiały podstawowe (rury, kształtki) dostarcza Wykonawca / Zamawiający.*]
[Osprzęt sanitarny (baterie, ceramika) dostarcza Zamawiający.*]

§ 5. GWARANCJA I RĘKOJMIA
Wykonawca udziela gwarancji na wykonane prace na okres [X] lat. Gwarancja obejmuje szczelność instalacji oraz prawidłowe działanie wszystkich urządzeń.

Podpisy:
[ZAMAWIAJĄCY] ...................................
[WYKONAWCA] ...................................
`
  },
  {
    id: 'umowa-dach',
    title: 'Umowa o Wykonanie Dachu (Więźba + Pokrycie)',
    description: 'Umowa z cieślą i dekarzem na wykonanie konstrukcji więźby dachowej oraz kompletnego pokrycia dachu.',
    content: `
UMOWA O ROBOTY DEKARSKIE I CIESIELSKIE
zawarta w dniu [DATA] w [MIEJSCOWOŚĆ] pomiędzy:

[IMIĘ I NAZWISKO INWESTORA], zwanym dalej "Zamawiającym",

a

[IMIĘ I NAZWISKO / NAZWA FIRMY], NIP: [NIP], zwanym dalej "Wykonawcą".

§ 1. PRZEDMIOT UMOWY
Wykonawca zobowiązuje się do wykonania kompletnego dachu budynku mieszkalnego zgodnie z projektem budowlanym (rzuty połaci, przekroje, zestawienie elementów), obejmującego:

A. ROBOTY CIESIELSKIE:
1. Wykonanie więźby dachowej wg projektu (wiązary, kleszcze, krokwie, jętki),
2. Montaż łacenia / kontrłacenia / folii wstępnego krycia,
3. Montaż deskowania połaci (jeśli dotyczy).

B. ROBOTY DEKARSKIE:
1. Ułożenie pokrycia dachowego: [RODZAJ – DACHÓWKA / BLACHODACHÓWKA / PAPA TERMOZGRZEWALNA],
2. Montaż rynien i rur spustowych,
3. Obróbki blacharskie (kominki wentylacyjne, okna dachowe, kosze, okapy),
4. Montaż [X] okien dachowych marki [MARKA].

§ 2. TERMINY
1. Przejęcie placu i rozpoczęcie prac: [DATA].
2. Zakończenie więźby: [DATA].
3. Zakończenie pokrycia dachu: [DATA].

§ 3. WYNAGRODZENIE
1. Wynagrodzenie ryczałtowe za całość: [KWOTA] zł brutto.
2. Zaliczka na start: [KWOTA] zł.
3. Płatność końcowa po protokole odbioru dachu.

§ 4. MATERIAŁY
Materiały dostarcza: [WYKONAWCA / ZAMAWIAJĄCY*].
Wykonawca zobowiązuje się do stosowania materiałów spełniających normy PN-EN oraz posiadających certyfikaty.

§ 5. GWARANCJA
Na szczelność dachu: [X] lat.
Na roboty ciesielskie: [X] lat.

Podpisy:
[ZAMAWIAJĄCY] ...................................
[WYKONAWCA] ...................................
`
  },
  {
    id: 'umowa-ocieplenie-elewacja',
    title: 'Umowa o Wykonanie Ocieplenia i Elewacji (ETICS/Tynk)',
    description: 'Umowa z firmą budowlaną na docieplenie budynku metodą ETICS oraz wykonanie tynku elewacyjnego.',
    content: `
UMOWA O ROBOTY ELEWACYJNE I TERMOIZOLACYJNE
zawarta w dniu [DATA] w [MIEJSCOWOŚĆ] pomiędzy:

[IMIĘ I NAZWISKO INWESTORA], zwanym dalej "Zamawiającym",

a

[NAZWA FIRMY / IMIĘ I NAZWISKO], NIP: [NIP], zwanym dalej "Wykonawcą".

§ 1. PRZEDMIOT UMOWY
Wykonawca wykona docieplenie budynku metodą ETICS wraz z wyprawą tynkarską i malowaniem elewacji dla budynku przy [ADRES], o łącznej powierzchni elewacji: [M²] m².

Zakres prac:
1. Przygotowanie podłoża (gruntowanie, wyrównanie),
2. Przyklejenie i kotwienie płyt styropianu / wełny mineralnej gr. [X] cm, λ = [WARTOŚĆ],
3. Siatka zbrojąca + warstwa klejąca,
4. Tynk cienkowarstwowy [SILIKONOWY/MINERALNY/AKRYLOWY] gr. [X] mm,
5. Malowanie elewacji farbą elewacyjną – kolor wg projektu,
6. Obróbki blacharskie parapetów zewnętrznych.

§ 2. TERMINY
Rozpoczęcie prac: [DATA] (po zakończeniu stanu surowego zamkniętego).
Zakończenie prac: [DATA].
Warunek: temperatura otoczenia nie niższa niż +5°C.

§ 3. WYNAGRODZENIE
1. Wynagrodzenie ryczałtowe: [KWOTA] zł brutto ([KWOTA] zł/m²).
2. Zaliczka: [KWOTA] zł przed rozpoczęciem.
3. Rozliczenie końcowe po odbiorze bezusterkowym.

§ 4. MATERIAŁY
Wykonawca stosuje systemy ETICS jednego producenta: [MARKA SYSTEMU], co warunkuje udzielenie gwarancji systemowej.

§ 5. GWARANCJA SYSTEMOWA
Wykonawca udziela gwarancji [X]-letniej na całość wykonanych prac. Warunkiem gwarancji jest stosowanie kompletnego systemu jednego producenta i przeprowadzanie przeglądów co [X] lat.

Podpisy:
[ZAMAWIAJĄCY] ...................................
[WYKONAWCA] ...................................
`
  },
  {
    id: 'umowa-okna-drzwi',
    title: 'Umowa Dostawy i Montażu Okien oraz Drzwi',
    description: 'Umowa z firmą stolarki budowlanej na dostawę, wycenę i montaż okien PCV/AL/drewnianych i drzwi zewnętrznych.',
    content: `
UMOWA DOSTAWY I MONTAŻU STOLARKI BUDOWLANEJ
zawarta w dniu [DATA] w [MIEJSCOWOŚĆ] pomiędzy:

[IMIĘ I NAZWISKO INWESTORA], zwanym dalej "Zamawiającym",

a

[NAZWA FIRMY], NIP: [NIP], zwanym dalej "Dostawcą".

§ 1. PRZEDMIOT UMOWY
Dostawca zobowiązuje się do wykonania, dostarczenia i montażu stolarki budowlanej dla budynku przy [ADRES] zgodnie ze specyfikacją stanowiącą Załącznik nr 1, która obejmuje:
- [ILOŚĆ] okna PVC/AL/drewniane, klasa UD = [WARTOŚĆ] W/m²K,
- [ILOŚĆ] drzwi balkonowe/tarasowe,
- [ILOŚĆ] drzwi zewnętrzne wejściowe, klasa RC = [KLASA],
- [ILOŚĆ] drzwi wewnętrzne.

§ 2. PARAMETRY TECHNICZNE
Okna i drzwi zewnętrzne muszą spełniać minimalne wymogi wynikające z Warunków Technicznych:
- Współczynnik przenikania ciepła U ≤ [WARTOŚĆ] W/m²K,
- Izolacyjność akustyczna Rw ≥ [X] dB.

§ 3. TERMIN
1. Potwierdzenie zamówienia i wymiarowanie na budowie: [DATA].
2. Dostawa i montaż okien: [DATA] (przed tynkami wewnętrznymi).
3. Dostawa i montaż drzwi wewnętrznych: [DATA] (po tynkach, przed malowaniem).

§ 4. CENA I PŁATNOŚĆ
Całkowita wartość zamówienia: [KWOTA] zł brutto.
Zaliczka: [X]% przy podpisaniu umowy.
Płatność końcowa: [X]% przy montażu.

§ 5. GWARANCJA
Dostawca udziela gwarancji na: profile – [X] lat, szyby – [X] lat, okucia – [X] lat.

Podpisy:
[ZAMAWIAJĄCY] ...................................
[DOSTAWCA] ...................................
`
  },
  {
    id: 'umowa-transport-material',
    title: 'Umowa o Dostawę Materiałów Budowlanych',
    description: 'Zlecenie na cykliczną dostawę materiałów budowlanych (beton, cegła, pustaki, kruszywa) na plac budowy.',
    content: `
UMOWA O DOSTAWĘ MATERIAŁÓW BUDOWLANYCH
zawarta w dniu [DATA] w [MIEJSCOWOŚĆ] pomiędzy:

[IMIĘ I NAZWISKO INWESTORA], zwanym dalej "Zamawiającym",

a

[NAZWA FIRMY], NIP: [NIP], zwanym dalej "Dostawcą".

§ 1. PRZEDMIOT UMOWY
Dostawca zobowiązuje się do sukcesywnej dostawy materiałów budowlanych na plac budowy przy [ADRES BUDOWY], według zleceń składanych przez Zamawiającego, zgodnie z aktualnym cennikiem stanowiącym Załącznik nr 1.

§ 2. WARUNKI DOSTAW
1. Zlecenia mogą być składane telefonicznie lub e-mailem na [KONTAKT DOSTAWCY].
2. Czas realizacji zlecenia: [X] dni roboczych od potwierdzenia.
3. Dostawa realizowana jest w godzinach [X:XX–X:XX] w dni robocze.
4. Dostawca zapewnia rozładunek we wskazanym miejscu na działce (HDS, pompa, wywrotka).

§ 3. CENY I WARUNKI PŁATNOŚCI
1. Ceny materiałów są zgodne z cennikiem obowiązującym w dniu złożenia zlecenia.
2. Dostawca ma prawo do zmiany cennika z [X]-dniowym wyprzedzeniem.
3. Płatność za każdą dostawę w terminie [X] dni od daty wystawienia faktury.

§ 4. ODPOWIEDZIALNOŚĆ ZA JAKOŚĆ
1. Dostawca dostarcza materiały posiadające aktualne deklaracje właściwości użytkowych i certyfikaty.
2. Zamawiający sprawdza dostawę przy rozładunku. Reklamacje składa się w terminie [X] dni.

§ 5. CZAS TRWANIA UMOWY
Umowa obowiązuje od [DATA] do [DATA] lub do zakończenia budowy.

Podpisy:
[ZAMAWIAJĄCY] ...................................
[DOSTAWCA] ...................................
`
  },
  {
    id: 'umowa-geodeta',
    title: 'Umowa z Geodetą (Wytyczenie + Inwentaryzacja Powykonawcza)',
    description: 'Zlecenie usług geodezyjnych: wytyczenie budynku, obsługa budowy i inwentaryzacja powykonawcza.',
    content: `
ZLECENIE USŁUG GEODEZYJNYCH
zawarte w dniu [DATA] w [MIEJSCOWOŚĆ] pomiędzy:

[IMIĘ I NAZWISKO INWESTORA], zwanym dalej "Zleceniodawcą",

a

[IMIĘ I NAZWISKO GEODETY / NAZWA FIRMY], posiadającym uprawnienia geodezyjne nr [NUMER], zwanym dalej "Geodetą".

§ 1. PRZEDMIOT ZLECENIA
Geodeta wykona następujące usługi geodezyjne dla inwestycji na działce nr [NUMER DZIAŁKI] w [MIEJSCOWOŚĆ]:

1. Analiza mapy zasadniczej i mapy do celów projektowych,
2. Wytyczenie obrysu budynku w terenie (stabilizacja osi i narożników),
3. Wytyczenie rzędnej posadowienia (zero budynku ±0.00),
4. Bieżąca obsługa geodezyjna budowy (zbrojenie, słupy, ściany),
5. Pomiar powykonawczy budynku i instalacji podziemnych,
6. Sporządzenie operatu geodezyjnego i inwentaryzacji powykonawczej,
7. Zgłoszenie wyników pomiarów do PODGiK.

§ 2. TERMINY
Wytyczenie budynku: w terminie do [X] dni od zgłoszenia.
Inwentaryzacja powykonawcza: po zakończeniu budowy, dostarczona do [DATA].

§ 3. WYNAGRODZENIE
1. Mapa do celów projektowych: [KWOTA] zł,
2. Wytyczenie budynku: [KWOTA] zł,
3. Obsługa bieżąca: [KWOTA] zł / wizyta,
4. Inwentaryzacja powykonawcza: [KWOTA] zł.
Łącznie: [KWOTA] zł brutto.

§ 4. MATERIAŁY PRZEKAZYWANE ZLECENIODAWCY
Geodeta przekaże: mapę do celów projektowych w wersji cyfrowej i papierowej, szkice polowe, inwentaryzację powykonawczą wraz z pieczątkami PODGiK.

Podpisy:
[ZLECENIODAWCA] ...................................
[GEODETA] ...................................
`
  },
  {
    id: 'umowa-dzierzawa-terenu',
    title: 'Umowa Dzierżawy Terenu na Czas Budowy (Zaplecze)',
    description: 'Umowa tymczasowego zajęcia sąsiedniej działki lub terenu na zaplecze budowlane, sprzęt i materiały.',
    content: `
UMOWA DZIERŻAWY TERENU
zawarta w dniu [DATA] w [MIEJSCOWOŚĆ] pomiędzy:

[IMIĘ I NAZWISKO WŁAŚCICIELA], zamieszkałym w [ADRES], zwanym dalej "Wydzierżawiającym",

a

[IMIĘ I NAZWISKO INWESTORA / WYKONAWCY], zwanym dalej "Dzierżawcą".

§ 1. PRZEDMIOT UMOWY
Wydzierżawiający oddaje Dzierżawcy w dzierżawę część nieruchomości – działki nr [NUMER DZIAŁKI], o powierzchni [POWIERZCHNIA] m², zlokalizowanej przy [ADRES] (zaznaczoną na szkicu stanowiącym Załącznik nr 1), z przeznaczeniem na zaplecze budowlane – składowanie materiałów i postój sprzętu.

§ 2. CZAS TRWANIA
Umowa zawarta jest na czas określony od [DATA] do [DATA], z możliwością przedłużenia za porozumieniem stron.

§ 3. CZYNSZ DZIERŻAWNY
1. Czynsz dzierżawny wynosi [KWOTA] zł miesięcznie, płatny do [X] dnia każdego miesiąca.
2. Jednorazowa kaucja zwrotna: [KWOTA] zł, zwracana po opuszczeniu terenu i jego uprzątnięciu.

§ 4. OBOWIĄZKI DZIERŻAWCY
1. Używanie terenu zgodnie z przeznaczeniem.
2. Nieskładowanie materiałów niebezpiecznych, niesegregowanych odpadów.
3. Po zakończeniu dzierżawy – przywrócenie terenu do stanu pierwotnego.
4. Ogrodzenie i zabezpieczenie zajmowanego terenu na własny koszt.

§ 5. ODPOWIEDZIALNOŚĆ
Dzierżawca ponosi pełną odpowiedzialność za szkody wyrządzone na dzierżawionym terenie oraz wobec osób trzecich w związku z prowadzoną działalnością budowlaną.

Podpisy:
[WYDZIERŻAWIAJĄCY] ...................................
[DZIERŻAWCA] ...................................
`
  },
  {
    id: 'oswiadczenie-gwarancja',
    title: 'Oświadczenie Gwarancyjne Wykonawcy',
    description: 'Formalne oświadczenie gwarancyjne wystawiane przez wykonawcę po zakończeniu prac – dokument do archiwum inwestora.',
    content: `
OŚWIADCZENIE GWARANCYJNE
wystawione w dniu [DATA] przez:

[IMIĘ I NAZWISKO / NAZWA FIRMY WYKONAWCY], NIP: [NIP], z siedzibą w [ADRES], zwanego dalej "Gwarantem",

na rzecz:

[IMIĘ I NAZWISKO INWESTORA], zamieszkałego w [ADRES], zwanego dalej "Uprawnionym z Gwarancji".

§ 1. ZAKRES GWARANCJI
Gwarant udziela gwarancji jakości na roboty budowlane wykonane na podstawie umowy nr [NUMER UMOWY / LUB DATA UMOWY] z dnia [DATA], obejmujące: [OPIS ZAKRESU PRAC – np. stan surowy, instalacja elektryczna, dach].

§ 2. OKRES GWARANCJI
Okres gwarancji wynosi [X] lat i liczy się od dnia podpisania protokołu odbioru końcowego, tj. od dnia [DATA ODBIORU].
Gwarancja wygasa: [DATA WYGAŚNIĘCIA GWARANCJI].

§ 3. WARUNKI GWARANCJI
1. Gwarancja obejmuje wady fizyczne tkwiące w wykonanych robotach budowlanych oraz wadliwie wbudowanych materiałach.
2. Gwarancja nie obejmuje uszkodzeń wynikłych z działania siły wyższej, normalnego zużycia, nieprawidłowej eksploatacji lub samowolnych przeróbek przez osoby trzecie.

§ 4. PROCEDURA REKLAMACYJNA
1. Uprawniony z Gwarancji zgłasza wady pisemnie lub e-mailem na adres: [KONTAKT GWARANTA].
2. Gwarant przystępuje do oględzin w terminie [X] dni roboczych od otrzymania zgłoszenia.
3. Termin usunięcia wad: [X] dni od daty potwierdzenia zasadności reklamacji.

§ 5. UPRAWNIENIA UPRAWNIONEGO Z GWARANCJI
W przypadku nieusunięcia wad w terminie, Uprawniony z Gwarancji ma prawo zlecić usunięcie wad innemu podmiotowi na koszt Gwaranta.

Podpis Gwaranta: ...................................
Pieczątka firmy: ...................................
`
  },
  {
    id: 'pelnomocnictwo-budowlane',
    title: 'Pełnomocnictwo do Działania w Sprawach Budowlanych',
    description: 'Pełnomocnictwo upoważniające osobę trzecią do reprezentowania inwestora przed urzędami i organami.',
    content: `
PEŁNOMOCNICTWO

Wydane w [MIEJSCOWOŚĆ], dnia [DATA].

Ja, niżej podpisany/a:
[IMIĘ I NAZWISKO MOCODAWCY], zamieszkały/a w [ADRES], PESEL: [PESEL], legitymujący/a się dowodem osobistym nr [NR DOWODU],

będący/a właścicielem/właścicielką nieruchomości gruntowej – działki nr [NUMER DZIAŁKI] położonej w [MIEJSCOWOŚĆ], KW nr [NUMER KW],

UDZIELAM PEŁNOMOCNICTWA:

Panu/Pani [IMIĘ I NAZWISKO PEŁNOMOCNIKA], zamieszkałemu/ej w [ADRES], PESEL: [PESEL],

Do:
1. Złożenia i odbioru wniosku o pozwolenie na budowę / zgłoszenia robót budowlanych*,
2. Odbioru i podpisania decyzji o pozwoleniu na budowę i wszelkich innych decyzji administracyjnych związanych z przedmiotową inwestycją,
3. Składania oświadczeń, uzupełnień i poprawek we wszelkich postępowaniach administracyjnych dotyczących inwestycji,
4. Podpisania zawiadomienia o zakończeniu budowy i złożenia wniosku o pozwolenie na użytkowanie*,
5. Reprezentowania mnie przed organami: Starostwem Powiatowym, Powiatowym Inspektorem Nadzoru Budowlanego, urzędami gminy, sieciami mediów.

Pełnomocnictwo obejmuje / nie obejmuje* prawa do udzielania dalszych pełnomocnictw.

Niniejsze pełnomocnictwo jest ważne do dnia [DATA] / do odwołania*.

Podpis Mocodawcy: ...................................

[*] notarialnie poświadczyć podpis jeśli wymagane przez urząd
`
  },
  {
    id: 'umowa-ogrodzenie',
    title: 'Umowa o Wykonanie Ogrodzenia Działki',
    description: 'Umowa z firmą ogrodzeniową na wykonanie trwałego ogrodzenia murowanego lub z przęseł metalowych.',
    content: `
UMOWA O ROBOTY OGRODZENIOWE
zawarta w dniu [DATA] w [MIEJSCOWOŚĆ] pomiędzy:

[IMIĘ I NAZWISKO INWESTORA], zwanym dalej "Zamawiającym",

a

[NAZWA FIRMY / IMIĘ I NAZWISKO], NIP: [NIP], zwanym dalej "Wykonawcą".

§ 1. PRZEDMIOT UMOWY
Wykonawca zobowiązuje się do wykonania ogrodzenia działki nr [NUMER DZIAŁKI] przy [ADRES], o łącznej długości [X] mb, obejmującego:

1. Fundamenty/cokół murowany z bloczków betonowych / cegły klinkierowej* do wys. [X] cm,
2. Słupki stalowe/murowane w rozstawie co [X] m,
3. Przęsła ogrodzeniowe: [RODZAJ – METALOWE PANELE / LAMELOWE / SIATKA PANELOWA], kolor [KOLOR], wys. [X] cm,
4. Brama wjazdowa dwuskrzydłowa szer. [X] m z napędem automatycznym marki [MARKA],
5. Furtka wejściowa szer. [X] m.

§ 2. TERMINY
Rozpoczęcie prac: [DATA].
Zakończenie prac (gotowe kompletne ogrodzenie z uprzątnięciem terenu): [DATA].

§ 3. WYNAGRODZENIE
Wynagrodzenie ryczałtowe: [KWOTA] zł brutto.
Cena jednostkowa: [KWOTA] zł/mb (pomocniczo).
Zaliczka [X]% przed rozpoczęciem, reszta po odbiorze.

§ 4. MATERIAŁY
Wszystkie materiały dostarcza Wykonawca. Do oferty dołącza karty techniczne i deklaracje właściwości użytkowych zastosowanych elementów.

§ 5. GWARANCJA
Na antykorozję elementów metalowych: [X] lat.
Na automatykę bramy: [X] lat (gwarancja producenta).
Na roboty budowlane ogólne: [X] lat.

§ 6. UWAGI SZCZEGÓLNE
1. Ogrodzenie należy posadowić wg wskazań geodety i zgodnie z granicą działki.
2. Wszystkie prace przy granicy z sąsiednią działką wymagają zachowania przepisów § 42 Warunków Technicznych.

Podpisy:
[ZAMAWIAJĄCY] ...................................
[WYKONAWCA] ...................................
`
  },
  {
    id: 'umowa-prace-ziemne',
    title: 'Umowa o Prace Ziemne i Fundamenty',
    description: 'Umowa z firmą ziemną na wykopy, niwelację terenu, drenaż i wykonanie płyty lub ław fundamentowych.',
    content: `
UMOWA O ROBOTY ZIEMNE I FUNDAMENTOWE
zawarta w dniu [DATA] w [MIEJSCOWOŚĆ] pomiędzy:

[IMIĘ I NAZWISKO INWESTORA], zwanym dalej "Zamawiającym",

a

[NAZWA FIRMY / IMIĘ I NAZWISKO], NIP: [NIP], zwanym dalej "Wykonawcą".

§ 1. ZAKRES PRAC
Wykonawca wykona następujące prace ziemne i fundamentowe dla budynku przy [ADRES]:

A. PRACE ZIEMNE:
1. Zdjęcie warstwy humusu z terenu budowy ([X] cm) i wywóz nadmiaru gruntu,
2. Niwelacja terenu wg projektu,
3. Wykop pod fundamenty wg projektu (ławy / płyta*) – głębokość [X] m p.p.t.,
4. Odkopanie przyłączy i wykopy liniowe pod instalacje.

B. ROBOTY FUNDAMENTOWE:
1. Wykonanie podsypki piaskowej / żwirowej gr. [X] cm i zagęszczenie,
2. Ułożenie izolacji poziomej (folia kubełkowa / papa),
3. Zbrojenie i betonowanie ław / płyty fundamentowej wg projektu,
4. Izolacja pionowa fundamentów [MATERIAŁ] + drenaż opaskowy,
5. Zasypanie i zagęszczenie gruntu wokół fundamentów.

§ 2. TERMINY
Przekazanie placu i rozpoczęcie prac: [DATA].
Zakończenie prac ziemnych: [DATA].
Zakończenie fundamentów (beton osiąga wytrzymałość): [DATA].

§ 3. WYNAGRODZENIE
Wynagrodzenie ryczałtowe: [KWOTA] zł brutto.
Zaliczka: [KWOTA] zł.
Rozliczenie końcowe po inwentaryzacji i protokole odbioru fundamentów.

§ 4. MATERIAŁY
Beton klasy [C16/20 / C20/25*] z certyfikowanej betoniarni. Wykonawca dostarcza WZ i dokumentację receptury betonu.

§ 5. NADZÓR
Zbrojenie i etap zalewania betonu wymagają odbioru przez Kierownika Budowy przed zakryciem.

Podpisy:
[ZAMAWIAJĄCY] ...................................
[WYKONAWCA] ...................................
`
  }
]
