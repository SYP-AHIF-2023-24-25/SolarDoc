let unsecureWarningShown: boolean = false
function unsecuredCopyToClipboard(text: string) {
  if (!unsecureWarningShown) {
    console.warn(
      "Falling back to unsecure copy-to-clipboard function (Uses deprecated 'document.execCommand')",
    )
    unsecureWarningShown = true
  }

  const textArea = document.createElement('textarea')
  textArea.value = text
  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()
  try {
    // Deprecated, but there is no alternative for HTTP-only contexts
    document.execCommand('copy')
  } catch (err) {
    document.body.removeChild(textArea)
    throw new Error('[Editor] Unable to copy to clipboard. Cause: ' + err)
  }
  document.body.removeChild(textArea)
}

export async function handleCopy(toCopy: string) {
  if (navigator.clipboard) {
    // If normal copy method available, use it
    await navigator.clipboard.writeText(toCopy)
  } else {
    // Otherwise fallback to the above function
    unsecuredCopyToClipboard(toCopy)
  }
}
