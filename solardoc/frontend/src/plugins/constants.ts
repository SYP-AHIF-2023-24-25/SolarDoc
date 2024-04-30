export default Object.freeze({
  githubURL: 'https://github.com/SYP-AHIF-2023-24-25/SolarDoc',
  githubVersionURL: 'https://github.com/SYP-AHIF-2023-24-25/SolarDoc/releases/tag',
  localStorageLastModifiedKey: 'last-modified',
  localStorageFileIdKey: 'file-id',
  localStorageFileNameKey: 'file-name',
  localStorageFileOwnerKey: 'file-owner',
  localStorageFileContentKey: 'file-content',
  localStorageThemeKey: 'user-theme',
  localStorageAuthKey: 'user-auth',
  localStorageCurrUserKey: 'current-user',
  localStorageWelcomeShownKey: 'welcome-shown',
  sessionStorageChannelKey: 'cached-channels',
  errorMessages: {
    'heading-space-missing-error': 'Error: Heading should have a space after the equal sign/s',
    'list-inconsistent-error': 'Error: Lists should be consistent (use either "." or "*")',
  },
  notifMessages: {
    welcome: {
      title: 'Welcome to SolarDoc!',
      text:
        'This is a collaborative editor for creating presentations. Try it out by typing something ' +
        'and viewing your newly generated presentation!',
    },
    fileSaved: {
      title: 'File saved',
      text: 'Your file has been saved successfully.',
    },
  } satisfies { [key: string]: {title: string, text: string}},
  version: 'v0.5.0',
})
