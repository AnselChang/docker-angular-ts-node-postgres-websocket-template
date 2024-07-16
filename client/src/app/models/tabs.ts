export enum TabID {
    MY_PROFILE = 'profile',
    FRIENDS = 'friends',
    ALERTS = 'alerts',
    HOME = 'home',
    PLAY = 'play',
    REVIEW = 'review',
    PUZZLES = 'puzzles',
    LEADERBOARD = 'leaderboard',
    MORE = 'more',

    // fullscreen tabs
    SOLO = 'solo',
    MULTIPLAYER = 'multiplayer',
    PLAY_PUZZLE = 'puzzle',
}

const IS_TAB_FULLSCREEN: {[key in TabID]: boolean} = {
    [TabID.MY_PROFILE]: false,
    [TabID.FRIENDS]: false,
    [TabID.ALERTS]: false,
    [TabID.HOME]: false,
    [TabID.PLAY]: false,
    [TabID.REVIEW]: false,
    [TabID.PUZZLES]: false,
    [TabID.LEADERBOARD]: false,
    [TabID.MORE]: false,
    [TabID.SOLO]: true,
    [TabID.MULTIPLAYER]: true,
    [TabID.PLAY_PUZZLE]: true,
};

export const isTabFullscreen = (tab: TabID): boolean => IS_TAB_FULLSCREEN[tab];
  
export type ParametrizedTab = {
    tab: TabID,
    params: URLSearchParams | undefined,
};

const TAB_DISPLAY_NAMES: {[key in TabID]: string} = {
    [TabID.MY_PROFILE]: 'My Profile',
    [TabID.FRIENDS]: 'Friends',
    [TabID.ALERTS]: 'Alerts',
    [TabID.HOME]: 'Home',
    [TabID.PLAY]: 'Play',
    [TabID.REVIEW]: 'Review',
    [TabID.PUZZLES]: 'Puzzles',
    [TabID.LEADERBOARD]: 'Leaderboard',
    [TabID.MORE]: 'More',
    [TabID.SOLO]: 'Solo',
    [TabID.MULTIPLAYER]: 'Multiplayer',
    [TabID.PLAY_PUZZLE]: 'Play Puzzle',
};
export const getTabDisplayName = (tab: TabID): string => TAB_DISPLAY_NAMES[tab];

const TAB_ICONS: {[key in TabID]?: string} = {
    [TabID.MY_PROFILE]: 'profile.svg',
    [TabID.FRIENDS]: 'friends.svg',
    [TabID.ALERTS]: 'alerts.svg',
    [TabID.HOME]: 'home.svg',
    [TabID.PLAY]: 'play.svg',
    [TabID.REVIEW]: 'review.svg',
    [TabID.PUZZLES]: 'puzzles.svg',
    [TabID.LEADERBOARD]: 'leaderboard.svg',
    [TabID.MORE]: 'more.svg',
};

const TAB_BADGE_ICONS: {[key in TabID]?: string} = {
    [TabID.FRIENDS]: 'friends-badge.svg',
    [TabID.ALERTS]: 'alerts-badge.svg',
}

export const getTabIcon = (tab: TabID): string => "./assets/img/tab-icons/" + TAB_ICONS[tab];

// if there is a badge version of the icon, use that, otherwise use the regular icon
export const getTabBadgeIcon = (tab: TabID): string => (TAB_BADGE_ICONS[tab] ? "./assets/img/tab-icons/" + TAB_BADGE_ICONS[tab] : getTabIcon(tab));