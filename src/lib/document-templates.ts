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
  }
]
