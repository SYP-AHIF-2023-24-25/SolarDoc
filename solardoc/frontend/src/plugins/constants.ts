export default Object.freeze({
  githubURL: 'https://github.com/SYP-AHIF-2023-24-25/SolarDoc',
  githubVersionURL: 'https://github.com/SYP-AHIF-2023-24-25/SolarDoc/releases/tag',
  localStorageLastModifiedKey: 'last-modified',
  localStorageFileIdKey: 'file-id',
  localStorageFileNameKey: 'file-name',
  localStorageFileOwnerKey: 'file-owner',
  localStorageFileContentKey: 'file-content',
  localStorageFilePermissionsKey: 'file-permissions',
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
    fileUploaded: {
      title: 'File uploaded and saved',
      text: "Your file has been uploaded successfully. To save a new version, click 'Save in profile'.",
    },
    newFile: {
      title: 'New file created',
      text:
        "A new file has been created in your local storage! Please click 'Save in profile' to save this file " +
        'on the server if you wish to do so!',
    },
    loggedOut: {
      title: 'You have been successfully logged out',
      text:
        'Your local file has been not uploaded and as such can be still edited. Please log in again in case you ' +
        'wish to save it on the server!',
    },
    loggedOutAndFileCleared: {
      title: 'You have been successfully logged out',
      text:
        'For security reasons your currently opened file has been cleared and a new local file has been created. ' +
        'Log in again to continue working!',
    },
  } satisfies { [key: string]: { title: string; text: string } },
  defaultFileName: 'untitled.adoc',
  defaultFileContent: '= Welcome to SolarDoc! \n\n== Your AsciiDoc web-editor °^°',
  saveStates: {
    local: 'Saved Locally',
    server: 'Saved Remotely',
    unsavedChanges: 'Unsaved Changes',
  },
  version: 'v0.7.0-dev',
  copyright: 'Solardoc © 2023-2024 Luna Klatzer, Emma Walchshofer, Lisa Pichler',
})
