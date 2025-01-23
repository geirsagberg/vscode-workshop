import * as vscode from 'vscode'
import { CSS_COLORS } from './css-colors'

export function activate(context: vscode.ExtensionContext) {
  const [changeSubscription, editorSubscription] = decorateColors()

  context.subscriptions.push(changeSubscription, editorSubscription)
}

export function deactivate() {}

function decorateColors() {
  const colorDecorator = vscode.window.createTextEditorDecorationType({})
  let timeoutId: NodeJS.Timeout | undefined

  // Debounced async update function
  function debouncedUpdate(editor: vscode.TextEditor) {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(async () => {
      await updateDecorationsAsync(editor)
    }, 100) // Wait 100ms after last change before updating
  }

  // Async update function
  async function updateDecorationsAsync(editor: vscode.TextEditor) {
    return new Promise<void>((resolve) => {
      // Run in next tick to avoid blocking
      setImmediate(() => {
        const text = editor.document.getText()
        const decorations: vscode.DecorationOptions[] = []
        const colorRegex = new RegExp(
          `\\b(${Array.from(CSS_COLORS).join('|')})\\b`,
          'gi'
        )
        let match

        while ((match = colorRegex.exec(text))) {
          const startPos = editor.document.positionAt(match.index)
          const endPos = editor.document.positionAt(
            match.index + match[0].length
          )
          const decoration: vscode.DecorationOptions = {
            range: new vscode.Range(startPos, endPos),
            renderOptions: {
              after: {
                backgroundColor: match[0].toLowerCase(),
                contentText: ' ',
              },
            },
          }
          decorations.push(decoration)
        }

        editor.setDecorations(colorDecorator, decorations)
        resolve()
      })
    })
  }

  // Initial load
  if (vscode.window.activeTextEditor) {
    debouncedUpdate(vscode.window.activeTextEditor)
  }

  // Text change subscription
  const changeSubscription = vscode.workspace.onDidChangeTextDocument(
    (event) => {
      if (event.document === vscode.window.activeTextEditor?.document) {
        debouncedUpdate(vscode.window.activeTextEditor)
      }
    }
  )

  // Editor change subscription
  const editorSubscription = vscode.window.onDidChangeActiveTextEditor(
    (editor) => {
      if (editor) {
        debouncedUpdate(editor)
      }
    }
  )

  return [changeSubscription, editorSubscription]
}
