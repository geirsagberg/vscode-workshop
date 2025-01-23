import * as vscode from 'vscode'

export function activate(context: vscode.ExtensionContext) {
  const disposable = loremIpsum()

  context.subscriptions.push(disposable)
}

const text =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'

// This method is called when your extension is deactivated
export function deactivate() {}

function loremIpsum() {
  return vscode.commands.registerCommand('ex-3.loremIpsum', async () => {
    const editor = vscode.window.activeTextEditor
    if (!editor) {
      return
    }

    const position = editor.selection.active
    const line = editor.document.lineAt(position)
    const lastElevenChars = line.text.slice(
      position.character - 11,
      position.character
    )
    if (lastElevenChars.toLowerCase() !== 'lorem ipsum') {
      // Perform default action for Tab
      vscode.commands.executeCommand('default:type', { text: '\t' })
      return
    }

    await editor.edit((editBuilder) => {
      editBuilder.replace(
        new vscode.Range(
          position.line,
          position.character - 11,
          position.line,
          position.character + 11
        ),
        text
      )
    })
  })
}
