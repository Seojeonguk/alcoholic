// 공지 알림(#304)의 Android 알림 아이콘 · 색상 · 기본 채널 이름을 네이티브 설정에 넣음
// @react-native-firebase/messaging 플러그인은 AndroidManifest에 아이콘(@drawable/notification_icon) ·
// 색상(@color/notification_icon_color) 메타데이터만 넣고 리소스는 만들지 않아서 여기서 만듦
const fs = require('fs');
const path = require('path');

const {
  AndroidConfig,
  XML,
  withAndroidColors,
  withDangerousMod,
  withStringsXml,
} = require('expo/config-plugins');

// FCM이 채널을 따로 지정하지 않은 알림을 보낼 때 만드는 기본 채널의 이름 리소스
// 시스템 설정의 알림 채널 목록에 이 이름이 보임
const CHANNEL_LABEL_NAME = 'fcm_fallback_notification_channel_label';

const channelLabelItem = (label) =>
  AndroidConfig.Resources.buildResourceItem({ name: CHANNEL_LABEL_NAME, value: label });

// 흰색 단색 아이콘 한 장(96px)을 xxxhdpi에 두고 낮은 해상도는 시스템이 줄여서 씀
const withNotificationIcon = (config, icon, channelLabel) =>
  withDangerousMod(config, [
    'android',
    async (config) => {
      const resDir = await AndroidConfig.Paths.getResourceFolderAsync(
        config.modRequest.projectRoot
      );
      const drawableDir = path.join(resDir, 'drawable-xxxhdpi');
      await fs.promises.mkdir(drawableDir, { recursive: true });
      await fs.promises.copyFile(
        path.resolve(config.modRequest.projectRoot, icon),
        path.join(drawableDir, 'notification_icon.png')
      );

      // 라이브러리에 언어별 번역(values-ko)이 있으면 values만 바꿔서는 한국어 기기에 번역이 보임
      const koStringsPath = path.join(resDir, 'values-ko', 'strings.xml');
      await fs.promises.mkdir(path.dirname(koStringsPath), { recursive: true });
      const koStrings = await XML.readXMLAsync({
        path: koStringsPath,
        fallback: '<resources></resources>',
      });
      await XML.writeXMLAsync({
        path: koStringsPath,
        xml: AndroidConfig.Strings.setStringItem([channelLabelItem(channelLabel)], koStrings),
      });
      return config;
    },
  ]);

const withNotificationDefaults = (config, { icon, color, channelLabel }) => {
  config = withAndroidColors(config, (config) => {
    config.modResults = AndroidConfig.Colors.assignColorValue(config.modResults, {
      name: 'notification_icon_color',
      value: color,
    });
    return config;
  });
  config = withStringsXml(config, (config) => {
    config.modResults = AndroidConfig.Strings.setStringItem(
      [channelLabelItem(channelLabel)],
      config.modResults
    );
    return config;
  });
  return withNotificationIcon(config, icon, channelLabel);
};

module.exports = withNotificationDefaults;
