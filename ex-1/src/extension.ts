import * as vscode from 'vscode'

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(reverseLine())
}

export function deactivate() {}

function reverseLine() {
  return vscode.commands.registerCommand('ex-1.reverseLine', async () => {
    const editor = vscode.window.activeTextEditor
    if (!editor) {
      return
    }

    const selection = editor.selection

    // If there is selected text
    if (!selection.isEmpty) {
      const selectedText = editor.document.getText(selection)
      const lines = selectedText.split('\n')
      const reversedLines = lines.map((line) =>
        line.split('').reverse().join('')
      )
      const reversedText = reversedLines.join('\n')

      await editor.edit((editBuilder) => {
        editBuilder.replace(selection, reversedText)
      })
      return
    }

    // Original behavior when no text is selected
    const position = editor.selection.active
    const line = editor.document.lineAt(position.line)
    const textBeforeCursor = line.text.substring(0, position.character)
    const reversedText = textBeforeCursor.split('').reverse().join('')

    await editor.edit((editBuilder) => {
      const range = new vscode.Range(
        new vscode.Position(position.line, 0),
        position
      )
      editBuilder.replace(range, reversedText)
    })

    // Execute the default Enter key behavior
    await vscode.commands.executeCommand('default:type', { text: '\n' })
  })
}
