export default Object.freeze({
  MAX_PHONE_SIZE: 768,
  revealJsCdnUrl: 'https://cdn.jsdelivr.net/npm/reveal.js@5.0.2/',
  githubURL: 'https://github.com/SYP-AHIF-2023-24-25/SolarDoc',
  githubVersionURL: 'https://github.com/SYP-AHIF-2023-24-25/SolarDoc/releases/tag',
  localStorageFileKey: 'file',
  localStorageShareURLIdKey: 'share-url-id',
  localStorageThemeKey: 'user-theme',
  localStorageAuthKey: 'user-auth',
  localStorageCurrUserKey: 'current-user',
  localStorageWelcomeShownKey: 'welcome-shown',
  sessionStorageChannelKey: 'cached-channels',
  loadingMessages: {
    loadingEditor: 'Loading editor...',
    openingFile: 'Opening file...',
    savingFileName: 'Saving file name...',
    uploadingFile: 'Uploading file...',
  },
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
    fileGone: {
      title: 'File not found',
      text: 'The file you are looking for does not exist or has been moved. Please check the file path and try again.',
    },
    successfullyOpenedSharedFile: {
      title: 'Shared File opened',
      text: 'The shared file has been successfully opened! Please note that you are not the owner of this file and without this URL you cannot access it again.',
    },
    newFile: {
      title: 'New file created',
      text:
        'A new file has been created in your local storage! Please note that only one concurrent file can be saved ' +
        'locally and you should save your file to avoid losing it.',
    },
    sharedFileIsOwnedByYou: {
      title: 'You are the owner of this file',
      text: 'You are the owner of this file and do not need to request access to it.',
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
  defaultFileContent:
    '= Welcome to SolarDoc\n' +
    ':revealjs_theme: dracula\n' +
    ':revealjs_progress: true\n' +
    '\n' +
    '== Getting Started\n' +
    '\n' +
    '*AsciiDoc* - a powerful, simple markup language.\n' +
    '\n' +
    '- Lightweight\n' +
    '- Converts to many formats\n' +
    '- Perfect for presentations!\n' +
    '\n' +
    '== Headings & Text Styles\n' +
    '\n' +
    '=== Subheading Example\n' +
    'Basic paragraph of text with **bold**, _italic_, and `monospaced` styles.\n' +
    '\n' +
    '== Lists\n' +
    '\n' +
    '. First ordered item\n' +
    '. Second ordered item\n' +
    '. Third ordered item\n' +
    '\n' +
    '* Unordered item A\n' +
    '* Unordered item B\n' +
    '\n' +
    '== Code Example\n' +
    '\n' +
    '[source,python]\n' +
    '----\n' +
    '# Simple Python function\n' +
    'def greet(name):\n' +
    '    return f"Hello, {name}!"\n' +
    'print(greet("AsciiDoc"))\n' +
    '----\n' +
    '\n' +
    '== Tables\n' +
    '\n' +
    '[cols="1,1,1", options="header"]\n' +
    '|===\n' +
    '| Header 1 | Header 2 | Header 3\n' +
    '| A1       | A2       | A3\n' +
    '| B1       | B2       | B3\n' +
    '|===\n' +
    '\n' +
    '== Images\n' +
    '\n' +
    'image::https://i0.wp.com/picjumbo.com/wp-content/uploads/portrait-of-a-cat-lying-in-a-sweater-free-image.jpeg?w=600&quality=80[width=800, align="center"]\n' +
    '\n' +
    '== Links\n' +
    '\n' +
    'https://asciidoctor.org[AsciiDoctor Site]\n' +
    '\n' +
    '== Enjoy!',
  saveStates: {
    shared: 'Shared File',
    local: 'Local File',
    server: 'Cloud File',
    unsavedChanges: 'Unsaved Changes',
  },
  version: 'v1.0.0-beta.6',
  copyright: 'Solardoc © 2023-2025 Luna Klatzer, Emma Walchshofer, Lisa Pichler',
})
