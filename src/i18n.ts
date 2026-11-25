export type Locale = "en" | "de";

export interface Messages {
  appTitle: string;
  home: string;
  guest: string;
  undo: string;
  settings: string;
  addMatchResult: string;
  newMatchResult: string;
  editMatch: (homeName: string, guestName: string) => string;
  saveMatchResult: string;
  updateMatchResult: string;
  gameScoreInput: (gameNumber: number, teamName: string) => string;
  addGame: string;
  removeGame: (gameNumber: number) => string;
  deleteMatch: (homeName: string, guestName: string) => string;
  confirmDeleteMatch: (homeName: string, guestName: string) => string;
  tiedGameScore: string;
  language: string;
  switchToEnglish: string;
  switchToGerman: string;
  enterFullscreen: string;
  exitFullscreen: string;
  closeSettings: string;
  discipline: string;
  noDiscipline: string;
  gameMode: string;
  customMode: string;
  confirmModeSwitch: string;
  modeSwitchWarning: string;
  cancel: string;
  changeMode: string;
  pastMatches: string;
  resetScoreAndHistory: string;
  confirmReset: string;
  resetWarning: string;
  reset: string;
  scoreLabel: (teamName: string, score: number) => string;
  gamesIndicator: (left: number, right: number) => string;
  switchSides: string;
  completedGameScores: string;
  matchWon: (teamName: string) => string;
  newMatch: string;
  nextGame: (gameNumber: number) => string;
  historyBack: string;
  historyTitle: string;
  historyEmpty: string;
  versus: string;
  historyTableLabel: string;
  startTime: string;
  endTime: string;
  historyBackLabel: string;
}

type TranslationCatalog = {
  [Key in keyof Messages]: Record<Locale, Messages[Key]>;
};

export const translations = {
  appTitle: {
    en: "Badminton Scoreboard",
    de: "Badminton-Spielstand",
  },
  home: {
    en: "Home",
    de: "Heim",
  },
  guest: {
    en: "Guest",
    de: "Gast",
  },
  undo: {
    en: "Undo last action",
    de: "Letzte Aktion rückgängig machen",
  },
  settings: {
    en: "Settings",
    de: "Einstellungen",
  },
  addMatchResult: {
    en: "Add result",
    de: "Ergebnis hinzufügen",
  },
  newMatchResult: {
    en: "Add match result",
    de: "Match-Ergebnis eintragen",
  },
  editMatch: {
    en: (homeName: string, guestName: string) =>
      `Edit ${homeName} vs ${guestName}`,
    de: (homeName: string, guestName: string) =>
      `${homeName} gegen ${guestName} bearbeiten`,
  },
  saveMatchResult: {
    en: "Save result",
    de: "Ergebnis speichern",
  },
  updateMatchResult: {
    en: "Update result",
    de: "Ergebnis aktualisieren",
  },
  gameScoreInput: {
    en: (gameNumber: number, teamName: string) =>
      `Game ${gameNumber} ${teamName} points`,
    de: (gameNumber: number, teamName: string) =>
      `Satz ${gameNumber}: Punkte ${teamName}`,
  },
  addGame: {
    en: "Add game",
    de: "Satz hinzufügen",
  },
  removeGame: {
    en: (gameNumber: number) => `Remove game ${gameNumber}`,
    de: (gameNumber: number) => `Satz ${gameNumber} entfernen`,
  },
  deleteMatch: {
    en: (homeName: string, guestName: string) =>
      `Delete ${homeName} vs ${guestName}`,
    de: (homeName: string, guestName: string) =>
      `${homeName} gegen ${guestName} löschen`,
  },
  confirmDeleteMatch: {
    en: (homeName: string, guestName: string) =>
      `Delete the match result for ${homeName} vs ${guestName}?`,
    de: (homeName: string, guestName: string) =>
      `Das Matchergebnis ${homeName} gegen ${guestName} löschen?`,
  },
  tiedGameScore: {
    en: "Completed games cannot have tied scores.",
    de: "Abgeschlossene Sätze können keinen Gleichstand haben.",
  },
  language: {
    en: "Language",
    de: "Sprache",
  },
  switchToEnglish: {
    en: "Switch to English",
    de: "Zu Englisch wechseln",
  },
  switchToGerman: {
    en: "Switch to German",
    de: "Zu Deutsch wechseln",
  },
  enterFullscreen: {
    en: "Enter fullscreen",
    de: "Vollbild aktivieren",
  },
  exitFullscreen: {
    en: "Exit fullscreen",
    de: "Vollbild verlassen",
  },
  closeSettings: {
    en: "Close settings",
    de: "Einstellungen schließen",
  },
  discipline: {
    en: "Discipline",
    de: "Disziplin",
  },
  noDiscipline: {
    en: "None",
    de: "Keine",
  },
  gameMode: {
    en: "Game mode",
    de: "Spielmodus",
  },
  customMode: {
    en: "Custom",
    de: "Benutzerdefiniert",
  },
  confirmModeSwitch: {
    en: "Confirm mode change",
    de: "Moduswechsel bestätigen",
  },
  modeSwitchWarning: {
    en: "Changing the mode resets the score and history. Continue?",
    de: "Ein Moduswechsel setzt Spielstand und Historie zurück. Fortfahren?",
  },
  cancel: {
    en: "Cancel",
    de: "Abbrechen",
  },
  changeMode: {
    en: "Change mode",
    de: "Modus wechseln",
  },
  pastMatches: {
    en: "Past matches",
    de: "Vergangene Matches",
  },
  resetScoreAndHistory: {
    en: "Reset score and history",
    de: "Spielstand und Historie zurücksetzen",
  },
  confirmReset: {
    en: "Confirm reset",
    de: "Reset bestätigen",
  },
  resetWarning: {
    en: "Are you sure you want to reset the score and all history?",
    de: "Spielstand und gesamte Historie wirklich zurücksetzen?",
  },
  reset: {
    en: "Reset",
    de: "Zurücksetzen",
  },
  scoreLabel: {
    en: (teamName: string, score: number) => `${teamName} score: ${score}`,
    de: (teamName: string, score: number) => `${teamName}: ${score}`,
  },
  gamesIndicator: {
    en: (left: number, right: number) => `Games: left ${left}, right ${right}`,
    de: (left: number, right: number) =>
      `Spiele: links ${left}, rechts ${right}`,
  },
  switchSides: {
    en: "Switch home and guest sides",
    de: "Heim und Gast tauschen",
  },
  completedGameScores: {
    en: "Scores of completed games",
    de: "Ergebnisse abgeschlossener Spiele",
  },
  matchWon: {
    en: (teamName: string) => `Match won: ${teamName}`,
    de: (teamName: string) => `Match gewonnen: ${teamName}`,
  },
  newMatch: {
    en: "New match",
    de: "Neues Match",
  },
  nextGame: {
    en: (gameNumber: number) => `${gameNumber}. Game`,
    de: (gameNumber: number) => `${gameNumber}. Satz`,
  },
  historyBack: {
    en: "Back to scoreboard",
    de: "Zurück zum Spielstand",
  },
  historyTitle: {
    en: "Past matches",
    de: "Vergangene Matches",
  },
  historyEmpty: {
    en: "No completed matches yet",
    de: "Noch keine abgeschlossenen Matches",
  },
  versus: {
    en: "vs",
    de: "gegen",
  },
  historyTableLabel: {
    en: "Scores by team, games in chronological order",
    de: "Spielstände je Team, Spiele in chronologischer Reihenfolge",
  },
  startTime: {
    en: "Start",
    de: "Beginn",
  },
  endTime: {
    en: "End",
    de: "Ende",
  },
  historyBackLabel: {
    en: "Scoreboard",
    de: "Spielstand",
  },
} satisfies TranslationCatalog;

export function getMessages(locale: Locale): Messages {
  return Object.fromEntries(
    Object.entries(translations).map(([key, localizedValues]) => [
      key,
      localizedValues[locale],
    ]),
  ) as unknown as Messages;
}

export const disciplineCodes = [
  "HD1",
  "HD2",
  "DD",
  "HE1",
  "HE2",
  "DE",
  "HE3",
  "MX",
] as const;

type DisciplineCode = (typeof disciplineCodes)[number];

const disciplineTranslations = {
  HD1: {
    en: "MD1",
    de: "HD1",
  },
  HD2: {
    en: "MD2",
    de: "HD2",
  },
  DD: {
    en: "WD",
    de: "DD",
  },
  HE1: {
    en: "MS1",
    de: "HE1",
  },
  HE2: {
    en: "MS2",
    de: "HE2",
  },
  DE: {
    en: "WS",
    de: "DE",
  },
  HE3: {
    en: "MS3",
    de: "HE3",
  },
  MX: {
    en: "XD",
    de: "MX",
  },
} satisfies Record<DisciplineCode, Record<Locale, string>>;

export function translateDiscipline(
  discipline: string,
  locale: Locale,
): string {
  return (
    disciplineTranslations[discipline as DisciplineCode]?.[locale] ?? discipline
  );
}

export function resolveLocale(language?: string): Locale {
  const normalizedLanguage = language?.toLowerCase();
  return normalizedLanguage === "de" || normalizedLanguage?.startsWith("de-")
    ? "de"
    : "en";
}

export const LOCALE_STORAGE_KEY = "badminton-scoreboard:locale";

export function getLocale(): Locale {
  if (typeof window !== "undefined") {
    try {
      const savedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY);
      if (savedLocale === "en" || savedLocale === "de") {
        return savedLocale;
      }
    } catch {
      // Fall back to the browser language when storage is unavailable.
    }
  }

  return resolveLocale(
    typeof navigator === "undefined" ? undefined : navigator.language,
  );
}

export function saveLocale(locale: Locale): void {
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // The language selection still applies for the current page when storage is unavailable.
  }
}
