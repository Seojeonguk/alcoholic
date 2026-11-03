// 공지 알림(#304) 설정을 기기에 저장하는 값과 그 값을 해석하는 함수
// AsyncStorage에는 문자열만 들어가서 '1' · '0'으로 저장함

const ANNOUNCEMENT_TOPIC = 'announcements';
const ANNOUNCEMENTS_KEY = 'announcementsEnabled';
// 첫 기록을 저장한 뒤 알림을 받을지 한 번만 물어보려고 물어봤는지 남겨 둠
const ANNOUNCEMENTS_ASKED_KEY = 'announcementsAsked';

// 저장된 값이 없으면(처음 설치 · 아직 고르지 않음) 꺼진 것으로 봄. 사용자가 켜야만 구독함
const isAnnouncementsEnabled = (stored) => stored === '1';

const toStoredValue = (enabled) => (enabled ? '1' : '0');

// 첫 기록 저장 뒤에 물어볼지: 아직 묻지 않았고, 사용자가 설정에서 직접 켜거나 끈 적도 없을 때만
const shouldAskAnnouncements = ({ asked, stored }) => asked !== '1' && stored == null;

export {
  ANNOUNCEMENT_TOPIC,
  ANNOUNCEMENTS_ASKED_KEY,
  ANNOUNCEMENTS_KEY,
  isAnnouncementsEnabled,
  shouldAskAnnouncements,
  toStoredValue,
};
