import OpenAI from 'openai'
import * as vscode from 'vscode'

export function activate(context: vscode.ExtensionContext) {
  const client = new OpenAI({
    // apiKey: process.env.OPENAI_API_KEY,
    // organization: process.env.OPENAI_ORG,
    baseURL: 'http://localhost:1337/v1',
    apiKey: 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  })

  const disposable = vscode.commands.registerCommand(
    'ex-5.complete',
    async () => {
      const editor = vscode.window.activeTextEditor
      if (!editor) {
        return
      }
      const position = editor.selection.active
      const line = editor.document.lineAt(position.line)
      const textBeforeCursor = line.text.substring(0, position.character)

      const language = editor.document.languageId

      const completion = await client.chat.completions.create({
        model: 'llama3.2-3b-instruct',
        messages: [
          {
            role: 'system',
            content: `The input will contain a language ID, followed by a '#' separator and then some code. Respond only with code that completes the code sent by the user, to the best of your understanding. Respond in the programming language identified by the language ID, but do not include backticks and the language ID itself, only the code. Do not use backticks. Ever. Do not include the code in the response. Examples (ignoring the language ID):

              Input: function add(a, b)
              Response: { return a + b }

              Input: function printLol
              Response: () { console.log('lol') }
              `,
          },
          { role: 'user', content: language + '#' + textBeforeCursor },
        ],
      })
      const text = completion.choices[0].message.content
      if (!text) {
        return
      }
      editor.edit((editBuilder) => {
        editBuilder.insert(position, text)
      })
    }
  )

  context.subscriptions.push(disposable)
}

export function deactivate() {}
