# Frontend

Frontend aplikacji rekrutacyjnej prezentującej miks energetyczny Wielkiej
Brytanii oraz najlepszy czas ładowania samochodu elektrycznego pod kątem udziału
czystej energii.

## Technologie

- React
- TypeScript
- Vite
- Recharts
- Lucide React
- Vitest
- Testing Library do testów komponentów React

## Wymagania

- Node.js 24+
- npm
- uruchomiony backend aplikacji, domyślnie http://localhost:3001

## Konfiguracja

Aby skonfigurować aplikacje należy skopiować plik .env z .env.example:

```bash
cp .env.example .env
```


## Uruchomienie lokalne

Aby uruchomić aplikacje należy mieć uruchomiony backend a potem uruchomić frontend:

```bash
npm install
npm run dev
```

Domyślny adres frontendu:

```text
http://localhost:5173
```

## Budowa aplikacji

Aplikacja frontendowa jest podzielona na dwie osobne strony:

### Energy Mix 
  Realizująca prezentacje danych o miksie energetycznym
  
  Posiadająca:
  - trzy wykresy kołowe dla dzisiaj, jutra i pojutrza
  - legenda kolorów na wykresie
  - procent udziału czystej energii dla każdego dnia

### Charging Time 
  Realizująca interfejs pokazująca optymalne okno ładowania
  Posiadająca:
- wybór czasu ładowania od 1 do 6 godzin
- prezentacja najlepszego okna ładowania: start, koniec i średni procent
  czystej energii


Obie strony mają obsługę stanów ładowania i błędów.

## Testy, lint i build

```bash
npm test
npm run lint
npm run build
```

Podgląd produkcyjnego buildu:

```bash
npm run preview
```


