import React from 'react';
import { Image, Platform, Text } from 'react-native';

// Простые символы вместо иконок там где нужна чёткость на малых размерах
const TEXT_ICONS = {
  'chevron-back':    '‹',
  'chevron-forward': '›',
};

const icons = {
  'alert-circle-outline':        require('../../assets/icons/alert-circle-outline.png'),
  'aperture':                    require('../../assets/icons/aperture.png'),
  'arrow-back-circle-outline':   require('../../assets/icons/arrow-back-circle-outline.png'),
  'arrow-forward-circle-outline':require('../../assets/icons/arrow-forward-circle-outline.png'),
  'bar-chart-outline':           require('../../assets/icons/bar-chart-outline.png'),
  'body-outline':                require('../../assets/icons/body-outline.png'),
  'book':                        require('../../assets/icons/book.png'),
  'book-outline':                require('../../assets/icons/book-outline.png'),
  'bookmark-outline':            require('../../assets/icons/bookmark-outline.png'),
  'bulb-outline':                require('../../assets/icons/bulb-outline.png'),
  'chatbubbles-outline':         require('../../assets/icons/chatbubbles-outline.png'),
  'checkmark':                   require('../../assets/icons/checkmark.png'),
  'checkmark-circle':            require('../../assets/icons/checkmark-circle.png'),
  'chevron-back':                require('../../assets/icons/chevron-back.png'),
  'chevron-forward':             require('../../assets/icons/chevron-forward.png'),
  'close':                       require('../../assets/icons/close.png'),
  'cloud-outline':               require('../../assets/icons/cloud-outline.png'),
  'color-wand':                  require('../../assets/icons/color-wand.png'),
  'compass-outline':             require('../../assets/icons/compass-outline.png'),
  'construct-outline':           require('../../assets/icons/construct-outline.png'),
  'cube-outline':                require('../../assets/icons/cube-outline.png'),
  'cut':                         require('../../assets/icons/cut.png'),
  'flame':                       require('../../assets/icons/flame.png'),
  'flame-outline':               require('../../assets/icons/flame-outline.png'),
  'flash-outline':               require('../../assets/icons/flash-outline.png'),
  'flask-outline':               require('../../assets/icons/flask-outline.png'),
  'footsteps':                   require('../../assets/icons/footsteps.png'),
  'git-branch-outline':          require('../../assets/icons/git-branch-outline.png'),
  'glasses-outline':             require('../../assets/icons/glasses-outline.png'),
  'hammer-outline':              require('../../assets/icons/hammer-outline.png'),
  'heart-outline':               require('../../assets/icons/heart-outline.png'),
  'help-circle-outline':         require('../../assets/icons/help-circle-outline.png'),
  'home-outline':                require('../../assets/icons/home-outline.png'),
  'infinite':                    require('../../assets/icons/infinite.png'),
  'leaf':                        require('../../assets/icons/leaf.png'),
  'library-outline':             require('../../assets/icons/library-outline.png'),
  'link-outline':                require('../../assets/icons/link-outline.png'),
  'lock-closed':                 require('../../assets/icons/lock-closed.png'),
  'lock-closed-outline':         require('../../assets/icons/lock-closed-outline.png'),
  'mail-outline':                require('../../assets/icons/mail-outline.png'),
  'map-outline':                 require('../../assets/icons/map-outline.png'),
  'medal-outline':               require('../../assets/icons/medal-outline.png'),
  'mic-outline':                 require('../../assets/icons/mic-outline.png'),
  'navigate-outline':            require('../../assets/icons/navigate-outline.png'),
  'pencil-outline':              require('../../assets/icons/pencil-outline.png'),
  'people-circle-outline':       require('../../assets/icons/people-circle-outline.png'),
  'person-circle-outline':       require('../../assets/icons/person-circle-outline.png'),
  'planet':                      require('../../assets/icons/planet.png'),
  'planet-outline':              require('../../assets/icons/planet-outline.png'),
  'pulse-outline':               require('../../assets/icons/pulse-outline.png'),
  'repeat-outline':              require('../../assets/icons/repeat-outline.png'),
  'ribbon':                      require('../../assets/icons/ribbon.png'),
  'ribbon-outline':              require('../../assets/icons/ribbon-outline.png'),
  'rose-outline':                require('../../assets/icons/rose-outline.png'),
  'scale-outline':               require('../../assets/icons/scale-outline.png'),
  'search-outline':              require('../../assets/icons/search-outline.png'),
  'shield':                      require('../../assets/icons/shield.png'),
  'shield-half-outline':         require('../../assets/icons/shield-half-outline.png'),
  'shield-outline':              require('../../assets/icons/shield-outline.png'),
  'sparkles':                    require('../../assets/icons/sparkles.png'),
  'sparkles-outline':            require('../../assets/icons/sparkles-outline.png'),
  'speedometer-outline':         require('../../assets/icons/speedometer-outline.png'),
  'star':                        require('../../assets/icons/star.png'),
  'star-outline':                require('../../assets/icons/star-outline.png'),
  'sunny-outline':               require('../../assets/icons/sunny-outline.png'),
  'sync-circle-outline':         require('../../assets/icons/sync-circle-outline.png'),
  'text-outline':                require('../../assets/icons/text-outline.png'),
  'trophy-outline':              require('../../assets/icons/trophy-outline.png'),
  'volume-medium-outline':       require('../../assets/icons/volume-medium-outline.png'),
  'walk-outline':                require('../../assets/icons/walk-outline.png'),
  'warning-outline':             require('../../assets/icons/warning-outline.png'),
  'water-outline':               require('../../assets/icons/water-outline.png'),
};

// На web mix-blend-mode:multiply делает пергаментный фон иконки прозрачным
const aliases = {
  'hand-left-outline':   'bulb-outline',
  'battery-half-outline':'flash-outline',
  'business-outline':    'library-outline',
  'ellipse-outline':     'planet-outline',
  'git-commit-outline':  'git-branch-outline',
  'git-merge-outline':   'git-branch-outline',
  'git-network-outline': 'git-branch-outline',
  'leaf-outline':        'leaf',
  'restaurant-outline':  'flask-outline',
};

export default function Icon({ name, size = 24, blend = true, color, style }) {
  if (TEXT_ICONS[name]) {
    return (
      <Text style={[{ fontSize: size * 1.4, lineHeight: size * 1.6, color: color || '#b8975a', fontWeight: '300' }, style]}>
        {TEXT_ICONS[name]}
      </Text>
    );
  }
  const resolvedName = aliases[name] || name;
  const source = icons[resolvedName];
  if (!source) return null;
  const blendStyle = blend && Platform.OS === 'web' ? { mixBlendMode: 'multiply' } : {};
  return (
    <Image
      source={source}
      style={[{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden' }, blendStyle, style]}
      resizeMode="contain"
    />
  );
}
